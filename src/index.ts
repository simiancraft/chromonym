// Public API barrel — explicit named re-exports only (tree-shake friendly).
// No default export; no side effects at module scope.

export { hexToRgba, rgbaToHex } from './conversions/hex.js';
export { hslToRgba, rgbaToHsl } from './conversions/hsl.js';
export { hsvToRgba, rgbaToHsv } from './conversions/hsv.js';
export { pantoneToRgba, rgbaToPantone } from './conversions/pantone.js';
export { rgbaToRgb, rgbToRgba } from './conversions/rgb.js';
export {
  type ConvertNameOptions,
  type ConvertPaletteOptions,
  type ConvertStructuralOptions,
  convert,
  fromRgba,
  toRgba,
} from './convert.js';
export {
  type DefineColorPaletteInput,
  defineColorPalette,
} from './defineColorPalette.js';
export { type DetectedFormat, detectFormat, isColor } from './detectFormat.js';
export {
  type IdentifyMatch,
  type IdentifyOptions,
  type IdentifyRankedOptions,
  identify,
} from './identify.js';
export { type CrayolaColorName, crayola } from './palettes/crayola.js';
export { type Fs595bColorName, fs595b } from './palettes/fs595b.js';
export { type Fs595cColorName, fs595c } from './palettes/fs595c.js';
export { type IsccNbsColorName, isccNbs } from './palettes/isccNbs.js';
export { type NtcColorName, ntc } from './palettes/ntc.js';
export { type PantoneColorName, pantone } from './palettes/pantone.js';
export { type WebColorName, web } from './palettes/web.js';
export { type X11ColorName, x11 } from './palettes/x11.js';
export { type XkcdColorName, xkcd } from './palettes/xkcd.js';
export {
  type ResolveFuzzyOptions,
  type ResolveMatch,
  type ResolveOptions,
  resolve,
} from './resolve.js';
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
