import type { HslInput, HslString, Rgba } from '../types';

const HSL_RE =
  /^hsl\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)%?\s*,\s*(-?\d+(?:\.\d+)?)%?\s*\)$/i;

/**
 * Parse HSL input (string or object) into canonical Rgba.
 * Hue wraps modulo 360; saturation and lightness are 0..100 percent.
 */
export function hslToRgba(input: HslInput): Rgba {
  let h: number;
  let s: number;
  let l: number;

  if (typeof input === 'string') {
    const match = HSL_RE.exec(input);
    if (!match) throw new Error(`Invalid hsl string: ${input}`);
    h = Number(match[1]);
    s = Number(match[2]);
    l = Number(match[3]);
  } else {
    h = input.h;
    s = input.s;
    l = input.l;
  }

  const sat = s / 100;
  const lig = l / 100;

  if (sat === 0) {
    const v = Math.round(lig * 255);
    return { r: v, g: v, b: v, a: 1 };
  }

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = lig - c / 2;

  let r1: number;
  let g1: number;
  let b1: number;
  if (hp < 1) {
    [r1, g1, b1] = [c, x, 0];
  } else if (hp < 2) {
    [r1, g1, b1] = [x, c, 0];
  } else if (hp < 3) {
    [r1, g1, b1] = [0, c, x];
  } else if (hp < 4) {
    [r1, g1, b1] = [0, x, c];
  } else if (hp < 5) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
    a: 1,
  };
}

/**
 * Emit an `hsl(h, s%, l%)` string from Rgba. Alpha is dropped; all
 * three components are rounded to whole numbers.
 */
export function rgbaToHsl(rgba: Rgba): HslString {
  const rn = rgba.r / 255;
  const gn = rgba.g / 255;
  const bn = rgba.b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return `hsl(0, 0%, ${Math.round(l * 100)}%)` as HslString;
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h: number;
  if (max === rn) {
    h = (gn - bn) / delta + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / delta + 2;
  } else {
    h = (rn - gn) / delta + 4;
  }
  h *= 60;

  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` as HslString;
}
