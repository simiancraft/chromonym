import { hexToRgba, rgbaToHex } from './conversions/hex';
import { hslToRgba, rgbaToHsl } from './conversions/hsl';
import { hsvToRgba, rgbaToHsv } from './conversions/hsv';
import { pantoneToRgba, rgbaToPantone } from './conversions/pantone';
import { rgbaToRgb, rgbToRgba } from './conversions/rgb';
import { type DetectedFormat, detectFormat } from './detectFormat';
import type {
  ColorFormat,
  ColorInput,
  ColorValue,
  HexColor,
  HslInput,
  HsvInput,
  PantoneCode,
  Rgba,
  RgbaInput,
  RgbInput,
} from './types';

function safeStringify(x: unknown): string {
  if (x === undefined) return 'undefined';
  try {
    const s = JSON.stringify(x);
    return s === undefined ? String(x) : s;
  } catch {
    return Object.prototype.toString.call(x);
  }
}

/**
 * Normalize any recognized color input to canonical `Rgba`.
 * Pass `knownFormat` when the caller has already run `detectFormat` to skip
 * the redundant detection. Throws on `UNKNOWN` input.
 */
export function toRgba(input: ColorInput, knownFormat?: DetectedFormat): Rgba {
  const format = knownFormat ?? detectFormat(input);
  switch (format) {
    case 'HEX':
      return hexToRgba(input as HexColor);
    case 'RGB':
      return rgbToRgba(input as RgbInput);
    case 'RGBA':
      return rgbToRgba(input as RgbaInput);
    case 'HSL':
      return hslToRgba(input as HslInput);
    case 'HSV':
      return hsvToRgba(input as HsvInput);
    case 'PANTONE':
      return pantoneToRgba(input as PantoneCode);
    default:
      throw new Error(`Unrecognized color input: ${safeStringify(input)}`);
  }
}

/**
 * Emit a canonical `Rgba` in the target format. Colorspace-independent.
 */
export function fromRgba(rgba: Rgba, format: ColorFormat = 'HEX'): ColorValue {
  switch (format) {
    case 'HEX':
      return rgbaToHex(rgba);
    case 'RGB':
      return rgbaToRgb(rgba);
    case 'RGBA':
      return rgba;
    case 'HSL':
      return rgbaToHsl(rgba);
    case 'HSV':
      return rgbaToHsv(rgba);
    case 'PANTONE':
      return rgbaToPantone(rgba);
  }
}

/**
 * Detect the input color format, normalize to Rgba, and emit the result
 * in the requested output format. Colorspace-independent.
 * Throws if the input isn't a recognized color shape.
 */
export function convert(input: ColorInput, opts: { format?: ColorFormat } = {}): ColorValue {
  return fromRgba(toRgba(input), opts.format ?? 'HEX');
}
