import { web } from './palettes/web';
import { toRgba } from './convert';
import { detectFormat } from './detectFormat';
import { nearest } from './indexing';
import type { ColorInput, DistanceMetric, Palette } from './types';

/** Extract string keys from a Palette's `colors` map. */
type PaletteKey<P extends Palette> = Extract<keyof P['colors'], string>;

/**
 * Identify the nearest-named color for any color input.
 *
 * The distance metric defaults to the palette's own `defaultMetric`
 * (web/x11: `deltaE76`, pantone: `deltaE2000`). Override with the `metric`
 * option — e.g. `{ metric: 'euclidean-srgb' }` for maximum speed, or
 * `{ metric: 'deltaE2000' }` for strictest perceptual accuracy.
 *
 * Returns `null` if the input isn't a recognized color shape.
 *
 * Defaults: palette = `web`.
 *
 * BYO palettes: pass any object matching `Palette<Name>` and the
 * return type is inferred from its `colors` keys — no registration needed.
 */
export function identify<P extends Palette = typeof web>(
  input: ColorInput,
  opts: { palette?: P; metric?: DistanceMetric } = {},
): PaletteKey<P> | null {
  const format = detectFormat(input);
  if (format === 'UNKNOWN') return null;

  const palette = (opts.palette ?? web) as P;
  const rgba = toRgba(input, format);
  const name = nearest(rgba, palette, opts.metric ?? palette.defaultMetric);
  return (name as PaletteKey<P>) || null;
}
