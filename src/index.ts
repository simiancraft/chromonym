// Public API barrel — explicit named re-exports only (tree-shake friendly).
// No default export; no side effects at module scope.

export { type PantoneColorName, pantone } from './palettes/pantone';
export { type WebColorName, web } from './palettes/web';
export { type X11ColorName, x11 } from './palettes/x11';
export { hexToRgba, rgbaToHex } from './conversions/hex';
export { hslToRgba, rgbaToHsl } from './conversions/hsl';
export { hsvToRgba, rgbaToHsv } from './conversions/hsv';
export { pantoneToRgba, rgbaToPantone } from './conversions/pantone';
export { rgbaToRgb, rgbToRgba } from './conversions/rgb';
export { convert, fromRgba, toRgba } from './convert';
export { type DetectedFormat, detectFormat, isColor } from './detectFormat';
export { identify } from './identify';
export { resolve } from './resolve';
export type {
  ColorFormat,
  ColorInput,
  ColorValue,
  DistanceMetric,
  HexColor,
  HslInput,
  HslObject,
  HslString,
  HsvInput,
  HsvObject,
  HsvString,
  NormalizeFn,
  Palette,
  Rgba,
  RgbaInput,
  RgbaString,
  RgbaTuple,
  RgbInput,
  RgbObject,
  RgbString,
  RgbTuple,
} from './types';
export { COLOR_FORMATS } from './types';
