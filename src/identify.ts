import { pantone } from './colorspaces/pantone';
import { web } from './colorspaces/web';
import { x11 } from './colorspaces/x11';
import { hexToRgba } from './conversions/hex';
import { convert } from './convert';
import { detectFormat } from './detectFormat';
import { euclideanDistance } from './math/euclideanDistance';
import type { ColorInput, Colorspace, ColorspaceName, HexColor, Rgba } from './types';

const COLORSPACES: Record<ColorspaceName, Colorspace> = { web, x11, pantone };

// Lazy per-colorspace rgba index — built on first lookup, reused thereafter.
const rgbaIndexes = new Map<ColorspaceName, Array<readonly [name: string, rgba: Rgba]>>();

function getRgbaIndex(colorspace: ColorspaceName): Array<readonly [string, Rgba]> {
  let idx = rgbaIndexes.get(colorspace);
  if (idx === undefined) {
    const space = COLORSPACES[colorspace];
    idx = Object.entries(space).map(([name, hex]) => [name, hexToRgba(hex as HexColor)] as const);
    rgbaIndexes.set(colorspace, idx);
  }
  return idx;
}

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
  const rgba = convert(input, { format: 'RGBA' }) as Rgba;
  const entries = getRgbaIndex(colorspace);

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
