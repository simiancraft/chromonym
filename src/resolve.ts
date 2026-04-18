import { web } from './colorspaces/web';
import { hexToRgba } from './conversions/hex';
import { fromRgba } from './convert';
import { getNameIndex } from './indexing';
import type { Colorspace, ColorFormat, ColorValue, HexColor } from './types';

/**
 * Resolve a human-readable name to a color. Normalizes the input using the
 * colorspace's own `normalize` function before looking it up. Returns `null`
 * if unknown.
 *
 * Defaults: colorspace = `web`, format = 'HEX'.
 *
 * BYO colorspaces: pass any object matching `Colorspace<Name>` — no
 * registration needed; the palette's normalizer handles lookup.
 */
export function resolve(
  name: string,
  opts: { colorspace?: Colorspace; format?: ColorFormat } = {},
): ColorValue | null {
  const palette = opts.colorspace ?? web;
  const format = opts.format ?? 'HEX';
  const canonical = getNameIndex(palette).get(palette.normalize(name));
  if (canonical === undefined) return null;
  const hex = (palette.colors as Record<string, HexColor>)[canonical];
  if (hex === undefined) return null;
  // Skip detectFormat — we already know this is HEX (read from colorspace data).
  return fromRgba(hexToRgba(hex), format);
}
