import { clamp, requireFinite } from '../math/clamp.js';
import type { Rgba, RgbaInput, RgbInput, RgbObject, RgbString } from '../types.js';

// Alpha group split into two unambiguous alternatives to avoid polynomial
// backtracking (CodeQL js/polynomial-redos) on malformed inputs like
// `rgb(9,9,9,99...9`.
const RGB_RE =
  /^rgba?\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?\)$/i;

function sanitizeChannel(n: unknown, label: string): number {
  return clamp(requireFinite(n, label), 0, 255);
}

function sanitizeAlpha(n: unknown): number {
  return clamp(requireFinite(n, 'alpha'), 0, 1);
}

/**
 * Normalize any RGB/RGBA input shape (string, tuple, or object) into
 * the canonical Rgba representation. Alpha defaults to 1 when absent.
 * Rejects non-finite numeric inputs; clamps r/g/b to [0,255] and a to [0,1].
 * Throws on malformed strings. String parsing is linear-time; no polynomial
 * backtracking on pathological input. Leading-dot alpha (e.g. `.5`) is
 * accepted per the CSS Color spec.
 *
 * @example
 * rgbToRgba('rgba(255, 0, 0, .5)');
 * // => { r: 255, g: 0, b: 0, a: 0.5 }
 */
export function rgbToRgba(input: RgbInput | RgbaInput): Rgba {
  if (Array.isArray(input)) {
    const rawA = input.length === 4 ? input[3] : 1;
    return {
      r: sanitizeChannel(input[0], 'r'),
      g: sanitizeChannel(input[1], 'g'),
      b: sanitizeChannel(input[2], 'b'),
      a: sanitizeAlpha(rawA),
    };
  }

  if (typeof input === 'string') {
    const match = RGB_RE.exec(input);
    if (!match) throw new Error(`Invalid rgb(a) string: ${input}`);
    return {
      r: sanitizeChannel(Number(match[1]), 'r'),
      g: sanitizeChannel(Number(match[2]), 'g'),
      b: sanitizeChannel(Number(match[3]), 'b'),
      a: sanitizeAlpha(match[4] !== undefined ? Number(match[4]) : 1),
    };
  }

  // Object form — TypeScript's Array.isArray narrowing doesn't exclude
  // readonly tuple types from the union, so cast after the guards.
  const obj = input as RgbObject | Rgba;
  return {
    r: sanitizeChannel(obj.r, 'r'),
    g: sanitizeChannel(obj.g, 'g'),
    b: sanitizeChannel(obj.b, 'b'),
    a: sanitizeAlpha('a' in obj ? obj.a : 1),
  };
}

/**
 * Emit an `rgb(r, g, b)` string. Alpha is dropped; values are
 * already-clamped by rgbToRgba, but we re-clamp defensively for direct
 * Rgba-object callers who bypass the input normalizer.
 */
export function rgbaToRgb(rgba: Rgba): RgbString {
  const r = clamp(Math.round(rgba.r), 0, 255);
  const g = clamp(Math.round(rgba.g), 0, 255);
  const b = clamp(Math.round(rgba.b), 0, 255);
  return `rgb(${r}, ${g}, ${b})` as RgbString;
}
