import type { Rgba, RgbaInput, RgbInput, RgbObject, RgbString } from '../types';

const RGB_RE =
  /^rgba?\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/i;

/**
 * Normalize any RGB/RGBA input shape (string, tuple, or object) into
 * the canonical Rgba representation. Alpha defaults to 1 when absent.
 * Throws on malformed strings.
 */
export function rgbToRgba(input: RgbInput | RgbaInput): Rgba {
  if (Array.isArray(input)) {
    const a = input.length === 4 ? (input[3] as number) : 1;
    return {
      r: input[0] as number,
      g: input[1] as number,
      b: input[2] as number,
      a,
    };
  }

  if (typeof input === 'string') {
    const match = RGB_RE.exec(input);
    if (!match) throw new Error(`Invalid rgb(a) string: ${input}`);
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] !== undefined ? Number(match[4]) : 1,
    };
  }

  // Object form — TypeScript's Array.isArray narrowing doesn't exclude
  // readonly tuple types from the union, so cast after the guards.
  const obj = input as RgbObject | Rgba;
  return {
    r: obj.r,
    g: obj.g,
    b: obj.b,
    a: 'a' in obj ? obj.a : 1,
  };
}

/**
 * Emit an `rgb(r, g, b)` string. Alpha is dropped; out-of-range values
 * are clamped to 0..255; fractional values are rounded.
 */
export function rgbaToRgb(rgba: Rgba): RgbString {
  const clamp = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));
  return `rgb(${clamp(rgba.r)}, ${clamp(rgba.g)}, ${clamp(rgba.b)})` as RgbString;
}
