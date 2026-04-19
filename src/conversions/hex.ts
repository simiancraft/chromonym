import { HEX_RE } from '../detectFormat.js';
import { clamp } from '../math/clamp.js';
import type { HexColor, Rgba } from '../types.js';

/**
 * Parse a hex color string into the canonical Rgba representation.
 * Accepts 3-digit (`#rgb`), 6-digit (`#rrggbb`), and 8-digit (`#rrggbbaa`).
 * Throws on any other input shape.
 */
export function hexToRgba(hex: HexColor): Rgba {
  const match = HEX_RE.exec(hex);
  const body = match?.[1];
  if (!body) throw new Error(`Invalid hex color: ${hex}`);

  if (body.length === 3) {
    const r = body.charAt(0);
    const g = body.charAt(1);
    const b = body.charAt(2);
    return {
      r: parseInt(r + r, 16),
      g: parseInt(g + g, 16),
      b: parseInt(b + b, 16),
      a: 1,
    };
  }

  const r = parseInt(body.slice(0, 2), 16);
  const g = parseInt(body.slice(2, 4), 16);
  const b = parseInt(body.slice(4, 6), 16);
  const a = body.length === 8 ? parseInt(body.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function channelToHex(n: number): string {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
}

/**
 * Emit a 6-digit lowercase hex string. Alpha is dropped; out-of-range
 * channel values are clamped to 0..255; fractional values are rounded.
 */
export function rgbaToHex(rgba: Rgba): HexColor {
  return `#${channelToHex(rgba.r)}${channelToHex(rgba.g)}${channelToHex(rgba.b)}` as HexColor;
}
