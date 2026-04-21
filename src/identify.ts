import { hexToRgba } from './conversions/hex.js';
import { toRgba } from './convert.js';
import { detectFormat } from './detectFormat.js';
import { getNameIndex, nearest, nearestAll } from './indexing.js';
import { web } from './palettes/web.js';
import type { ColorInput, DistanceMetric, HexColor, Palette, PaletteKey, Rgba } from './types.js';

/**
 * One ranked nearest-match entry when `identify` is called with `k`.
 * `value` is the palette's stored hex for the match (useful for rendering
 * swatches). `distance` is in the selected metric's natural units: ΔE for
 * `deltaE*` metrics, channel-unit Euclidean for the others.
 */
export type IdentifyMatch<Name extends string> = {
  readonly name: Name;
  readonly value: HexColor;
  readonly distance: number;
};

/**
 * Options for {@link identify}. Generic over the target palette so the
 * return type narrows to its literal-key union.
 *
 * @example
 * identify('#ff0000', { palette: pantone, metric: 'deltaE2000' });
 * identify('rebeccapurple', { palette: x11, source: web });
 */
export type IdentifyOptions<P extends Palette = typeof web> = {
  /**
   * Target palette to search in. Defaults to `web` (CSS named colors).
   */
  readonly palette?: P;
  /**
   * Source palette for cross-palette name input: when `input` is a name
   * from a different palette (e.g. `'rebeccapurple'` when `palette` is
   * `pantone`), set `source` to the palette that owns the name so it can
   * be resolved to an Rgba before the nearest-match lookup.
   *
   * @remarks
   * The `input` argument isn't validated against `source`'s keys at
   * compile time; unknown names resolve to `null` at runtime.
   */
  readonly source?: Palette;
  /**
   * Override the distance metric. Defaults to `palette.defaultMetric`
   * (web/x11: `'deltaE76'`, pantone: `'deltaE2000'`, crayola: `'deltaEok'`).
   */
  readonly metric?: DistanceMetric;
};

/**
 * Options for the ranked top-k variant of {@link identify}. Returns an
 * array of {@link IdentifyMatch} entries instead of a single name.
 *
 * @example
 * identify('#ff0080', { palette: pantone, k: 3 });
 * // [
 * //   { name: '219 C',    value: '#da1884', distance: 2.1 },
 * //   { name: '226 C',    value: '#d0006f', distance: 3.9 },
 * //   { name: 'Red 032 C',value: '#ef3340', distance: 5.4 },
 * // ]
 */
export type IdentifyRankedOptions<P extends Palette = typeof web> = IdentifyOptions<P> & {
  /**
   * Number of ranked matches to return. When present, `identify`
   * returns `IdentifyMatch[]` instead of a single key.
   */
  readonly k: number;
};

/**
 * Parse a string input that may be a color literal or a palette name.
 * Returns the canonical Rgba, or `null` if nothing matches.
 */
function parseInput(input: ColorInput | string, source?: Palette): Rgba | null {
  const detected = detectFormat(input as ColorInput);
  if (detected !== 'UNKNOWN') return toRgba(input as ColorInput, detected);
  if (source !== undefined && typeof input === 'string') {
    const canonical = getNameIndex(source).get(source.normalize(input));
    if (canonical === undefined) return null;
    const hex = (source.colors as Record<string, HexColor>)[canonical];
    if (hex === undefined) return null;
    return hexToRgba(hex);
  }
  return null;
}

/**
 * Identify the nearest-named color for any color input (or palette name
 * from another palette via `source`).
 *
 * **Simple case — color in, name out:**
 *   identify('#ff0000')                           → 'red'
 *   identify('#ff0000', { palette: pantone })     → '172 C'
 *
 * **Cross-palette — name from one palette, nearest in another:**
 *   identify('rebeccapurple', { palette: pantone, source: web })  → '267 C'
 *   identify('Razzmatazz',    { palette: pantone, source: crayola }) → '213 C'
 *
 * **Top-k ranked matches with ΔE distances:**
 *   identify('#ff0000', { palette: pantone, k: 3 })
 *   // [{ name: '172 C', value: '#fa4616', distance: 3.2 }, ...]
 *
 * The distance metric defaults to the target palette's `defaultMetric`
 * (web/x11: `deltaE76`, pantone: `deltaE2000`, crayola: `deltaEok`).
 * Override with `metric`.
 *
 * Returns `null` (or `[]` when `k` is set) if the input can't be parsed.
 */

// Input accepts `ColorInput | string`. The `string` widening is load-bearing
// for two flows: (1) cross-palette name lookup (`identify(name, { source })`),
// and (2) interactive callers passing untrusted user text; the library
// returns `null` on unparseable input rather than throwing, so consumers can
// feed it directly from a text field. Tightening to `ColorInput`-only would
// break both patterns and force every interactive consumer to cast or
// validate at every call site. Runtime safety is maintained by `parseInput`
// returning `null` for anything it can't interpret.

// Overload 1: no `k` — single name (or null). Unchanged legacy shape.
export function identify<P extends Palette = typeof web>(
  input: ColorInput | string,
  opts?: IdentifyOptions<P>,
): PaletteKey<P> | null;

// Overload 2: `k` present — ranked Match[] with distances.
export function identify<P extends Palette = typeof web>(
  input: ColorInput | string,
  opts: IdentifyRankedOptions<P>,
): Array<IdentifyMatch<PaletteKey<P>>>;

// Implementation.
export function identify(
  input: ColorInput | string,
  opts: IdentifyOptions & { k?: number } = {},
): string | null | Array<IdentifyMatch<string>> {
  const palette = opts.palette ?? web;
  const metric = opts.metric ?? palette.defaultMetric;
  const rgba = parseInput(input, opts.source);

  if (opts.k !== undefined) {
    if (rgba === null) return [];
    const raw = nearestAll(rgba, palette, metric, opts.k);
    return raw.map((m) => {
      const value = (palette.colors as Record<string, HexColor>)[m.name];
      return { name: m.name, value: value as HexColor, distance: m.distance };
    });
  }

  if (rgba === null) return null;
  const name = nearest(rgba, palette, metric);
  return name || null;
}
