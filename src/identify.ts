import { COLORSPACE_NAMES, COLORSPACES, DEFAULT_METRICS } from './colorspaces/registry';
import { toRgba } from './convert';
import { detectFormat } from './detectFormat';
import { nearest } from './indexing';
import type { ColorspaceName, DistanceMetric } from './types';

/**
 * Identify the nearest-named color for any color input.
 *
 * The distance metric defaults to the colorspace's recommended choice
 * (web/x11: `deltaE76`, pantone: `deltaE2000`). Override with the `metric`
 * option — e.g. `{ metric: 'euclidean-srgb' }` for maximum speed, or
 * `{ metric: 'deltaE2000' }` for strictest perceptual accuracy.
 *
 * Returns `null` if the input isn't a recognized color shape or the
 * colorspace name isn't one of `web` / `x11` / `pantone`.
 *
 * Defaults: colorspace = 'web', metric = DEFAULT_METRICS[colorspace].
 */
export function identify(
  input: Parameters<typeof toRgba>[0],
  opts: { colorspace?: ColorspaceName; metric?: DistanceMetric } = {},
): string | null {
  const format = detectFormat(input);
  if (format === 'UNKNOWN') return null;

  const { colorspace = 'web', metric } = opts;
  if (!COLORSPACE_NAMES.has(colorspace)) return null;

  const rgba = toRgba(input, format);
  const name = nearest(rgba, COLORSPACES[colorspace], metric ?? DEFAULT_METRICS[colorspace]);
  return name || null;
}
