import { pantone, type PantoneColorName } from '../colorspaces/pantone';
import { getNameIndex, nearest } from '../indexing';
import type { HexColor, Rgba } from '../types';
import { hexToRgba } from './hex';

/**
 * Resolve a Pantone code to Rgba.
 * Accepts any casing, spacing, and common prefixes ("PMS", "Pantone")
 * since non-alphanumeric characters are stripped before lookup.
 * Throws on unknown codes.
 */
export function pantoneToRgba(code: string): Rgba {
  const canonical = getNameIndex(pantone).get(pantone.normalize(code));
  if (canonical === undefined) throw new Error(`Unknown Pantone code: ${code}`);
  const hex = pantone.colors[canonical as keyof typeof pantone.colors];
  return hexToRgba(hex as HexColor);
}

/**
 * Find the nearest Pantone Coated code to the given Rgba. Uses the
 * `pantone` palette's own `defaultMetric` (ΔE*00 / CIEDE2000) — the
 * industry-standard perceptual metric, since Pantone values cluster densely
 * in the saturated blue/purple region where sRGB Euclidean distance gives
 * visually wrong answers.
 * Alpha is ignored. Always returns a code.
 */
export function rgbaToPantone(rgba: Rgba): PantoneColorName {
  return nearest(rgba, pantone, pantone.defaultMetric) as PantoneColorName;
}
