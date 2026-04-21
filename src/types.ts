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

// --- Unified input: anything the core `convert` / `identify` path accepts. ---
// Pantone strings are deliberately NOT in this union — they require the
// `pantone` palette data to parse. Callers who want to feed a Pantone code
// import `pantoneToRgba` from `chromonym/conversions/pantone` (or the
// subpath) and pass the resulting `Rgba` here. Keeps `identify` / `convert`
// palette-free so they tree-shake down to structural math.
export type ColorInput = HexColor | RgbInput | RgbaInput | HslInput | HsvInput;

// --- Format keys (SCREAMING_CAPS — these are lookup keys for converter dispatch) ---
// PANTONE intentionally omitted — see ColorInput comment.
const FORMAT_VALUES = ['HEX', 'RGB', 'RGBA', 'HSL', 'HSV'] as const;
export type ColorFormat = (typeof FORMAT_VALUES)[number];
export const COLOR_FORMATS: ReadonlySet<ColorFormat> = new Set(FORMAT_VALUES);

// --- A returned color value (union of canonical output shapes, one per ColorFormat) ---
export type ColorValue = HexColor | RgbString | Rgba | HslString | HsvString;

// --- Name normalization function shape (used by palettes). ---
// A NormalizeFn takes a user-supplied name ("Pantone 185 C") and returns
// its canonical lookup key ("185c"). Paired with each Palette.
export type NormalizeFn = (name: string) => string;

/**
 * A named color lookup plus its indexing rules. The unit of BYO
 * extension: pass one of these to `identify`/`resolve`/`convert`
 * (or import a built-in like `web` / `x11` / `pantone` / `crayola`)
 * and the same nearest-match / name-resolution machinery runs over
 * it.
 *
 * Generic over `Name` so BYO palettes carry their literal-key union
 * through `identify`'s return type. The `as const satisfies` pattern
 * is the standard BYO construction; it locks every key as a literal
 * so inference doesn't widen to `string`.
 *
 * @example
 * // Minimal BYO palette with full inference:
 * const brand = {
 *   name: 'brand',
 *   colors: {
 *     'Acme Red':  '#ff0044',
 *     'Acme Blue': '#0044ff',
 *   },
 *   normalize: (s: string) => s.toLowerCase().replace(/\s+/g, ''),
 *   defaultMetric: 'deltaE2000',
 * } as const satisfies Palette<'Acme Red' | 'Acme Blue'>;
 *
 * identify('#ff0000', { palette: brand });
 * // typed as "'Acme Red' | 'Acme Blue' | null"
 */
export type Palette<Name extends string = string> = {
  /**
   * Human-readable palette name; used in error messages so a thrown
   * error from `convert` tells you which palette missed the lookup.
   */
  readonly name: string;
  /**
   * The color map. Keys are the palette's canonical names (display
   * form; whatever comes back from `identify`). Values are hex strings.
   */
  readonly colors: Readonly<Record<Name, HexColor>>;
  /**
   * Name normalizer: run on both user input and canonical keys before
   * strict lookup. Collapses casing, whitespace, and common prefixes
   * so `'Pantone 185 C'`, `'pantone-185c'`, and `'185 C'` all resolve
   * to the same entry.
   */
  readonly normalize: NormalizeFn;
  /**
   * The distance metric used by `identify` when the caller doesn't
   * override via `{ metric }`. Chosen per palette based on density
   * and saturation characteristics (see `DistanceMetric`).
   */
  readonly defaultMetric: DistanceMetric;
};

// Extract the string-literal key union from a Palette's `colors` map.
// Used across identify/resolve/convert to narrow return types to the
// caller's palette. Exported so consumers writing wrapper code can
// reuse the same key-extraction rule without redeclaring it.
export type PaletteKey<P extends Palette> = Extract<keyof P['colors'], string>;

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
