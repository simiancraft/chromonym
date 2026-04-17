import { pantone } from '../colorspaces/pantone';
import { getNameIndex, nearestByRgb, pantoneNormalize } from '../indexing';
import type { HexColor, PantoneCode, Rgba } from '../types';
import { hexToRgba } from './hex';

/**
 * Resolve a Pantone code to Rgba.
 * Accepts any casing, spacing, and common prefixes ("PMS", "Pantone")
 * since non-alphanumeric characters are stripped before lookup.
 * Throws on unknown codes.
 */
export function pantoneToRgba(code: PantoneCode): Rgba {
  const canonical = getNameIndex(pantone, pantoneNormalize).get(pantoneNormalize(code));
  if (canonical === undefined) throw new Error(`Unknown Pantone code: ${code}`);
  const hex = pantone[canonical as keyof typeof pantone];
  return hexToRgba(hex as HexColor);
}

/**
 * Find the nearest Pantone code (Coated) to the given Rgba by
 * squared Euclidean distance in RGB. Alpha is ignored. Always returns a code.
 */
export function rgbaToPantone(rgba: Rgba): PantoneCode {
  return nearestByRgb(rgba, pantone) as PantoneCode;
}
