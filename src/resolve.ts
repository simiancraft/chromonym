import { pantone } from './colorspaces/pantone';
import { web } from './colorspaces/web';
import { x11 } from './colorspaces/x11';
import { convert } from './convert';
import { getNameIndex, type NormalizeFn, pantoneNormalize, standardNormalize } from './indexing';
import type { ColorFormat, Colorspace, ColorspaceName, ColorValue, HexColor } from './types';

const COLORSPACES: Record<ColorspaceName, Colorspace> = { web, x11, pantone };
const NORMALIZERS: Record<ColorspaceName, NormalizeFn> = {
  web: standardNormalize,
  x11: standardNormalize,
  pantone: pantoneNormalize,
};

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
  const space = COLORSPACES[colorspace];
  const normalize = NORMALIZERS[colorspace];
  const canonical = getNameIndex(space, normalize).get(normalize(name));
  if (canonical === undefined) return null;
  const hex = space[canonical] as HexColor;
  return convert(hex, { format });
}
