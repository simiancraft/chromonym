import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Chemical Agent Resistant Coating (CARC) colors from MIL-DTL-53039E
 * (16 May 2013), section 1.2.2. The specification defines these colors by
 * their FED-STD-595 chip numbers, so the sRGB values reproduce the matching
 * `fs595c` values derived from GSA measurements. They are not conversions of
 * the separate colorimetric targets in MIL-DTL-53039E Table I.
 *
 * The Army's primary camouflage colors are Aircraft Gray, Aircraft Green,
 * Black, Brown 383, Green 383, Green 808, IRR Foliage Green 504, Tan 686A,
 * and Woodland Desert Sage.
 *
 * Source: MIL-DTL-53039E, section 1.2.2, published 16 May 2013 at
 * https://everyspec.com/MIL-SPECS/MIL-SPECS-MIL-DTL/MIL-DTL-53039E_51370/.
 * It is a US Government specification and public-domain work. See NOTICE.md.
 *
 * Default metric: `'deltaE2000'`; perceptual matching distinguishes this
 * compact palette's closely spaced camouflage greens, tans, and grays.
 */
const carcColors = {
  'Aircraft Black': '#373838', // FS 37038
  'Aircraft Gray': '#91989d', // FS 36300
  'Aircraft Green': '#484742', // FS 34031
  'Aircraft Insignia Blue': '#383b48', // FS 35044
  'Aircraft Red': '#90403d', // FS 31136
  'Aircraft White': '#e4e5d8', // FS 37875
  'Aircraft Yellow': '#f5a01c', // FS 33538
  Black: '#363738', // FS 37030
  'Blue Gray': '#7a898d', // FS 35237
  'Brown 383': '#5a4d45', // FS 30051
  'Dark Green': '#575c42', // FS 34082
  'Dark Sandstone': '#bfab8f', // FS 33510
  'Earth Yellow': '#a57b52', // FS 33245
  'Field Drab': '#715b41', // FS 33105
  'Green 383': '#4f5443', // FS 34094
  'Green 808': '#595b44', // FS 34102
  'Interior Aircraft Black': '#353637', // FS 37031
  'Interior Aircraft Gray': '#7f8586', // FS 36231
  'IRR Foliage Green 504': '#676961', // FS 34160
  'Medium Gray': '#9ba5a9', // FS 36375
  'Olive Drab': '#675e4b', // FS 34088
  Sand: '#a19073', // FS 33303
  'Tan 686A': '#b79d7f', // FS 33446
  Tan: '#c9b49d', // FS 33531
  'Woodland Desert Sage': '#847962', // FS 34201
  'Weapons Safety Red': '#fc3b2c', // FS 38905
} as const;

export type CarcColorName = keyof typeof carcColors;

/**
 * CARC coating colors as a `Palette<CarcColorName>`. The standard normalizer
 * accepts any case and ignores spaces and punctuation.
 *
 * @example
 * identify('#4f5443', { palette: carc }); // 'Green 383'
 * resolve('tan 686a', { palette: carc }); // '#b79d7f'
 */
export const carc = {
  name: 'carc',
  colors: carcColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<CarcColorName>;
