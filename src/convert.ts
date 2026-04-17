import { hexToRgba, rgbaToHex } from './conversions/hex';
import { hslToRgba, rgbaToHsl } from './conversions/hsl';
import { hsvToRgba, rgbaToHsv } from './conversions/hsv';
import { pantoneToRgba, rgbaToPantone } from './conversions/pantone';
import { rgbaToRgb, rgbToRgba } from './conversions/rgb';
import { detectFormat } from './detectFormat';
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

function toRgba(input: ColorInput): Rgba {
  const format = detectFormat(input);
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
      throw new Error(`Unrecognized color input: ${String(input)}`);
  }
}

function fromRgba(rgba: Rgba, format: ColorFormat): ColorValue {
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
  const { format = 'HEX' } = opts;
  return fromRgba(toRgba(input), format);
}
