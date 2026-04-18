import { web } from './colorspaces/web';
import { toRgba } from './convert';
import { detectFormat } from './detectFormat';
import { nearest } from './indexing';
import type { Colorspace, ColorInput, DistanceMetric } from './types';

/** Extract string keys from a Colorspace's `colors` map. */
type ColorspaceKey<C extends Colorspace> = Extract<keyof C['colors'], string>;

/**
 * Identify the nearest-named color for any color input.
 *
 * The distance metric defaults to the colorspace's own `defaultMetric`
 * (web/x11: `deltaE76`, pantone: `deltaE2000`). Override with the `metric`
 * option — e.g. `{ metric: 'euclidean-srgb' }` for maximum speed, or
 * `{ metric: 'deltaE2000' }` for strictest perceptual accuracy.
 *
 * Returns `null` if the input isn't a recognized color shape.
 *
 * Defaults: colorspace = `web`.
 *
 * BYO colorspaces: pass any object matching `Colorspace<Name>` and the
 * return type is inferred from its `colors` keys — no registration needed.
 */
export function identify<C extends Colorspace = typeof web>(
  input: ColorInput,
  opts: { colorspace?: C; metric?: DistanceMetric } = {},
): ColorspaceKey<C> | null {
  const format = detectFormat(input);
  if (format === 'UNKNOWN') return null;

  const palette = (opts.colorspace ?? web) as C;
  const rgba = toRgba(input, format);
  const name = nearest(rgba, palette, opts.metric ?? palette.defaultMetric);
  return (name as ColorspaceKey<C>) || null;
}
