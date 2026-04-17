import { hueSectorToPrime } from '../math/hueSector';
import type { HsvInput, HsvString, Rgba } from '../types';

const HSV_RE =
  /^hsv\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)%?\s*,\s*(-?\d+(?:\.\d+)?)%?\s*\)$/i;

/**
 * Parse HSV input (string or object) into canonical Rgba.
 * Hue wraps modulo 360; saturation and value are 0..100 percent.
 */
export function hsvToRgba(input: HsvInput): Rgba {
  let h: number;
  let s: number;
  let v: number;

  if (typeof input === 'string') {
    const match = HSV_RE.exec(input);
    if (!match) throw new Error(`Invalid hsv string: ${input}`);
    h = Number(match[1]);
    s = Number(match[2]);
    v = Number(match[3]);
  } else {
    h = input.h;
    s = input.s;
    v = input.v;
  }

  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = val - c;

  const [r1, g1, b1] = hueSectorToPrime(hp, c, x);
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
    a: 1,
  };
}

/**
 * Emit an `hsv(h, s%, v%)` string from Rgba. Alpha is dropped; all
 * three components are rounded to whole numbers.
 */
export function rgbaToHsv(rgba: Rgba): HsvString {
  const rn = rgba.r / 255;
  const gn = rgba.g / 255;
  const bn = rgba.b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const v = max;
  const s = max === 0 ? 0 : delta / max;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = (gn - bn) / delta + (gn < bn ? 6 : 0);
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h *= 60;
  }

  return `hsv(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)` as HsvString;
}
