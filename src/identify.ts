import { pantone } from './colorspaces/pantone';
import { web } from './colorspaces/web';
import { x11 } from './colorspaces/x11';
import { toRgba } from './convert';
import { detectFormat } from './detectFormat';
import { nearestByRgb } from './indexing';
import type { Colorspace, ColorspaceName } from './types';

const COLORSPACES: Record<ColorspaceName, Colorspace> = { web, x11, pantone };
// Guard Record lookup against prototype-chain keys like '__proto__'.
const COLORSPACE_NAMES: ReadonlySet<ColorspaceName> = new Set(['web', 'x11', 'pantone']);

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
