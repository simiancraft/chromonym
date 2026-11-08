import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * MIL-STD-2525D (Joint Military Symbology, 10 June 2014) symbol colors.
 *
 * The US Department of Defense standard for the symbols command-and-control
 * systems draw: units, equipment, and tracks, colored by standard identity
 * (whether the thing is hostile, friend, neutral, unknown, or civilian).
 *
 *  - Table XV, "Color range values for filled symbols": a dark, medium, and
 *    light fill per identity. The standard lets implementers use any of the
 *    three sets, or another set whose luminance falls between dark and
 *    light, and keeps the hue fixed per identity.
 *  - Table XVI, "Default colors for unfilled symbols": one frame and icon
 *    color per identity (red, cyan, neon green, yellow, magenta).
 *
 * Keys are the identity and shade: `'Hostile Medium'`, `'Friend Light'`,
 * `'Neutral Unfilled'`. Each identity row also covers its kin from the
 * table: hostile includes suspect, joker, and faker; friend includes
 * assumed friend; unknown includes pending; civilian is the optional fill.
 * `'Unknown Medium'` and `'Unknown Unfilled'` share `#ffff00`; `identify`
 * returns `'Unknown Medium'`, the first in insertion order.
 *
 * Values are the RGB triplets the standard prints, converted to hex.
 * MIL-STD-2525D is a US Government work, approved for public release
 * (Distribution A). MIL-STD-2525E (2022) supersedes it and may revise
 * these colors; this palette is pinned to 2525D. See NOTICE.md.
 *
 * Default metric: `'deltaE2000'`; the three shades of each hue sit close
 * enough that the most perceptually faithful standard ΔE is worth its
 * negligible cost at 20 entries.
 */
const milStd2525dColors = {
  // --- Table XV: filled symbols (dark, medium, light) ---
  'Hostile Dark': '#c80000',
  'Hostile Medium': '#ff3031',
  'Hostile Light': '#ff8080',
  'Friend Dark': '#006b8c',
  'Friend Medium': '#00a8dc',
  'Friend Light': '#80e0ff',
  'Neutral Dark': '#00a000',
  'Neutral Medium': '#00e200',
  'Neutral Light': '#aaffaa',
  'Unknown Dark': '#e1dc00',
  'Unknown Medium': '#ffff00',
  'Unknown Light': '#ffff80',
  'Civilian Dark': '#500050',
  'Civilian Medium': '#800080',
  'Civilian Light': '#ffa1ff',

  // --- Table XVI: unfilled symbols ---
  'Hostile Unfilled': '#ff0000',
  'Friend Unfilled': '#00ffff',
  'Neutral Unfilled': '#00ff00',
  'Unknown Unfilled': '#ffff00',
  'Civilian Unfilled': '#ff00ff',
} as const;

export type MilStd2525dColorName = keyof typeof milStd2525dColors;

/**
 * MIL-STD-2525D symbol colors as a `Palette<MilStd2525dColorName>`. Keys
 * are identity plus shade (`'Friend Medium'`); the standard normalizer
 * accepts any case and punctuation.
 *
 * @example
 * identify('#00a8dc', { palette: milStd2525d });       // 'Friend Medium'
 * resolve('hostile light', { palette: milStd2525d });  // '#ff8080'
 * milStd2525d.colors['Civilian Unfilled'];             // '#ff00ff'
 */
export const milStd2525d = {
  name: 'milStd2525d',
  colors: milStd2525dColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<MilStd2525dColorName>;
