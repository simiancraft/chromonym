import { pantone } from '../colorspaces/pantone';
import { euclideanDistance } from '../math/euclideanDistance';
import type { HexColor, PantoneCode, Rgba } from '../types';
import { hexToRgba } from './hex';

// Strip casing, common prefixes ("Pantone", "PMS"), and all non-alphanumeric
// characters so that "185 C", "185c", "Pantone 185 C", "PMS185C" all match
// the stored canonical key "185C".
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/^(pantone|pms)\s*/, '')
    .replace(/[^a-z0-9]/g, '');
}

// Lazy normalized-name -> canonical-key index.
let nameIndex: Map<string, string> | null = null;
function getNameIndex(): Map<string, string> {
  if (!nameIndex) {
    nameIndex = new Map();
    for (const key of Object.keys(pantone)) {
      nameIndex.set(normalize(key), key);
    }
  }
  return nameIndex;
}

// Lazy canonical-key -> rgba index (precomputed to avoid per-lookup hex parsing).
let rgbaIndex: Array<readonly [code: string, rgba: Rgba]> | null = null;
function getRgbaIndex(): Array<readonly [code: string, rgba: Rgba]> {
  if (!rgbaIndex) {
    rgbaIndex = Object.entries(pantone).map(
      ([code, hex]) => [code, hexToRgba(hex as HexColor)] as const,
    );
  }
  return rgbaIndex;
}

/**
 * Resolve a Pantone code to Rgba.
 * Accepts any casing, spacing, and common prefixes ("PMS", "Pantone")
 * since non-alphanumeric characters are stripped before lookup.
 * Throws on unknown codes.
 */
export function pantoneToRgba(code: PantoneCode): Rgba {
  const canonical = getNameIndex().get(normalize(code));
  if (canonical === undefined) throw new Error(`Unknown Pantone code: ${code}`);
  const hex = pantone[canonical as keyof typeof pantone];
  return hexToRgba(hex);
}

/**
 * Find the nearest Pantone code (Coated) to the given Rgba by
 * Euclidean distance in RGB. Alpha is ignored. Always returns a code.
 */
export function rgbaToPantone(rgba: Rgba): PantoneCode {
  const entries = getRgbaIndex();
  // Pantone colorspace has 907 entries; first-entry fallback is defensive.
  let bestCode: string = entries[0]?.[0] ?? '';
  let bestDistance = Infinity;
  for (const [code, candidate] of entries) {
    const d = euclideanDistance(rgba, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      bestCode = code;
    }
  }
  return bestCode as PantoneCode;
}
