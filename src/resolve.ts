import { pantone } from './colorspaces/pantone';
import { web } from './colorspaces/web';
import { x11 } from './colorspaces/x11';
import { convert } from './convert';
import type { ColorFormat, Colorspace, ColorspaceName, ColorValue, HexColor } from './types';

const COLORSPACES: Record<ColorspaceName, Colorspace> = { web, x11, pantone };

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Pantone-specific: also strip leading "Pantone" / "PMS" prefix so that
// "Pantone 185 C" and "PMS 185C" both resolve to "185C".
function normalizeForPantone(s: string): string {
  return s
    .toLowerCase()
    .replace(/^(pantone|pms)\s*/, '')
    .replace(/[^a-z0-9]/g, '');
}

const indexes = new Map<ColorspaceName, Map<string, string>>();

function getIndex(colorspace: ColorspaceName): Map<string, string> {
  let idx = indexes.get(colorspace);
  if (idx === undefined) {
    idx = new Map();
    const space = COLORSPACES[colorspace];
    const normFn = colorspace === 'pantone' ? normalizeForPantone : normalize;
    for (const key of Object.keys(space)) {
      idx.set(normFn(key), key);
    }
    indexes.set(colorspace, idx);
  }
  return idx;
}

/**
 * Resolve a human-readable name to a color. Normalizes the input
 * (lowercases, strips non-alphanumeric characters, and for the pantone
 * colorspace also strips a leading "Pantone" or "PMS" prefix) before
 * looking it up in the chosen colorspace. Returns `null` if unknown.
 *
 * Defaults: colorspace = 'web', format = 'HEX'.
 */
export function resolve(
  name: string,
  opts: { colorspace?: ColorspaceName; format?: ColorFormat } = {},
): ColorValue | null {
  const { colorspace = 'web', format = 'HEX' } = opts;
  const normFn = colorspace === 'pantone' ? normalizeForPantone : normalize;
  const canonical = getIndex(colorspace).get(normFn(name));
  if (canonical === undefined) return null;
  const space = COLORSPACES[colorspace];
  const hex = space[canonical] as HexColor;
  return convert(hex, { format });
}
