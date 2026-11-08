import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * MIL-STD-709D ammunition identification colors from Table II.
 * The Tier II code assigns 18 color names to FED-STD-595 chips and ammunition
 * meanings. The sRGB values reproduce the matching `fs595c` values derived
 * from GSA measurements. Tier I small-caliber tip colors are not included.
 *
 * `Silver` and `Aluminum` share a value, as do `Bronze`, `Gold`, and `Brass`.
 * `identify` returns the first name in insertion order for each shared value.
 *
 * Source: MIL-STD-709D w/Change 1, "Ammunition Color Coding," Table II,
 * published 3 May 2011 at
 * https://everyspec.com/MIL-STD/MIL-STD-0700-0799/MIL-STD-709D_CHG-1_33308/.
 * It is a US Government standard approved for public release (Distribution A)
 * and a public-domain work. See NOTICE.md.
 *
 * Default metric: `'deltaE2000'`; perceptual matching is appropriate for
 * distinguishing this small set of ammunition identification colors.
 */
const milStd709dColors = {
  Yellow: '#f5a01c', // FS 33538; high explosive
  Brown: '#805d4c', // FS 30117 (30140 also allowed); low explosive
  Gray: '#7f8586', // FS 36231; chemical ammunition (toxic, incapacitating, or riot control agent)
  'Dark Red': '#90403d', // FS 31136; riot control agent filler
  'Dark Green': '#476653', // FS 34108; toxic chemical agent filler
  Violet: '#6c5574', // FS 17100; incapacitating agent filler
  Black: '#373838', // FS 37038; armor defeating
  Silver: '#c3c6c6', // FS 17178; countermeasure
  Aluminum: '#c3c6c6', // FS 17178; countermeasure
  'Light Green': '#bac8a9', // FS 34558 (34449 also allowed); screening or marking smoke
  'Light Red': '#b25760', // FS 31158; incendiary
  White: '#e4e5d8', // FS 37875; illuminating
  'Light Blue': '#466b7d', // FS 35109; practice
  Orange: '#d35b35', // FS 32246; tracking and recovery in tests or training
  'Light Orange': '#ee934e', // FS 32544; potential to burst or explode (no HE)
  Bronze: '#b89964', // FS 17043; inert
  Gold: '#b89964', // FS 17043; inert
  Brass: '#b89964', // FS 17043; inert
} as const;

export type MilStd709dColorName = keyof typeof milStd709dColors;

/**
 * MIL-STD-709D Tier II ammunition colors as a
 * `Palette<MilStd709dColorName>`. The standard normalizer accepts any case
 * and ignores spaces and punctuation.
 *
 * @example
 * identify('#f5a01c', { palette: milStd709d }); // 'Yellow'
 * resolve('light blue', { palette: milStd709d }); // '#466b7d'
 */
export const milStd709d = {
  name: 'milStd709d',
  colors: milStd709dColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<MilStd709dColorName>;
