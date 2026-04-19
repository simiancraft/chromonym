import { identify } from './identify.js';
import { resolve } from './resolve.js';
import type { DistanceMetric, HexColor, Palette } from './types.js';

/** Extract string keys from a Palette's `colors` map. */
type PaletteKey<P extends Palette> = Extract<keyof P['colors'], string>;

/**
 * Cross-palette sugar: name in palette `from` → nearest name in palette `to`.
 *
 * Returns `null` if the source name isn't in the `from` palette
 * (lookup-flavored, consistent with `resolve` / `identify`).
 *
 * Fundamentally a nearest-match operation — palettes rarely share exact
 * hex values, so `translate` always does a fuzzy match on the target
 * side. The `metric` option controls *how* "nearest" is measured on
 * that side; defaults to `to.defaultMetric`.
 *
 * This is equivalent to: `identify(resolve(name, { palette: from }), { palette: to, metric })`
 * — kept as a named export because the chain is common enough that
 * writing it out every time is noise.
 *
 * @example
 *   translate('rebeccapurple', { from: web, to: pantone })        // '267 C'
 *   translate('Razzmatazz',    { from: crayola, to: pantone })    // '213 C'
 *   translate('acme red',      { from: brand, to: pantone })      // nearest Pantone
 *   translate('not-a-name',    { from: web, to: pantone })        // null
 */
export function translate<T extends Palette>(
  name: string,
  opts: { from: Palette; to: T; metric?: DistanceMetric },
): PaletteKey<T> | null {
  const hex = resolve(name, { palette: opts.from });
  if (hex === null) return null;
  // `resolve` with default format returns a HexColor string. Assert and feed.
  return identify(hex as HexColor, { palette: opts.to, metric: opts.metric });
}
