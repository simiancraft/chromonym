import { requireFinite } from '../math/clamp';
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
    h = requireFinite(input.h, 'h');
    s = requireFinite(input.s, 's');
    v = requireFinite(input.v, 'v');
  }

  const saturation = s / 100;
  const value = v / 100;
  const chroma = value * saturation;
  const hueSector = (((h % 360) + 360) % 360) / 60;
  const secondary = chroma * (1 - Math.abs((hueSector % 2) - 1));
  const valueOffset = value - chroma;

  const [rPrime, gPrime, bPrime] = hueSectorToPrime(hueSector, chroma, secondary);
  return {
    r: Math.round((rPrime + valueOffset) * 255),
    g: Math.round((gPrime + valueOffset) * 255),
    b: Math.round((bPrime + valueOffset) * 255),
    a: 1,
  };
}

/**
 * Emit an `hsv(h, s%, v%)` string from Rgba. Alpha is dropped; all
 * three components are rounded to whole numbers.
 */
export function rgbaToHsv(rgba: Rgba): HsvString {
  const rNorm = rgba.r / 255;
  const gNorm = rgba.g / 255;
  const bNorm = rgba.b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  const value = max;
  const saturation = max === 0 ? 0 : delta / max;

  let hue = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      hue = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      hue = (bNorm - rNorm) / delta + 2;
    } else {
      hue = (rNorm - gNorm) / delta + 4;
    }
    hue *= 60;
  }

  return `hsv(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(value * 100)}%)` as HsvString;
}
