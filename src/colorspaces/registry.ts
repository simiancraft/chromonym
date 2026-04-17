import { type NormalizeFn, pantoneNormalize, standardNormalize } from '../indexing';
import type { Colorspace, ColorspaceName } from '../types';
import { pantone } from './pantone';
import { web } from './web';
import { x11 } from './x11';

/**
 * Internal registry of known colorspaces + their normalizers.
 *
 * Tree-shake note: this file imports all three colorspaces, so anything
 * that imports from here pays for all three. It's used by `resolve` and
 * `identify`, both of which need a string-keyed lookup; users who want
 * to tree-shake a single colorspace should import `web`, `x11`, or
 * `pantone` directly from the root barrel.
 */

export const COLORSPACES: Record<ColorspaceName, Colorspace> = { web, x11, pantone };

/** Guards Record indexing against prototype-chain keys like `__proto__`. */
export const COLORSPACE_NAMES: ReadonlySet<ColorspaceName> = new Set(['web', 'x11', 'pantone']);

export const NORMALIZERS: Record<ColorspaceName, NormalizeFn> = {
  web: standardNormalize,
  x11: standardNormalize,
  pantone: pantoneNormalize,
};
