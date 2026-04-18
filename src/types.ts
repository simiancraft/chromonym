// --- Hex ---
export type HexColor = `#${string}`;

// --- RGB (no alpha) ---
export type RgbString =
  | `rgb(${number},${number},${number})`
  | `rgb(${number}, ${number}, ${number})`;
export type RgbTuple = readonly [r: number, g: number, b: number];
export type RgbObject = { r: number; g: number; b: number };
export type RgbInput = RgbString | RgbTuple | RgbObject;

// --- RGBA (canonical internal representation) ---
export type RgbaString =
  | `rgba(${number},${number},${number},${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`;
export type RgbaTuple = readonly [r: number, g: number, b: number, a: number];
export type Rgba = { r: number; g: number; b: number; a: number };
export type RgbaInput = RgbaString | RgbaTuple | Rgba;

// --- HSL ---
export type HslString = `hsl(${number}, ${number}%, ${number}%)`;
export type HslObject = { h: number; s: number; l: number };
export type HslInput = HslString | HslObject;

// --- HSV ---
export type HsvString = `hsv(${number}, ${number}%, ${number}%)`;
export type HsvObject = { h: number; s: number; v: number };
export type HsvInput = HsvString | HsvObject;

// --- Pantone ---
// Loose for now; refine to a template-literal pattern once the code list lands.
export type PantoneCode = string;

// --- Unified input: anything the public API accepts ---
export type ColorInput = HexColor | RgbInput | RgbaInput | HslInput | HsvInput | PantoneCode;

// --- Format keys (SCREAMING_CAPS — these are lookup keys for converter dispatch) ---
const FORMAT_VALUES = ['HEX', 'RGB', 'RGBA', 'HSL', 'HSV', 'PANTONE'] as const;
export type ColorFormat = (typeof FORMAT_VALUES)[number];
export const COLOR_FORMATS: ReadonlySet<ColorFormat> = new Set(FORMAT_VALUES);

// --- A returned color value (union of canonical output shapes, one per ColorFormat) ---
export type ColorValue = HexColor | RgbString | Rgba | HslString | HsvString | PantoneCode;

// --- Colorspace: a named map of color-name -> hex. Pure data. ---
export type Colorspace = Record<string, HexColor>;
export type ColorspaceName = 'web' | 'x11' | 'pantone';

// --- Distance metric for nearest-name lookup (used by `identify`). ---
// Choose based on palette density and accuracy needs:
//   'euclidean-srgb'    — fastest; fine for well-separated palettes (web, x11)
//   'euclidean-linear'  — undoes sRGB gamma first; closer to physical light mixing
//   'deltaE76'          — Euclidean in CIELAB; simple perceptual metric (CIE 1976)
//   'deltaE94'          — chroma/hue weighted; fixes saturation overweighting
//   'deltaE2000'        — industry standard; fixes blue/purple region
//   'deltaEok'          — Euclidean in OKLAB (Ottosson 2020); most modern;
//                         perceptually uniform by construction, cheaper than ΔE2000
export type DistanceMetric =
  | 'euclidean-srgb'
  | 'euclidean-linear'
  | 'deltaE76'
  | 'deltaE94'
  | 'deltaE2000'
  | 'deltaEok';
