import type { Rgba } from '../types';

/**
 * Euclidean distance between two colors in RGB space.
 * Alpha channel is ignored (matches classic `detect-color` behavior).
 * Not perceptually accurate — use deltaE (CIE Lab) for color matching
 * where perceptual uniformity matters.
 */
export function euclideanDistance(a: Rgba, b: Rgba): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
