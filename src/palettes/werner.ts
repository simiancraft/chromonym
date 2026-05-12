import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Werner's Nomenclature of Colours (1821) — Patrick Syme's adaptation of
 * Abraham Werner's mineralogical color system, famously the reference
 * Charles Darwin carried aboard HMS Beagle.
 *
 * 110 named pigments organized into ten classes (Whites, Greys, Blacks,
 * Blues, Purples, Greens, Yellows, Oranges, Reds, Browns). Each name is
 * a piece of natural-history vocabulary: animal/vegetable/mineral
 * exemplars rather than abstract color labels (`'Lake Red'` is named
 * for the dark spot on a ladybird; `'Verdigris Green'` for the patina
 * on weathered copper).
 *
 * Keys are Title Case ('Snow White', 'Berlin Blue', 'Tile Red') matching
 * the 1821 typography. `standardNormalize` strips case and punctuation
 * on input, so `resolve('snow-white')`, `resolve('SNOW WHITE')`, and
 * `resolve('Snow White')` all hit the same entry.
 *
 * sRGB values are taken from Nicholas Rougeux's CC-BY digitization at
 * <https://www.c82.net/werner/>, which photographed and sampled the
 * original chip swatches. See NOTICE.md for attribution and license.
 *
 * Default metric: `deltaE2000`. The palette is mostly muted earth tones
 * and pigment darks; subtle perceptual distinctions matter more than
 * the cheap-fast ΔE76 can resolve.
 */
const wernerColors = {
  // --- Whites (#1-8) ---
  'Snow White': '#f1e9cd',
  'Reddish White': '#f2e7cf',
  'Purplish White': '#ece6d0',
  'Yellowish White': '#f2eacc',
  'Orange coloured White': '#f3e9ca',
  'Greenish White': '#f2ebcd',
  'Skimmed milk White': '#e6e1c9',
  'Greyish White': '#e2ddc6',
  // --- Greys (#9-16) ---
  'Ash Grey': '#cbc8b7',
  'Smoke Grey': '#bfbbb0',
  'French Grey': '#bebeb3',
  'Pearl Grey': '#b7b5ac',
  'Yellowish Grey': '#bab191',
  'Bluish Grey': '#9c9d9a',
  'Greenish Grey': '#8a8d84',
  'Blackish Grey': '#5b5c61',
  // --- Blacks (#17-23) ---
  'Greyish Black': '#555152',
  'Bluish Black': '#413f44',
  'Greenish Black': '#454445',
  'Pitch or Brownish Black': '#423937',
  'Reddish Black': '#433635',
  'Ink Black': '#252024',
  'Velvet Black': '#241f20',
  // --- Blues (#24-34) ---
  'Scotch Blue': '#281f3f',
  'Prussian Blue': '#1c1949',
  'Indigo Blue': '#4f638d',
  'China Blue': '#383867',
  'Azure Blue': '#5c6b8f',
  'Ultramarine Blue': '#657abb',
  'Flax-Flower Blue': '#6f88af',
  'Berlin Blue': '#7994b5',
  'Verditter Blue': '#6fb5a8',
  'Greenish Blue': '#719ba2',
  'Greyish Blue': '#8aa1a6',
  // --- Purples (#35-45) ---
  'Bluish Lilac Purple': '#d0d5d3',
  'Bluish Purple': '#8590ae',
  'Violet Purple': '#3a2f52',
  'Pansy Purple': '#39334a',
  'Campanula Purple': '#6c6d94',
  'Imperial Purple': '#584c77',
  'Auricula Purple': '#533552',
  'Plum Purple': '#463759',
  'Red Lilac Purple': '#bfbac0',
  'Lavender Purple': '#77747f',
  'Pale Blackish Purple': '#4a475c',
  // --- Greens (#46-61) ---
  'Celadine Green': '#b8bfaf',
  'Mountain Green': '#b2b599',
  'Leek Green': '#979c84',
  'Blackish Green': '#5d6161',
  'Verdigris Green': '#61ac86',
  'Bluish Green': '#a4b6a7',
  'Apple Green': '#adba98',
  'Emerald Green': '#93b778',
  'Grass Green': '#7d8c55',
  'Duck Green': '#33431e',
  'Sap Green': '#7c8635',
  'Pistachio Green': '#8e9849',
  'Asparagus Green': '#c2c190',
  'Olive Green': '#67765b',
  'Oil Green': '#ab924b',
  'Siskin Green': '#c8c76f',
  // --- Yellows (#62-75) ---
  'Sulphur Yellow': '#ccc050',
  'Primrose Yellow': '#ebdd99',
  'Wax Yellow': '#ab9649',
  'Lemon Yellow': '#dbc364',
  'Gamboge Yellow': '#e6d058',
  'Kings Yellow': '#ead665',
  'Saffron Yellow': '#d09b2c',
  'Gallstone Yellow': '#a36629',
  'Honey Yellow': '#a77d35',
  'Straw Yellow': '#f0d696',
  'Wine Yellow': '#d7c485',
  'Sienna Yellow': '#f1d28c',
  'Ochre Yellow': '#efcc83',
  'Cream Yellow': '#f3daa7',
  // --- Oranges (#76-81) ---
  'Dutch Orange': '#dfa837',
  'Buff Orange': '#ebbc71',
  'Orpiment Orange': '#d17c3f',
  'Brownish Orange': '#92462f',
  'Reddish Orange': '#be7249',
  'Deep Reddish Orange': '#bb603c',
  // --- Reds (#82-99) ---
  'Tile Red': '#c76b4a',
  'Hyacinth Red': '#a75536',
  'Scarlet Red': '#b63e36',
  'Vermilion Red': '#b5493a',
  'Aurora Red': '#cd6d57',
  'Arterial Blood Red': '#711518',
  'Flesh Red': '#e9c49d',
  'Rose Red': '#eedac3',
  'Peach Blossom Red': '#eecfbf',
  'Carmine Red': '#ce536b',
  'Lake Red': '#b74a70',
  'Crimson Red': '#b7757c',
  'Purplish Red': '#612741',
  'Cochineal Red': '#7a4848',
  'Veinous Blood Red': '#3f3033',
  'Brownish Purple Red': '#8d746f',
  'Chocolate Red': '#4d3635',
  'Brownish Red': '#6e3b31',
  // --- Browns (#100-110) ---
  'Deep Orange-coloured Brown': '#864735',
  'Deep Reddish Brown': '#553d3a',
  'Umber Brown': '#613936',
  'Chestnut Brown': '#7a4b3a',
  'Yellowish Brown': '#946943',
  'Wood Brown': '#c39e6d',
  'Liver Brown': '#513e32',
  'Hair Brown': '#8b7859',
  'Broccoli Brown': '#9b856b',
  'Clove Brown': '#766051',
  'Blackish Brown': '#453b32',
} as const;

export type WernerColorName = keyof typeof wernerColors;

/**
 * Werner's Nomenclature of Colours (1821) as a `Palette<WernerColorName>`.
 *
 * 110 entries spanning ten Werner classes (Whites → Browns). Keys are
 * the original 1821 names ('Berlin Blue', 'Lake Red'). Default metric
 * is `'deltaE2000'`: the palette's muted earth-tone distribution rewards
 * perceptually uniform comparisons over fast Euclidean distance.
 *
 * @example
 * identify('#1c1949', { palette: werner });            // 'Prussian Blue'
 * resolve('Berlin Blue', { palette: werner });         // '#7994b5'
 * werner.colors['Lake Red'];                           // '#b74a70'
 */
export const werner = {
  name: 'werner',
  colors: wernerColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<WernerColorName>;
