import { requireFinite } from '../math/clamp';
import { hueSectorToPrime } from '../math/hueSector';
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
    h = requireFinite(input.h, 'h');
    s = requireFinite(input.s, 's');
    l = requireFinite(input.l, 'l');
  }

  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const gray = Math.round(lightness * 255);
    return { r: gray, g: gray, b: gray, a: 1 };
  }

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSector = (((h % 360) + 360) % 360) / 60;
  const secondary = chroma * (1 - Math.abs((hueSector % 2) - 1));
  const lightnessOffset = lightness - chroma / 2;

  const [rPrime, gPrime, bPrime] = hueSectorToPrime(hueSector, chroma, secondary);
  return {
    r: Math.round((rPrime + lightnessOffset) * 255),
    g: Math.round((gPrime + lightnessOffset) * 255),
    b: Math.round((bPrime + lightnessOffset) * 255),
    a: 1,
  };
}

/**
 * Emit an `hsl(h, s%, l%)` string from Rgba. Alpha is dropped; all
 * three components are rounded to whole numbers.
 */
export function rgbaToHsl(rgba: Rgba): HslString {
  const rNorm = rgba.r / 255;
  const gNorm = rgba.g / 255;
  const bNorm = rgba.b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const lightness = (max + min) / 2;

  if (max === min) {
    return `hsl(0, 0%, ${Math.round(lightness * 100)}%)` as HslString;
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;
  if (max === rNorm) {
    hue = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
  } else if (max === gNorm) {
    hue = (bNorm - rNorm) / delta + 2;
  } else {
    hue = (rNorm - gNorm) / delta + 4;
  }
  hue *= 60;

  return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)` as HslString;
}
