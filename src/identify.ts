import { COLORSPACE_NAMES, COLORSPACES } from './colorspaces/registry';
import { toRgba } from './convert';
import { detectFormat } from './detectFormat';
import { nearestByRgb } from './indexing';
import type { ColorspaceName } from './types';

/**
 * Identify the nearest-named color for any color input.
 * Uses squared Euclidean distance in RGB (alpha is ignored).
 * Returns `null` if the input isn't a recognized color shape or the
 * colorspace name isn't one of `web` / `x11` / `pantone`.
 *
 * Defaults: colorspace = 'web'.
 */
export function identify(
  input: Parameters<typeof toRgba>[0],
  opts: { colorspace?: ColorspaceName } = {},
): string | null {
  const format = detectFormat(input);
  if (format === 'UNKNOWN') return null;

  const { colorspace = 'web' } = opts;
  if (!COLORSPACE_NAMES.has(colorspace)) return null;

  const rgba = toRgba(input, format);
  const name = nearestByRgb(rgba, COLORSPACES[colorspace]);
  return name || null;
}
