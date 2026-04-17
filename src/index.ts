// Public API barrel — explicit named re-exports only (tree-shake friendly).
// No default export; no side effects at module scope.

export { type WebColorName, web } from './colorspaces/web';
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
