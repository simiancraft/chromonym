// Public API barrel — explicit named re-exports only (tree-shake friendly).
// No default export; no side effects at module scope.

export { type PantoneColorName, pantone } from './colorspaces/pantone';
export { type WebColorName, web } from './colorspaces/web';
export { type X11ColorName, x11 } from './colorspaces/x11';
export { hexToRgba, rgbaToHex } from './conversions/hex';
export { type DetectedFormat, detectFormat } from './detectFormat';
export type {
  ColorFormat,
  ColorInput,
  Colorspace,
  ColorspaceName,
  ColorValue,
  HexColor,
  HslInput,
  HslObject,
  HslString,
  HsvInput,
  HsvObject,
  HsvString,
  PantoneCode,
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
