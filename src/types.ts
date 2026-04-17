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

// --- Pantone ---
// Loose for now; refine to a template-literal pattern once the code list lands.
export type PantoneCode = string;

// --- Unified input: anything the public API accepts ---
export type ColorInput = HexColor | RgbInput | RgbaInput | HslInput | PantoneCode;

// --- Output format discriminator (for convert / lookup options.format) ---
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'pantone';

// --- A returned color value (union of canonical output shapes, one per ColorFormat) ---
export type ColorValue = HexColor | RgbString | Rgba | HslString | PantoneCode;

// --- Colorspace: a named map of color-name -> hex. Pure data. ---
export type Colorspace = Record<string, HexColor>;
export type ColorspaceName = 'web' | 'x11' | 'pantone';
