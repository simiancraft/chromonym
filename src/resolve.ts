import { hexToRgba } from './conversions/hex.js';
import { fromRgba } from './convert.js';
import { getNameIndex } from './indexing.js';
import { levenshtein } from './math/editDistance.js';
import { web } from './palettes/web.js';
import type { ColorFormat, ColorValue, HexColor, Palette, PaletteKey } from './types.js';

// No built-in palette key exceeds ~30 chars post-normalize; anything well past
// that can't plausibly win a fuzzy match and risks pathological O(n·m) cost
// across every palette entry. Guard the k-branch input at 64.
const MAX_FUZZY_INPUT_LENGTH = 64;

/**
 * One ranked fuzzy-match entry when `resolve` is called with `k`.
 * `distance` is the Levenshtein edit distance between the normalized
 * input and the normalized palette key: an integer count of insertions,
 * deletions, and substitutions.
 */
export type ResolveMatch<Name extends string> = {
  readonly name: Name;
  readonly value: ColorValue;
  readonly distance: number;
};

/**
 * Options for the strict variant of {@link resolve}. Generic over the
 * palette so the caller sees narrow inference on `opts.palette` (same
 * pattern as {@link IdentifyOptions}).
 *
 * @example
 * resolve('Pantone 185 C', { palette: pantone });
 * resolve('rebeccapurple', { format: 'RGB' });
 */
export type ResolveOptions<P extends Palette = typeof web> = {
  /**
   * Palette to look the name up in. Defaults to `web` (CSS named colors).
   */
  readonly palette?: P;
  /**
   * Output format for the matched color. Defaults to `'HEX'`.
   */
  readonly format?: ColorFormat;
};

/**
 * Options for the fuzzy (top-k) variant of {@link resolve}. Returns an
 * array of {@link ResolveMatch} entries ranked by edit distance.
 *
 * @example
 * resolve('rebecapurple', { palette: web, k: 3 });
 * // [
 * //   { name: 'rebeccapurple', value: '#663399', distance: 1 },
 * //   { name: 'purple',        value: '#800080', distance: 6 },
 * //   ...
 * // ]
 */
export type ResolveFuzzyOptions<P extends Palette = typeof web> = {
  /**
   * Palette to search. Generic so the return narrows to the palette's
   * literal-key union.
   */
  readonly palette?: P;
  /**
   * Output format for each matched `value`. Defaults to `'HEX'`.
   */
  readonly format?: ColorFormat;
  /**
   * Number of ranked matches to return. When present, `resolve` runs in
   * typo-tolerant mode (Levenshtein edit distance against normalized
   * keys) and returns `ResolveMatch[]` instead of a single value.
   */
  readonly k: number;
};

/**
 * Resolve a human-readable name to a color. Normalizes the input using
 * the palette's own `normalize` function before looking it up.
 *
 * **Without `k`** (strict, unchanged): returns the exact match value, or
 * `null` if the normalized name isn't in the palette.
 *
 * **With `k`** (fuzzy, typo-tolerant): returns an array of the top `k`
 * matches ranked by Levenshtein edit distance against normalized keys.
 * Useful for user-typed input where misspellings, casing, and
 * punctuation can all be recovered.
 *
 * ```ts
 * resolve('rebeccapurple')                                // '#663399'
 * resolve('rebecapurple')                                 // null (strict)
 * resolve('rebecapurple', { palette: web, k: 3 })         // fuzzy:
 * //   [{ name: 'rebeccapurple', value: '#663399', distance: 1 },
 * //    { name: 'purple',        value: '#800080', distance: 6 },
 * //    ...]
 * ```
 *
 * Tie-breaking on equal edit distance: first-declared entry in the
 * palette's `colors` object wins. Matches `identify`'s contract.
 *
 * `k` is forgiving: fractional rounds, negatives and zero return
 * `[]`, `NaN` / `±Infinity` return `[]`. No throws on invalid `k`.
 *
 * Defaults: palette = `web`, format = 'HEX', `k` = undefined (strict).
 */

// Overload 1: strict — single ColorValue or null (unchanged).
export function resolve<P extends Palette = typeof web>(
  name: string,
  opts?: ResolveOptions<P>,
): ColorValue | null;

// Overload 2: fuzzy top-k — ranked Match[].
export function resolve<P extends Palette = typeof web>(
  name: string,
  opts: ResolveFuzzyOptions<P>,
): Array<ResolveMatch<PaletteKey<P>>>;

// Implementation.
export function resolve(
  name: string,
  opts: ResolveOptions & { k?: number } = {},
): ColorValue | null | Array<ResolveMatch<string>> {
  const palette = opts.palette ?? web;
  const format = opts.format ?? 'HEX';
  const normalized = palette.normalize(name);

  if (opts.k !== undefined) {
    // k normalization — same contract as `identify`'s top-k path:
    // fractional rounds, negative clamps to 0, NaN/±Infinity collapse
    // to 0 (empty result). Prior code crashed on NaN / fractional via
    // `new Array(NaN)`; the `Number.isFinite` guard fixes that.
    const safeK = Number.isFinite(opts.k) ? Math.max(0, Math.round(opts.k)) : 0;
    if (safeK === 0) return [];
    if (normalized.length > MAX_FUZZY_INPUT_LENGTH) return [];

    const index = getNameIndex(palette).entries();
    // Bounded insertion-sort window, keyed on Levenshtein distance.
    // See the twin comment in indexing.ts nearestAll for the full
    // rationale. Levenshtein per comparison is heavier than ΔE, so
    // the per-entry distance math dominates more than on identify,
    // but the allocation savings still help at k << palette size.
    const best: Array<[string, number]> = [];
    for (const [normalizedKey, canonical] of index) {
      const d = levenshtein(normalized, normalizedKey);
      if (best.length < safeK) {
        let j = best.length;
        while (j > 0 && (best[j - 1] as [string, number])[1] > d) j--;
        best.splice(j, 0, [canonical, d]);
      } else if (d < (best[safeK - 1] as [string, number])[1]) {
        let j = safeK - 1;
        while (j > 0 && (best[j - 1] as [string, number])[1] > d) j--;
        best.splice(j, 0, [canonical, d]);
        best.pop();
      }
    }

    const out: Array<ResolveMatch<string>> = [];
    for (const [canonical, d] of best) {
      const hex = (palette.colors as Record<string, HexColor>)[canonical];
      if (hex === undefined) continue;
      out.push({
        name: canonical,
        value: fromRgba(hexToRgba(hex), format),
        distance: d,
      });
    }
    return out;
  }

  // Strict path.
  const canonical = getNameIndex(palette).get(normalized);
  if (canonical === undefined) return null;
  const hex = (palette.colors as Record<string, HexColor>)[canonical];
  if (hex === undefined) return null;
  return fromRgba(hexToRgba(hex), format);
}
