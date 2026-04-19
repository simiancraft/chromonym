import { toRgba } from './convert.js';
import { detectFormat } from './detectFormat.js';
import { nearestAll } from './indexing.js';
import { web } from './palettes/web.js';
import type { ColorInput, DistanceMetric, Palette } from './types.js';

/** Extract string keys from a Palette's `colors` map. */
type PaletteKey<P extends Palette> = Extract<keyof P['colors'], string>;

/** A ranked nearest-match entry: the palette key and the ΔE-space distance to the input. */
export type IdentifyMatch<Name extends string> = {
  readonly name: Name;
  readonly distance: number;
};

/**
 * Rank every palette entry by distance to the given color input, nearest
 * first. Returns `{ name, distance }[]`. Useful for:
 * - "did you mean" UIs (surface the top-5)
 * - quality-gated matching ("only accept if best match < ΔE 5")
 * - palette auditing ("where are the gaps between my brand palette and
 *   the target print palette?")
 *
 * `distance` values are in the selected metric's natural units:
 *   - `deltaE76` / `deltaE94` / `deltaE2000` / `deltaEok`: ΔE units
 *     (≈1 = just-noticeable for most of the gamut on ΔE76/2000).
 *   - `euclidean-srgb` / `euclidean-linear`: channel-unit Euclidean
 *     distance in that space.
 *
 * Returns `[]` on unrecognized input (consistent with `identify`
 * returning `null` — an empty array means "nothing to rank").
 *
 * Defaults: `palette = web`, `metric = palette.defaultMetric`, `k` returns all entries.
 *
 * @example
 *   identifyAll('#ff0000', { palette: pantone, k: 3 })
 *   // [
 *   //   { name: '172 C', distance: 3.21 },
 *   //   { name: 'Red 032 C', distance: 5.47 },
 *   //   { name: 'Warm Red C', distance: 6.02 },
 *   // ]
 */
export function identifyAll<P extends Palette = typeof web>(
  input: ColorInput,
  opts: { palette?: P; metric?: DistanceMetric; k?: number } = {},
): Array<IdentifyMatch<PaletteKey<P>>> {
  const format = detectFormat(input);
  if (format === 'UNKNOWN') return [];

  const palette = (opts.palette ?? web) as P;
  const rgba = toRgba(input, format);
  const metric = opts.metric ?? palette.defaultMetric;
  return nearestAll(rgba, palette, metric, opts.k) as Array<IdentifyMatch<PaletteKey<P>>>;
}
