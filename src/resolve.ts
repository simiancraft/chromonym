import { hexToRgba } from './conversions/hex';
import { fromRgba } from './convert';
import { getNameIndex } from './indexing';
import { web } from './palettes/web';
import type { ColorFormat, ColorValue, HexColor, Palette } from './types';

/**
 * Resolve a human-readable name to a color. Normalizes the input using the
 * palette's own `normalize` function before looking it up. Returns `null`
 * if unknown.
 *
 * Defaults: palette = `web`, format = 'HEX'.
 *
 * BYO palettes: pass any object matching `Palette<Name>` — no registration
 * needed; the palette's normalizer handles lookup.
 */
export function resolve(
  name: string,
  opts: { palette?: Palette; format?: ColorFormat } = {},
): ColorValue | null {
  const palette = opts.palette ?? web;
  const format = opts.format ?? 'HEX';
  const canonical = getNameIndex(palette).get(palette.normalize(name));
  if (canonical === undefined) return null;
  const hex = (palette.colors as Record<string, HexColor>)[canonical];
  if (hex === undefined) return null;
  // Skip detectFormat — we already know this is HEX (read from palette data).
  return fromRgba(hexToRgba(hex), format);
}
