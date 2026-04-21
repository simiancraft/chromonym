import type { ColorFormat, ColorInput } from './types.js';

/**
 * Return type of {@link detectFormat}. Either a {@link ColorFormat} key
 * (`'HEX'` / `'RGB'` / `'RGBA'` / `'HSL'` / `'HSV'`) or the sentinel
 * string `'UNKNOWN'` when the input doesn't match any recognized color
 * shape. The sentinel is the dispatch miss condition for
 * format-specific converters; prefer {@link isColor} when you only
 * need a boolean guard.
 */
export type DetectedFormat = ColorFormat | 'UNKNOWN';

/** Shared with `src/conversions/hex.ts`. Capture group is used there; .test() ignores it here. */
export const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGBA_STR_RE = /^rgba\s*\(/i;
const RGB_STR_RE = /^rgb\s*\(/i;
const HSL_STR_RE = /^hsl\s*\(/i;
const HSV_STR_RE = /^hsv\s*\(/i;

/**
 * Runtime type-guard — returns `true` if `input` looks like something any of
 * chromonym's converters can parse. Cheaper than catching a `convert` throw
 * and more ergonomic than hand-rolling `detectFormat(x) !== 'UNKNOWN'`.
 */
export function isColor(input: unknown): input is ColorInput {
  return detectFormat(input as ColorInput) !== 'UNKNOWN';
}

/**
 * Classify a color input by shape, returning the {@link ColorFormat}
 * key used to dispatch format-specific converters. Returns the
 * sentinel `'UNKNOWN'` when the input doesn't match any recognized
 * shape; callers that only need a boolean guard should prefer
 * {@link isColor} instead.
 *
 * Pure shape detection; no value validation. `detectFormat('#zzz')`
 * still returns `'UNKNOWN'` because the hex regex rejects it, but
 * `detectFormat({ r: 999, g: -1, b: 'nope' })` returns `'RGB'` (the
 * shape matches; the values are the converter's problem).
 *
 * @example
 * detectFormat('#ff0000');              // 'HEX'
 * detectFormat('rgb(255, 0, 0)');       // 'RGB'
 * detectFormat([255, 0, 0]);            // 'RGB'
 * detectFormat([255, 0, 0, 0.5]);       // 'RGBA'
 * detectFormat({ h: 0, s: 100, l: 50 });// 'HSL'
 * detectFormat('banana');               // 'UNKNOWN'
 */
export function detectFormat(input: ColorInput): DetectedFormat {
  if (typeof input === 'string') {
    // Runtime guard against JS callers that bypass the string template union.
    if ((input as string).length === 0) return 'UNKNOWN';
    if (HEX_RE.test(input)) return 'HEX';
    if (RGBA_STR_RE.test(input)) return 'RGBA';
    if (RGB_STR_RE.test(input)) return 'RGB';
    if (HSL_STR_RE.test(input)) return 'HSL';
    if (HSV_STR_RE.test(input)) return 'HSV';
    return 'UNKNOWN';
  }

  if (Array.isArray(input)) {
    if (input.length === 4) return 'RGBA';
    if (input.length === 3) return 'RGB';
    return 'UNKNOWN';
  }

  if (input !== null && typeof input === 'object') {
    // Use Object.hasOwn — `in` walks the prototype chain and can be
    // abused by attacker-controlled prototypes to misclassify inputs.
    const has = Object.hasOwn;
    if (has(input, 'h') && has(input, 'v')) return 'HSV';
    if (has(input, 'h') && has(input, 'l')) return 'HSL';
    if (has(input, 'r') && has(input, 'a')) return 'RGBA';
    if (has(input, 'r')) return 'RGB';
    return 'UNKNOWN';
  }

  return 'UNKNOWN';
}
