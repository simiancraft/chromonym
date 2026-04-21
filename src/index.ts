// Public API barrel — explicit named re-exports only (tree-shake friendly).
// No default export; no side effects at module scope.

export { hexToRgba, rgbaToHex } from './conversions/hex.js';
export { hslToRgba, rgbaToHsl } from './conversions/hsl.js';
export { hsvToRgba, rgbaToHsv } from './conversions/hsv.js';
export { pantoneToRgba, rgbaToPantone } from './conversions/pantone.js';
export { rgbaToRgb, rgbToRgba } from './conversions/rgb.js';
export { convert, fromRgba, toRgba } from './convert.js';
export { type DetectedFormat, detectFormat, isColor } from './detectFormat.js';
export { type IdentifyMatch, identify } from './identify.js';
export { type CrayolaColorName, crayola } from './palettes/crayola.js';
export { type PantoneColorName, pantone } from './palettes/pantone.js';
export { type WebColorName, web } from './palettes/web.js';
export { type X11ColorName, x11 } from './palettes/x11.js';
export { type ResolveMatch, resolve } from './resolve.js';
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
  PaletteKey,
  Rgba,
  RgbaInput,
  RgbaString,
  RgbaTuple,
  RgbInput,
  RgbObject,
  RgbString,
  RgbTuple,
} from './types.js';
export { COLOR_FORMATS } from './types.js';
