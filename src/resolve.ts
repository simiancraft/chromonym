import { COLORSPACE_NAMES, COLORSPACES, NORMALIZERS } from './colorspaces/registry';
import { hexToRgba } from './conversions/hex';
import { fromRgba } from './convert';
import { getNameIndex } from './indexing';
import type { ColorFormat, ColorspaceName, ColorValue, HexColor } from './types';

/**
 * Resolve a human-readable name to a color. Normalizes the input
 * (lowercases, strips non-alphanumeric characters, and for the pantone
 * colorspace also strips a leading "Pantone" or "PMS" prefix) before
 * looking it up in the chosen colorspace. Returns `null` if unknown.
 *
 * Defaults: colorspace = 'web', format = 'HEX'.
 */
export function resolve(
  name: string,
  opts: { colorspace?: ColorspaceName; format?: ColorFormat } = {},
): ColorValue | null {
  const { colorspace = 'web', format = 'HEX' } = opts;
  if (!COLORSPACE_NAMES.has(colorspace)) return null;
  const space = COLORSPACES[colorspace];
  const normalize = NORMALIZERS[colorspace];
  const canonical = getNameIndex(space, normalize).get(normalize(name));
  if (canonical === undefined) return null;
  const hex = space[canonical] as HexColor;
  // Skip detectFormat — we already know this is HEX (read from colorspace data).
  return fromRgba(hexToRgba(hex), format);
}
