// BYO-palette authoring helper. See the companion test file for the full
// matrix of accepted value shapes; see the README "Bring your own palette"
// section for how callers are meant to reach for this.
//
// Why this exists: without it, a BYO palette needs
//   `{ colors: {...}, ... } as const satisfies Palette<'Red' | 'Blue'>`
// which requires listing the key union twice and only accepts `HexColor`
// values. With this helper, callers pass any `ColorInput` value (hex, rgb
// string, hsl object, tuple, etc.) and the helper normalizes every entry
// to `HexColor` at define time, so downstream `identify`/`resolve`/`convert`
// and the indexing caches still see a uniform hex-only palette.
//
// Error policy: on an unparseable value we `console.warn` and drop the
// key rather than throw, so one bad entry doesn't sink a whole palette.
// The caller sees the warning with the palette name and the offending
// value; the resulting palette has the surviving entries and behaves
// normally.

import { rgbaToHex } from './conversions/hex.js';
import { toRgba } from './convert.js';
import type { ColorInput, DistanceMetric, HexColor, NormalizeFn, Palette } from './types.js';

/**
 * The authoring shape accepted by {@link defineColorPalette}: same as
 * {@link Palette}, except `colors` values may be any {@link ColorInput}
 * rather than requiring {@link HexColor}. Exported mainly for
 * type-level inspection; most callers should not reference it directly.
 */
export type DefineColorPaletteInput = {
  readonly name: string;
  readonly colors: Readonly<Record<string, ColorInput>>;
  readonly normalize: NormalizeFn;
  readonly defaultMetric: DistanceMetric;
};

function describe(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  try {
    const s = JSON.stringify(value);
    return s ?? String(value);
  } catch {
    return String(value);
  }
}

/**
 * Author a BYO palette with mixed-format color values. Values are
 * normalized to {@link HexColor} at call time; unparseable entries are
 * dropped with a `console.warn`.
 *
 * The `const` type parameter preserves the literal-key union so downstream
 * `identify`/`resolve`/`convert` narrow their return types to the palette's
 * actual keys, the same way the built-in palettes do.
 *
 * @example
 * // Mixed input formats; all end up as HexColor in the returned palette.
 * const brand = defineColorPalette({
 *   name: 'brand',
 *   colors: {
 *     'Acme Red':  '#ff0044',
 *     'Acme Blue': 'rgb(0, 68, 255)',
 *     'Acme Ink':  { r: 20, g: 20, b: 30 },
 *     'Acme Mist': [240, 244, 248],
 *   },
 *   normalize: (s) => s.toLowerCase().replace(/\s+/g, ''),
 *   defaultMetric: 'deltaE2000',
 * });
 *
 * identify('#ff0000', { palette: brand });
 * // typed as "'Acme Red' | 'Acme Blue' | 'Acme Ink' | 'Acme Mist' | null"
 *
 * @example
 * // A bad value doesn't break the palette; it's dropped with a warning.
 * const partial = defineColorPalette({
 *   name: 'partial',
 *   colors: { good: '#00ff00', bad: 'taco' as never },
 *   normalize: (s) => s,
 *   defaultMetric: 'deltaE76',
 * });
 * // console.warn: [chromonym] defineColorPalette("partial"): skipping key
 * //   "bad"; expected a color, got "taco"
 * // partial.colors === { good: '#00ff00' }
 */
export function defineColorPalette<const P extends DefineColorPaletteInput>(
  p: P,
): Palette<Extract<keyof P['colors'], string>> {
  // Prototype-free accumulator, not a plain `{}`. A caller hydrating
  // `p.colors` from JSON (common for BYO palettes sourced from a CMS,
  // a brand spec, etc.) can legitimately have a key like `__proto__`
  // or `constructor`; palette data is just names and hex strings, so
  // those names have no special meaning here. With `{}`, assigning
  // `'#ff0000'` to `normalized['__proto__']` would be silently eaten
  // by the `Object.prototype.__proto__` setter (which rejects string
  // values without throwing), and the key would disappear without
  // hitting the bad-value `console.warn` path. `Object.create(null)`
  // has no setter to intercept, so every key round-trips as a plain
  // own property.
  const normalized = Object.create(null) as Record<string, HexColor>;
  for (const [key, value] of Object.entries(p.colors)) {
    try {
      normalized[key] = rgbaToHex(toRgba(value));
    } catch {
      // Library-level diagnostic on user misconfiguration; intentional
      // so authors see the dropped key without blowing up the whole
      // module load.
      console.warn(
        `[chromonym] defineColorPalette(${JSON.stringify(p.name)}): ` +
          `skipping key ${JSON.stringify(key)}; expected a color, got ${describe(value)}`,
      );
    }
  }
  return {
    name: p.name,
    colors: normalized as Readonly<Record<Extract<keyof P['colors'], string>, HexColor>>,
    normalize: p.normalize,
    defaultMetric: p.defaultMetric,
  };
}
