// Public API barrel — explicit named re-exports only (tree-shake friendly).
// No default export; no side effects at module scope.

export type {
  ColorFormat,
  ColorInput,
  ColorValue,
  Colorspace,
  ColorspaceName,
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
} from './types.ts';

export { web, type WebColorName } from './colorspaces/web.ts';
