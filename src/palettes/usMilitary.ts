import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Identity colors published by the U.S. Army, Department of the Air Force,
 * and Department of War. Keys combine the service with each guide's color
 * name so that similarly named colors remain unambiguous.
 *
 * Sources: U.S. Army Brand Guidelines v1.0 (March 2023), pp. 24 and 26;
 * Air Force Symbol and Emblem color guidance; and the U.S. Department of War
 * Brand Guide (updated September 25, 2025). These U.S. Government
 * publications and their factual color values are not subject to copyright
 * restrictions in the United States. See NOTICE.md.
 *
 * DOW Blue is named "Primary Blue" in the Department of War guide, and DOW
 * Black is named "Slate Black." The service prefix follows the guide's
 * identity rather than repeating those generic source labels.
 *
 * Default metric: `'deltaE2000'`; perceptual matching distinguishes the
 * palette's close gray and blue identity colors.
 */
const usMilitaryColors = {
  // U.S. Army Brand Guidelines v1.0 (March 2023), pp. 24 and 26.
  'Army Black': '#221f20',
  'Army Gold': '#ffcc01',
  'Army Green': '#2f372f',
  'Army Tan': '#f1e4c7',
  'Army Field 01': '#727365',
  'Army Field 02': '#bfb8a6',
  'Army Gray 01': '#565557',
  'Army Gray 02': '#d5d5d7',
  'Army Highlight Orange': '#f16521',
  'Army Highlight Green': '#2daa27',
  'Army Highlight Red': '#cf0000',

  // Air Force Symbol colors, U.S. Air Force trademark guidance:
  // https://www.trademark.af.mil/Branding/Air-Force-Symbol/
  'Air Force Blue': '#00308f',
  'Air Force Grey': '#a6a6a8',
  'Air Force Chrome': '#8f8f8c',

  // Air Force Emblem colors, U.S. Air Force trademark guidance:
  // https://www.trademark.af.mil/Branding/The-Air-Force-Emblem/
  'Air Force Ultramarine Blue': '#00539f',
  'Air Force Yellow': '#ffd520',
  'Air Force Brittany Blue': '#95c4da',
  'Air Force Orange': '#f5831f',
  'Air Force Silver Gray': '#b2b4b7',
  'Air Force Gold Brown': '#cf7418',

  // U.S. Department of War Brand Guide, updated September 25, 2025:
  // https://www.war.gov/Brand-Guide/
  'DOW Blue': '#355e93',
  'DOW Gray': '#333333',
  'DOW Hazy Blue': '#ebeff5',
  'DOW Steel Blue': '#aebfd4',
  'DOW Cadet Blue': '#728fb4',
  'DOW Ocean Blue': '#254267',
  'DOW Space Blue': '#15263b',
  'DOW Harbor Gray': '#ebebeb',
  'DOW Smoke Gray': '#adadad',
  'DOW Anchor Gray': '#717171',
  'DOW Black': '#141414',
} as const;

export type UsMilitaryColorName = keyof typeof usMilitaryColors;

/**
 * U.S. military identity colors as a `Palette<UsMilitaryColorName>`.
 * The standard normalizer accepts any case and ignores spaces and punctuation.
 *
 * @example
 * identify('#00308f', { palette: usMilitary }); // 'Air Force Blue'
 * resolve('army highlight red', { palette: usMilitary }); // '#cf0000'
 * usMilitary.colors['DOW Space Blue']; // '#15263b'
 */
export const usMilitary = {
  name: 'usMilitary',
  colors: usMilitaryColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<UsMilitaryColorName>;
