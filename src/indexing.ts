import { hexToRgba } from './conversions/hex';
import { squaredDistanceRgb } from './math/euclideanDistance';
import type { Colorspace, HexColor, Rgba } from './types';

/**
 * Name normalization and per-colorspace lookup indexes.
 *
 * Tree-shaking note: this module never imports colorspace data itself.
 * Callers pass their own colorspace in, so importing (say) `pantoneToRgba`
 * never drags in `web` or `x11` through here.
 *
 * Caches are keyed by the colorspace object reference (WeakMap), so each
 * colorspace's index is built once per process and reused by every caller.
 */

export type NormalizeFn = (name: string) => string;

/** Lowercase + strip non-alphanumeric. Used for web and x11. */
export const standardNormalize: NormalizeFn = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Pantone: also strip a leading "Pantone" or "PMS" prefix so that
 * "185 C", "185c", "Pantone 185 C", "PMS185C" all map to "185c".
 */
export const pantoneNormalize: NormalizeFn = (s) =>
  s
    .toLowerCase()
    .replace(/^(pantone|pms)\s*/, '')
    .replace(/[^a-z0-9]/g, '');

const nameIndexCache = new WeakMap<Colorspace, Map<string, string>>();
const rgbaIndexCache = new WeakMap<Colorspace, Array<readonly [string, Rgba]>>();

/**
 * Normalized-name → canonical-key map for a given colorspace.
 * Each (colorspace, normalize) pair must be stable — callers are
 * expected to always pair a given colorspace with the same normalizer.
 */
export function getNameIndex(space: Colorspace, normalize: NormalizeFn): Map<string, string> {
  let idx = nameIndexCache.get(space);
  if (idx === undefined) {
    idx = new Map();
    for (const key of Object.keys(space)) {
      idx.set(normalize(key), key);
    }
    nameIndexCache.set(space, idx);
  }
  return idx;
}

/**
 * Canonical-key → Rgba entries for a given colorspace, built by parsing
 * each hex value once. Used by nearest-match lookups (identify, rgbaToPantone).
 */
export function getRgbaIndex(space: Colorspace): Array<readonly [string, Rgba]> {
  let idx = rgbaIndexCache.get(space);
  if (idx === undefined) {
    idx = Object.entries(space).map(([name, hex]) => [name, hexToRgba(hex as HexColor)] as const);
    rgbaIndexCache.set(space, idx);
  }
  return idx;
}

/**
 * Find the nearest-named entry in a colorspace to the given Rgba, using
 * squared Euclidean distance in RGB (alpha ignored). Used by `identify`
 * and `rgbaToPantone`. Returns an empty string only for an empty colorspace.
 */
export function nearestByRgb(target: Rgba, space: Colorspace): string {
  const entries = getRgbaIndex(space);
  let bestName = entries[0]?.[0] ?? '';
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [name, candidate] of entries) {
    const d = squaredDistanceRgb(target, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      bestName = name;
    }
  }
  return bestName;
}
