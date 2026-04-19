import type { NormalizeFn } from '../types.js';

/**
 * Name normalizers used by palettes.
 *
 * Tree-shake note: this module has zero imports beyond a type. Palette
 * modules (`web`, `x11`, `pantone`, or user BYO palettes) can reference
 * these without dragging in the full `indexing.ts` graph, which pulls
 * math modules needed only when `identify` / `resolve` actually runs.
 */

/** Lowercase + strip non-alphanumeric. Works for web, x11, and most BYO. */
export const standardNormalize: NormalizeFn = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Pantone: also strip a leading "Pantone" or "PMS" prefix so that
 * "185 C", "185c", "Pantone 185 C", "PMS185C" all map to "185c".
 */
export const pantoneNormalize: NormalizeFn = (s) =>
  s
    .toLowerCase()
    .replace(/^(pantone|pms)\s*/, '')
    .replace(/[^a-z0-9]/g, '');
