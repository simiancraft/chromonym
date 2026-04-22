import { hexToRgba } from './conversions/hex.js';
import { rgbaToLab, rgbaToLinearRgb, rgbaToOklab } from './math/colorSpace.js';
import { deltaE76Squared, deltaE94, deltaE2000, deltaEokSquared } from './math/deltaE.js';
import { squaredDistanceRgb } from './math/euclideanDistance.js';
import type { DistanceMetric, Palette, Rgba } from './types.js';

/**
 * Per-palette lookup indexes for name resolution and nearest-match.
 *
 * Caches are keyed by the Palette wrapper (WeakMap), so each palette's
 * indexes are built once per process and reused by every caller —
 * including BYO palettes the user supplies.
 */

type AnyPalette = Palette<string>;

const nameIndexCache = new WeakMap<AnyPalette, Map<string, string>>();
const rgbaIndexCache = new WeakMap<AnyPalette, Array<readonly [string, Rgba]>>();

/**
 * Normalized-name → canonical-key map for a given palette. Built once
 * per palette using its own `normalize` function.
 */
export function getNameIndex(space: AnyPalette): Map<string, string> {
  let idx = nameIndexCache.get(space);
  if (idx === undefined) {
    idx = new Map();
    const { normalize } = space;
    for (const key of Object.keys(space.colors)) {
      idx.set(normalize(key), key);
    }
    nameIndexCache.set(space, idx);
  }
  return idx;
}

const reverseIndexCache = new WeakMap<AnyPalette, Map<string, string>>();

/**
 * Hex → canonical-key map (reverse of `palette.colors`). Built once per
 * palette. Used by `convert(color, { palette, format: 'NAME' })` for
 * O(1) exact reverse lookup. Returns `undefined` on miss — the caller
 * decides whether that's an error (convert throws; use `identify` for
 * nearest-match semantics).
 *
 * Hex values are lowercased for the key so callers can normalize their
 * input with `rgbaToHex(...).toLowerCase()` before lookup.
 */
export function getReverseNameIndex(space: AnyPalette): Map<string, string> {
  let idx = reverseIndexCache.get(space);
  if (idx === undefined) {
    idx = new Map();
    for (const [name, hex] of Object.entries(space.colors)) {
      idx.set((hex as string).toLowerCase(), name);
    }
    reverseIndexCache.set(space, idx);
  }
  return idx;
}

/**
 * Canonical-key → Rgba entries for a given palette, built by parsing
 * each hex value once. Used by nearest-match lookups (identify, rgbaToPantone).
 */
function getRgbaIndex(space: AnyPalette): Array<readonly [string, Rgba]> {
  let idx = rgbaIndexCache.get(space);
  if (idx === undefined) {
    idx = Object.entries(space.colors).map(([name, hex]) => [name, hexToRgba(hex)] as const);
    rgbaIndexCache.set(space, idx);
  }
  return idx;
}

/**
 * Find the nearest-named entry in a palette to the given Rgba, using
 * squared Euclidean distance in sRGB (alpha ignored). Used by `identify`
 * and `rgbaToPantone` when metric === 'euclidean-srgb'.
 */
function nearestByRgb(target: Rgba, space: AnyPalette): string {
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
const labIndexCache = new WeakMap<AnyPalette, Array<readonly [string, LabTriple]>>();

function getLabIndex(space: AnyPalette): Array<readonly [string, LabTriple]> {
  let idx = labIndexCache.get(space);
  if (idx === undefined) {
    idx = getRgbaIndex(space).map(([name, rgba]) => [name, rgbaToLab(rgba)] as const);
    labIndexCache.set(space, idx);
  }
  return idx;
}

// Precomputed linear-RGB entries for euclidean-linear metric.
const linearIndexCache = new WeakMap<AnyPalette, Array<readonly [string, LabTriple]>>();

function getLinearIndex(space: AnyPalette): Array<readonly [string, LabTriple]> {
  let idx = linearIndexCache.get(space);
  if (idx === undefined) {
    idx = getRgbaIndex(space).map(([name, rgba]) => [name, rgbaToLinearRgb(rgba)] as const);
    linearIndexCache.set(space, idx);
  }
  return idx;
}

// Precomputed OKLAB entries for deltaEok metric.
const oklabIndexCache = new WeakMap<AnyPalette, Array<readonly [string, LabTriple]>>();

function getOklabIndex(space: AnyPalette): Array<readonly [string, LabTriple]> {
  let idx = oklabIndexCache.get(space);
  if (idx === undefined) {
    idx = getRgbaIndex(space).map(([name, rgba]) => [name, rgbaToOklab(rgba)] as const);
    oklabIndexCache.set(space, idx);
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
 * Find the nearest-named entry in a palette under the specified distance
 * metric. Dispatches to the right index (rgba / linear-rgb / Lab) and
 * the right distance function. See `DistanceMetric` in types.ts for how
 * to pick a metric.
 *
 * `metric` is required — callers should pass `space.defaultMetric` if
 * they want the palette's declared preference. A silent default would
 * hide the distance-metric choice from the hot path.
 */
export function nearest(target: Rgba, space: AnyPalette, metric: DistanceMetric): string {
  if (metric === 'euclidean-srgb') return nearestByRgb(target, space);
  if (metric === 'euclidean-linear') {
    return argminBy(getLinearIndex(space), rgbaToLinearRgb(target), squaredDistanceTriple);
  }
  if (metric === 'deltaEok') {
    return argminBy(getOklabIndex(space), rgbaToOklab(target), deltaEokSquared);
  }
  const labTarget = rgbaToLab(target);
  const labIndex = getLabIndex(space);
  if (metric === 'deltaE76') return argminBy(labIndex, labTarget, deltaE76Squared);
  if (metric === 'deltaE94') return argminBy(labIndex, labTarget, deltaE94);
  return argminBy(labIndex, labTarget, deltaE2000);
}

/**
 * Rank every palette entry by distance to `target`. Returns an array of
 * `{ name, distance }` sorted ascending (nearest first). Optional `k`
 * truncates to the top-k matches.
 *
 * Distances are **real** metric values (not squared) — ΔE76 / ΔE94 /
 * ΔE2000 / ΔE-OK are in standard ΔE units (≈1 = just-noticeable for
 * most of the gamut on ΔE76/2000); `euclidean-srgb` / `euclidean-linear`
 * are in their respective channel-unit Euclidean distances.
 *
 * Cost:
 * - `k < n`: O(n · k) via bounded insertion-sort; much faster than a
 *   full sort for small k on cheap metrics where allocation dominates.
 * - `k >= n` or `k === undefined`: O(n log n) via full push-and-sort,
 *   returning every entry ranked.
 *
 * Tie-breaking: on exact-distance ties, the first-declared entry in
 * the palette's `colors` object wins. Matches the single-match
 * `nearest` contract.
 *
 * `k` normalization is forgiving: fractional values are rounded,
 * negatives clamp to 0, and `NaN` / `±Infinity` collapse to 0
 * (empty result). No throws.
 */
export function nearestAll(
  target: Rgba,
  space: AnyPalette,
  metric: DistanceMetric,
  k?: number,
): Array<{ name: string; distance: number }> {
  const rgbaIndex = getRgbaIndex(space);
  const n = rgbaIndex.length;

  // k normalization. Forgiving by design: fractional values are rounded,
  // negatives clamp to 0, NaN / ±Infinity collapse to 0 (empty result).
  // A previous version crashed with `RangeError: Invalid array length`
  // on NaN / fractional k because `new Array(NaN)` throws; the
  // `Number.isFinite` guard eliminates that class of bug.
  const safeK = k === undefined ? n : Number.isFinite(k) ? Math.max(0, Math.round(k)) : 0;
  if (safeK === 0) return [];

  // When the caller wants at least every entry ranked, the bounded
  // insertion-sort gives no benefit — it degenerates to O(n^2) on a
  // full result set. Use the plain push-and-sort path instead.
  // When safeK < n, the bounded insertion-sort keeps only the top k
  // entries seen so far, cutting work from O(n log n) to O(n · k)
  // with a much smaller constant; the win is dramatic for cheap
  // metrics (deltaEok at k=5 / 1950-entry ncs measured ~50x) where
  // the full sort's allocation dominates the distance math.
  const useBounded = safeK < n;

  const best: Array<{ name: string; distance: number }> = [];

  // Single per-candidate branch, chosen once up front. `offer` either
  // pushes unconditionally (full-sort path) or inserts into a bounded
  // sorted window (bounded path). Splitting the switch and the merge
  // strategy into a closure avoids a 6-way metric switch × 2 modes
  // duplication.
  const offer = useBounded
    ? (name: string, dist: number): void => {
        if (best.length < safeK) {
          let j = best.length;
          while (j > 0 && (best[j - 1] as { distance: number }).distance > dist) j--;
          best.splice(j, 0, { name, distance: dist });
        } else if (dist < (best[safeK - 1] as { distance: number }).distance) {
          let j = safeK - 1;
          while (j > 0 && (best[j - 1] as { distance: number }).distance > dist) j--;
          best.splice(j, 0, { name, distance: dist });
          best.pop();
        }
      }
    : (name: string, dist: number): void => {
        best.push({ name, distance: dist });
      };

  if (metric === 'euclidean-srgb') {
    for (const [name, candidate] of rgbaIndex) {
      offer(name, Math.sqrt(squaredDistanceRgb(target, candidate)));
    }
  } else if (metric === 'euclidean-linear') {
    const tgt = rgbaToLinearRgb(target);
    for (const [name, candidate] of getLinearIndex(space)) {
      offer(name, Math.sqrt(squaredDistanceTriple(tgt, candidate)));
    }
  } else if (metric === 'deltaEok') {
    const tgt = rgbaToOklab(target);
    for (const [name, candidate] of getOklabIndex(space)) {
      offer(name, Math.sqrt(deltaEokSquared(tgt, candidate)));
    }
  } else {
    const tgt = rgbaToLab(target);
    const labIndex = getLabIndex(space);
    if (metric === 'deltaE76') {
      for (const [name, candidate] of labIndex) {
        offer(name, Math.sqrt(deltaE76Squared(tgt, candidate)));
      }
    } else if (metric === 'deltaE94') {
      for (const [name, candidate] of labIndex) {
        offer(name, deltaE94(tgt, candidate));
      }
    } else {
      for (const [name, candidate] of labIndex) {
        offer(name, deltaE2000(tgt, candidate));
      }
    }
  }

  if (!useBounded) {
    best.sort((a, b) => a.distance - b.distance);
  }
  return best;
}
