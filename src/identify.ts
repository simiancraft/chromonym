import { pantone } from './colorspaces/pantone';
import { web } from './colorspaces/web';
import { x11 } from './colorspaces/x11';
import { convert } from './convert';
import { detectFormat } from './detectFormat';
import { getRgbaIndex } from './indexing';
import { euclideanDistance } from './math/euclideanDistance';
import type { ColorInput, Colorspace, ColorspaceName, Rgba } from './types';

const COLORSPACES: Record<ColorspaceName, Colorspace> = { web, x11, pantone };
// Guard Record lookup against prototype-chain keys like '__proto__'.
const COLORSPACE_NAMES: ReadonlySet<ColorspaceName> = new Set(['web', 'x11', 'pantone']);

/**
 * Identify the nearest-named color for any color input.
 * Uses Euclidean distance in RGB (alpha is ignored).
 * Returns `null` if the input isn't a recognized color shape.
 *
 * Defaults: colorspace = 'web'.
 */
export function identify(
  input: ColorInput,
  opts: { colorspace?: ColorspaceName } = {},
): string | null {
  if (detectFormat(input) === 'UNKNOWN') return null;

  const { colorspace = 'web' } = opts;
  if (!COLORSPACE_NAMES.has(colorspace)) return null;
  const rgba = convert(input, { format: 'RGBA' }) as Rgba;
  const entries = getRgbaIndex(COLORSPACES[colorspace]);

  let bestName: string | null = null;
  let bestDistance = Infinity;
  for (const [name, candidate] of entries) {
    const d = euclideanDistance(rgba, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      bestName = name;
    }
  }
  return bestName;
}
