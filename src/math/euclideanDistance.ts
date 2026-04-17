import type { Rgba } from '../types';

/**
 * Squared Euclidean distance between two colors in RGB space.
 * Alpha channel is ignored. Faster than `euclideanDistance` — use this
 * when you only need to compare or minimize (sqrt is monotonic, so
 * argmin(d) === argmin(d²)).
 */
export function squaredDistanceRgb(a: Rgba, b: Rgba): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Euclidean distance between two colors in RGB space.
 * Alpha channel is ignored (matches classic `detect-color` behavior).
 * Not perceptually accurate — use deltaE (CIE Lab) for color matching
 * where perceptual uniformity matters.
 */
export function euclideanDistance(a: Rgba, b: Rgba): number {
  return Math.sqrt(squaredDistanceRgb(a, b));
}
