import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Crayola crayon colors — canonical subset. ~85 entries covering the
 * current 64-standard box, iconic fluorescents, and widely-recognized
 * modern additions.
 *
 * Keys are Title Case with spaces (`'Granny Smith Apple'`,
 * `'Razzmatazz'`) — how the names are printed on the crayon wrapper.
 * `standardNormalize` strips spaces + case + punctuation on input, so
 * `resolve('granny-smith-apple')` and `resolve('Granny Smith Apple')`
 * both hit the same entry.
 *
 * sRGB values are community-sourced approximations (Wikipedia's
 * well-cited list of Crayola crayon colors). They do not represent
 * a licensed Crayola reference. See NOTICE.md for trademark note.
 *
 * Default metric: `deltaEok`. The Crayola set spans a wide gamut with
 * many saturated brights (fluorescents especially) where CIELAB-based
 * metrics are less perceptually uniform than OKLAB. Same cost profile
 * as deltaE76, better neighbor selection in saturated regions.
 */
const crayolaColors = {
  // --- Current standard box: the 12 primary/secondary hue wheel ---
  Red: '#ee204d',
  'Red Orange': '#ff5349',
  Orange: '#ff7538',
  'Yellow Orange': '#ffae42',
  Yellow: '#fce883',
  'Yellow Green': '#c5e384',
  Green: '#1cac78',
  'Blue Green': '#0d98ba',
  Blue: '#1f75fe',
  'Blue Violet': '#7366bd',
  Violet: '#926eae',
  'Red Violet': '#c0448f',

  // --- Achromatics ---
  Black: '#232323',
  Brown: '#b4674d',
  White: '#ededed',
  Gray: '#95918c',

  // --- 64-box additions (pre-1990 core set) ---
  'Carnation Pink': '#ffaacc',
  'Sky Blue': '#80daeb',
  Tan: '#faa76c',
  Apricot: '#fdd9b5',
  Peach: '#ffcfab',
  'Cadet Blue': '#b0b7c6',
  Salmon: '#ff9baa',
  'Forest Green': '#6dae81',
  'Lemon Yellow': '#fff44f',
  Mahogany: '#cd4a4c',
  Maroon: '#c8385a',
  Bittersweet: '#fd7c6e',
  Sepia: '#a5694f',
  'Burnt Sienna': '#ea7e5d',
  'Burnt Orange': '#ff7f49',
  'Raw Sienna': '#d68a59',

  // --- Metallics ---
  Silver: '#cdc5c2',
  Gold: '#e7c697',
  Copper: '#dd9475',

  // --- Earth / nature tones ---
  'Green Yellow': '#f0e891',
  'Pine Green': '#158078',
  'Olive Green': '#bab86c',
  Indigo: '#5d76cb',
  Periwinkle: '#c5d0e6',
  Cerulean: '#1dacd6',
  'Sea Green': '#9fe2bf',
  'Turquoise Blue': '#77dde7',

  // --- Fluorescents (the iconic "Neon 24" era) ---
  'Atomic Tangerine': '#ff9966',
  'Blizzard Blue': '#ace5ee',
  'Hot Magenta': '#ff1dce',
  'Laser Lemon': '#fdfc74',
  'Neon Carrot': '#ffa343',
  'Purple Pizzazz': '#fe4eda',
  'Razzle Dazzle Rose': '#ff48d0',
  Razzmatazz: '#e3256b',
  "Screamin' Green": '#76ff7a',
  'Shocking Pink': '#fb7efd',
  'Tickle Me Pink': '#fc89ac',
  'Unmellow Yellow': '#ffff66',
  'Wild Watermelon': '#fc6c85',
  'Outrageous Orange': '#ff6e4a',
  'Electric Lime': '#ceff1d',

  // --- Modern / whimsical additions ---
  'Granny Smith Apple': '#a8e4a0',
  'Macaroni and Cheese': '#ffbd88',
  'Banana Mania': '#fae7b5',
  'Caribbean Green': '#1cd3a2',
  Cerise: '#dd4492',
  'Cotton Candy': '#ffbcd9',
  'Fuzzy Wuzzy': '#cc6666',
  Inchworm: '#b2ec5d',
  'Jazzberry Jam': '#ca3767',
  Manatee: '#979aaa',
  'Mango Tango': '#ff8243',
  Mauvelous: '#ef98aa',
  'Midnight Blue': '#1a4876',
  'Navy Blue': '#1974d2',
  'Pacific Blue': '#1ca9c9',
  'Piggy Pink': '#fddde6',
  Plum: '#8e4585',
  'Purple Heart': '#7442c8',
  "Robin's Egg Blue": '#1fcecb',
  'Royal Purple': '#7851a9',
  Scarlet: '#fc2847',
  Timberwolf: '#dbd7d2',
  Tumbleweed: '#deaa88',
  'Violet Red': '#f75394',
  'Vivid Violet': '#8f509d',
  Wisteria: '#cda4de',
} as const;

export type CrayolaColorName = keyof typeof crayolaColors;

export const crayola = {
  name: 'crayola',
  colors: crayolaColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaEok',
} as const satisfies Palette<CrayolaColorName>;
