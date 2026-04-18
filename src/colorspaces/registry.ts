import { type NormalizeFn, pantoneNormalize, standardNormalize } from '../indexing';
import type { Colorspace, ColorspaceName, DistanceMetric } from '../types';
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

/**
 * Default distance metric per colorspace, picked for the density of each
 * palette. Users can override via `identify(_, { metric })`.
 *
 *   web    — 148 entries, well-separated; ΔE76 suffices and is cheap.
 *   x11    — 658 entries; ΔE76 is the sweet spot (ΔE94/2000 overkill).
 *   pantone — 907 entries densely packed in the blue/purple region; ΔE2000
 *             is the industry standard and what color-print tools use.
 */
export const DEFAULT_METRICS: Record<ColorspaceName, DistanceMetric> = {
  web: 'deltaE76',
  x11: 'deltaE76',
  pantone: 'deltaE2000',
};
