import { hexToRgba, rgbaToHex } from './conversions/hex.js';
import { hslToRgba, rgbaToHsl } from './conversions/hsl.js';
import { hsvToRgba, rgbaToHsv } from './conversions/hsv.js';
import { rgbaToRgb, rgbToRgba } from './conversions/rgb.js';
import { type DetectedFormat, detectFormat } from './detectFormat.js';
import { getNameIndex, getReverseNameIndex } from './indexing.js';
import type {
  ColorFormat,
  ColorInput,
  ColorValue,
  HexColor,
  HslInput,
  HsvInput,
  Palette,
  PaletteKey,
  Rgba,
  RgbaInput,
  RgbInput,
} from './types.js';

function safeStringify(x: unknown): string {
  if (x === undefined) return 'undefined';
  try {
    const s = JSON.stringify(x);
    return s === undefined ? String(x) : s;
  } catch {
    return Object.prototype.toString.call(x);
  }
}

/**
 * Normalize any recognized color input to canonical `Rgba`.
 * Pass `knownFormat` when the caller has already run `detectFormat` to skip
 * the redundant detection. Throws on `UNKNOWN` input.
 *
 * Palette names (Pantone codes, BYO keys) are not accepted here — they
 * require palette data to parse. Use `convert(name, { palette })` or
 * `resolve(name, { palette })` at the higher level.
 */
export function toRgba(input: ColorInput, knownFormat?: DetectedFormat): Rgba {
  const format = knownFormat ?? detectFormat(input);
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
    default:
      throw new Error(`Unrecognized color input: ${safeStringify(input)}`);
  }
}

/**
 * Emit a canonical `Rgba` in the target structural format. Palette-independent.
 *
 * For palette-key output (e.g. nearest Pantone code, brand name), use
 * `convert(rgba, { format: 'NAME', palette })` — or `identify` for fuzzy,
 * `rgbaToPantone` for the low-level Pantone-only path.
 */
export function fromRgba(rgba: Rgba, format: ColorFormat = 'HEX'): ColorValue {
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
    default: {
      // Runtime safety for JS callers bypassing the ColorFormat union.
      const hint =
        format === ('PANTONE' as unknown)
          ? ` — use convert(rgba, { palette: pantone, format: 'NAME' }) or rgbaToPantone from 'chromonym/conversions/pantone'`
          : '';
      throw new Error(`Unsupported format: ${safeStringify(format)}${hint}`);
    }
  }
}

/**
 * Detect the input color format, normalize to Rgba, and emit the result
 * in the requested output format.
 *
 * Without a `palette` option, `convert` is strictly structural —
 * HEX ↔ RGB ↔ RGBA ↔ HSL ↔ HSV, no palette data ever touched, tree-shakes
 * to the bone.
 *
 * With a `palette` option, `convert` understands the palette's naming
 * scheme both ways:
 * - Input can be a palette name (`'185 C'`, `'Acme Red'`) — parsed via
 *   `palette.normalize` and looked up in `palette.colors`.
 * - Output can be `format: 'NAME'` — the exact canonical key from
 *   `palette.colors`, throws if the color isn't a pixel-exact match (use
 *   `identify` for nearest-match).
 *
 * The palette data comes from the caller's own import, so tree-shaking
 * is preserved: callers who don't pass `palette` never pull a palette.
 *
 * Throws on unrecognized input (parser-flavored — `identify`/`resolve`
 * are the `null`-returning alternatives).
 */

// Overload 1: no palette — structural only. Input is strictly ColorInput.
export function convert(input: ColorInput, opts?: { format?: ColorFormat }): ColorValue;

// Overload 2: palette present, format 'NAME' — returns a palette key.
export function convert<P extends Palette>(
  input: ColorInput | string,
  opts: { palette: P; format: 'NAME' },
): PaletteKey<P>;

// Overload 3: palette present, structural format — returns ColorValue.
export function convert<P extends Palette>(
  input: ColorInput | string,
  opts: { palette: P; format?: ColorFormat },
): ColorValue;

// Implementation
export function convert(
  input: ColorInput | string,
  opts: { format?: ColorFormat | 'NAME'; palette?: Palette } = {},
): ColorValue | string {
  const { format = 'HEX', palette } = opts;

  // --- Parse input → Rgba ---
  // Structural detection first; palette lookup only as a fallback. This
  // way `convert('#ff0000', { palette: brand })` always means "parse hex,"
  // even if the brand palette happens to have a key that normalizes to
  // "ff0000".
  const detected = detectFormat(input as ColorInput);
  let rgba: Rgba;
  if (detected !== 'UNKNOWN') {
    rgba = toRgba(input as ColorInput, detected);
  } else if (palette !== undefined && typeof input === 'string') {
    const canonical = getNameIndex(palette).get(palette.normalize(input));
    if (canonical === undefined) {
      throw new Error(
        `Unrecognized color input: ${safeStringify(input)} (not structural, and not found in palette '${palette.name}')`,
      );
    }
    const hex = (palette.colors as Record<string, HexColor>)[canonical];
    if (hex === undefined) {
      throw new Error(`Unrecognized color input: ${safeStringify(input)}`);
    }
    rgba = hexToRgba(hex);
  } else {
    throw new Error(`Unrecognized color input: ${safeStringify(input)}`);
  }

  // --- Emit ---
  if (format === 'NAME') {
    if (palette === undefined) {
      throw new Error(`convert(_, { format: 'NAME' }) requires a 'palette' option`);
    }
    // Palette colors are alpha = 1 by construction; a partially-transparent
    // input isn't "that named color" in the strict-convert sense. Reject
    // here rather than silently drop alpha during the reverse lookup.
    if (rgba.a !== 1) {
      throw new Error(
        `format: 'NAME' requires fully-opaque input (a === 1). Got a=${rgba.a}. ` +
          `Strip alpha first or use identify() for fuzzy matching.`,
      );
    }
    const hex = rgbaToHex(rgba).toLowerCase();
    const name = getReverseNameIndex(palette).get(hex);
    if (name === undefined) {
      throw new Error(
        `No exact match for ${hex} in palette '${palette.name}'. Use identify() for nearest-match semantics.`,
      );
    }
    return name;
  }
  return fromRgba(rgba, format);
}
