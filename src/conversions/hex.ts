import type { HexColor, Rgba } from '../types';

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

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

/**
 * Emit a 6-digit lowercase hex string. Alpha is dropped; out-of-range
 * channel values are clamped to 0..255; fractional values are rounded.
 */
export function rgbaToHex(rgba: Rgba): HexColor {
  const clamp = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${clamp(rgba.r)}${clamp(rgba.g)}${clamp(rgba.b)}` as HexColor;
}
