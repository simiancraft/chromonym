import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * MIL-STD-101C pipeline and compressed-gas-cylinder identification colors.
 * Sections 4.2 and 4.3 assign ten color names to FED-STD-595 chips and
 * material hazards. The sRGB values reproduce the matching `fs595c` values
 * derived from GSA measurements.
 *
 * Source: MIL-STD-101C, "Color Code for Pipelines and for Compressed Gas
 * Cylinders," sections 4.2 and 4.3, published 26 August 2014 at
 * https://www.wbdg.org/FFC/FEDMIL/milstd101.pdf. It is a US Government
 * standard approved for public release (Distribution A) and a public-domain
 * work. See NOTICE.md.
 *
 * Default metric: `'deltaE2000'`; perceptual matching is appropriate for
 * distinguishing this small set of safety-identification colors.
 */
const milStd101cColors = {
  Yellow: '#fcb217', // FS 13655; flammable materials
  Brown: '#625046', // FS 10080; toxic and poisonous materials
  Blue: '#2c698d', // FS 15102; anesthetics and harmful materials
  Green: '#5b7a41', // FS 14187; oxidizing materials
  Gray: '#757e7d', // FS 16187; physically dangerous materials
  Red: '#a13b3f', // FS 11105; fire protection materials
  Black: '#383838', // FS 17038; no significant meaning
  White: '#e7e8db', // FS 17875; no significant meaning
  Orange: '#d45b3a', // FS 12246; no significant meaning, cylinder segregation
  Buff: '#ebbf81', // FS 13594; no significant meaning, cylinder segregation
} as const;

export type MilStd101cColorName = keyof typeof milStd101cColors;

/**
 * MIL-STD-101C identification colors as a `Palette<MilStd101cColorName>`.
 * The standard normalizer accepts any case and ignores spaces and punctuation.
 *
 * @example
 * identify('#fcb217', { palette: milStd101c }); // 'Yellow'
 * resolve('brown', { palette: milStd101c }); // '#625046'
 */
export const milStd101c = {
  name: 'milStd101c',
  colors: milStd101cColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<MilStd101cColorName>;
