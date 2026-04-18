import type { ColorFormat, ColorInput } from './types';

/**
 * A color comes in, a format key comes out.
 * 'UNKNOWN' signals the caller that the input isn't a recognized color shape.
 * Used as the dispatch key for format-specific converters.
 */
export type DetectedFormat = ColorFormat | 'UNKNOWN';

/** Shared with `src/conversions/hex.ts`. Capture group is used there; .test() ignores it here. */
export const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGBA_STR_RE = /^rgba\s*\(/i;
const RGB_STR_RE = /^rgb\s*\(/i;
const HSL_STR_RE = /^hsl\s*\(/i;
const HSV_STR_RE = /^hsv\s*\(/i;
// Conservative: matches "<digits> C|U|M" with optional "Pantone" prefix.
// Refine once the real Pantone code list lands.
const PANTONE_RE = /^(?:pantone\s+)?\d+\s*[CUM]$/i;

/**
 * Runtime type-guard — returns `true` if `input` looks like something any of
 * chromonym's converters can parse. Cheaper than catching a `convert` throw
 * and more ergonomic than hand-rolling `detectFormat(x) !== 'UNKNOWN'`.
 */
export function isColor(input: unknown): input is ColorInput {
  return detectFormat(input as ColorInput) !== 'UNKNOWN';
}

export function detectFormat(input: ColorInput): DetectedFormat {
  if (typeof input === 'string') {
    if (input === '') return 'UNKNOWN';
    if (HEX_RE.test(input)) return 'HEX';
    if (RGBA_STR_RE.test(input)) return 'RGBA';
    if (RGB_STR_RE.test(input)) return 'RGB';
    if (HSL_STR_RE.test(input)) return 'HSL';
    if (HSV_STR_RE.test(input)) return 'HSV';
    if (PANTONE_RE.test(input)) return 'PANTONE';
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
