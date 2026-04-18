import { hexToRgba } from './conversions/hex';
import { rgbaToLab, rgbaToLinearRgb } from './math/colorSpace';
import { deltaE76Squared, deltaE94, deltaE2000 } from './math/deltaE';
import { squaredDistanceRgb } from './math/euclideanDistance';
import type { Colorspace, DistanceMetric, HexColor, Rgba } from './types';

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
 * squared Euclidean distance in sRGB (alpha ignored). Used by `identify`
 * and `rgbaToPantone` when metric === 'euclidean-srgb'.
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

// Precomputed Lab entries for delta-E metrics. Same shape as rgba index.
type LabTriple = readonly [number, number, number];
const labIndexCache = new WeakMap<Colorspace, Array<readonly [string, LabTriple]>>();

function getLabIndex(space: Colorspace): Array<readonly [string, LabTriple]> {
  let idx = labIndexCache.get(space);
  if (idx === undefined) {
    idx = getRgbaIndex(space).map(([name, rgba]) => [name, rgbaToLab(rgba)] as const);
    labIndexCache.set(space, idx);
  }
  return idx;
}

// Precomputed linear-RGB entries for euclidean-linear metric.
const linearIndexCache = new WeakMap<Colorspace, Array<readonly [string, LabTriple]>>();

function getLinearIndex(space: Colorspace): Array<readonly [string, LabTriple]> {
  let idx = linearIndexCache.get(space);
  if (idx === undefined) {
    idx = getRgbaIndex(space).map(([name, rgba]) => [name, rgbaToLinearRgb(rgba)] as const);
    linearIndexCache.set(space, idx);
  }
  return idx;
}

/**
 * Generic argmin over an `[name, value]` entries array with a custom
 * distance function. Factored so the three metric branches in `nearest`
 * share one loop body instead of duplicating it three times.
 */
function argminBy<T>(
  entries: Array<readonly [string, T]>,
  target: T,
  dist: (a: T, b: T) => number,
): string {
  let bestName = entries[0]?.[0] ?? '';
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [name, candidate] of entries) {
    const d = dist(target, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      bestName = name;
    }
  }
  return bestName;
}

// Squared Euclidean on a [number, number, number] triple. Used for the
// linear-RGB metric (sharing shape with Lab but different meaning).
function squaredDistanceTriple(a: LabTriple, b: LabTriple): number {
  const d0 = a[0] - b[0];
  const d1 = a[1] - b[1];
  const d2 = a[2] - b[2];
  return d0 * d0 + d1 * d1 + d2 * d2;
}

/**
 * Find the nearest-named entry in a colorspace under the specified distance
 * metric. Dispatches to the right index (rgba / linear-rgb / Lab) and
 * the right distance function. See `DistanceMetric` in types.ts for how
 * to pick a metric.
 */
export function nearest(
  target: Rgba,
  space: Colorspace,
  metric: DistanceMetric = 'euclidean-srgb',
): string {
  if (metric === 'euclidean-srgb') return nearestByRgb(target, space);
  if (metric === 'euclidean-linear') {
    return argminBy(getLinearIndex(space), rgbaToLinearRgb(target), squaredDistanceTriple);
  }
  const labTarget = rgbaToLab(target);
  const labIndex = getLabIndex(space);
  if (metric === 'deltaE76') return argminBy(labIndex, labTarget, deltaE76Squared);
  if (metric === 'deltaE94') return argminBy(labIndex, labTarget, deltaE94);
  return argminBy(labIndex, labTarget, deltaE2000);
}
