import type { Rgba } from '../types';

/**
 * Color-space conversions needed by the perceptual distance metrics.
 *
 * Pipeline:  sRGB (0..255)  →  linear RGB (0..1)  →  XYZ (D65)  →  Lab
 *
 * References:
 *   sRGB EOTF / companding:      IEC 61966-2-1
 *   sRGB → XYZ (D65):            Bruce Lindbloom, http://www.brucelindbloom.com/
 *   XYZ → Lab:                   CIE 15: 2004
 */

/** sRGB → linear for a single channel in [0, 255]. Returns [0, 1]. */
export function srgbToLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Linear → sRGB for a single channel in [0, 1]. Returns [0, 1] (scale by 255 if needed). */
export function linearToSrgb(linear: number): number {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
}

/** Rgba → linear RGB triple in [0, 1] (alpha dropped). */
export function rgbaToLinearRgb(rgba: Rgba): [number, number, number] {
  return [srgbToLinear(rgba.r), srgbToLinear(rgba.g), srgbToLinear(rgba.b)];
}

/**
 * Linear RGB (D65) → CIE XYZ (D65), using the standard sRGB matrix.
 * Input and output both in [0, 1] on each axis (approximately; Y = 1 is white).
 */
export function linearRgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
  return [x, y, z];
}

// D65 white reference (CIE 1931 2° observer).
const XN = 0.95047;
const YN = 1.0;
const ZN = 1.08883;

// f(t) in the CIE Lab formula; cube-root with a linear toe near origin.
function labF(t: number): number {
  const DELTA = 6 / 29;
  return t > DELTA ** 3 ? Math.cbrt(t) : t / (3 * DELTA ** 2) + 4 / 29;
}

/** CIE XYZ (D65) → CIE Lab. L ∈ [0, 100] approx; a,b unbounded but typically [-128, 127]. */
export function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const fx = labF(x / XN);
  const fy = labF(y / YN);
  const fz = labF(z / ZN);
  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  return [l, a, b];
}

/** Rgba (sRGB, 0..255) → CIE Lab. Canonical pipeline for perceptual distance. */
export function rgbaToLab(rgba: Rgba): [number, number, number] {
  const [r, g, b] = rgbaToLinearRgb(rgba);
  const [x, y, z] = linearRgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/**
 * Linear sRGB → OKLAB (Björn Ottosson, 2020). OKLAB is strictly more
 * perceptually uniform than CIELAB, especially in the blue/purple region
 * where even CIEDE2000 has residual error. Distance in OKLAB is plain
 * Euclidean — no weighting formula needed, because the space itself is
 * designed around uniformity.
 *
 * Reference: https://bottosson.github.io/posts/oklab/
 */
export function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return [L, a, b2];
}

/** Rgba (sRGB, 0..255) → OKLAB. */
export function rgbaToOklab(rgba: Rgba): [number, number, number] {
  const [r, g, b] = rgbaToLinearRgb(rgba);
  return linearRgbToOklab(r, g, b);
}
