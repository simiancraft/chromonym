import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * RAL Classic — the European industrial color standard published by
 * RAL gGmbH (Bonn), used across paint, coatings, architecture, signage,
 * and manufacturing. Originated in 1927 with 40 colors; this palette
 * ships the modern 216-entry Classic set spanning ten groups (Yellows
 * through Whites/Blacks).
 *
 * Keys are the RAL code verbatim ('RAL 1000', 'RAL 9023'). The English
 * color name is preserved as an inline source comment for skimmers but
 * is not part of the key — lookups go through the code, mirroring how
 * Pantone is keyed ('185 C') rather than by the color's name.
 * `standardNormalize` strips the space, so `resolve('ral1000')`,
 * `resolve('RAL 1000')`, and `resolve('Ral-1000')` all hit the same entry.
 *
 * sRGB values are from the MIT-licensed
 * github.com/JohannesVoigt/ral-color-converter dataset, which ships
 * the Classic set with multi-language names and CMYK / LRV companions.
 * **RAL®** is a registered trademark of **RAL gGmbH**; this palette
 * is a nominative reference, not a licensed RAL product. See NOTICE.md.
 *
 * Default metric: `deltaE2000`. RAL coatings cluster densely in some
 * regions (the 7000 greys especially have 38 closely-spaced entries
 * across the achromatic axis); CIEDE2000's hue/chroma compensation
 * picks better neighbors than the cheaper deltaE76.
 */
const ralColors = {
  // --- Yellows (RAL 1000-RAL 1037; 30 entries) ---
  'RAL 1000': '#cdba88', // Green beige
  'RAL 1001': '#d0b084', // Beige
  'RAL 1002': '#d2aa6d', // Sand yellow
  'RAL 1003': '#f9a900', // Signal yellow
  'RAL 1004': '#e49e00', // Golden yellow
  'RAL 1005': '#cb8f00', // Honey yellow
  'RAL 1006': '#e19000', // Maize yellow
  'RAL 1007': '#e88c00', // Daffodil yellow
  'RAL 1011': '#af8050', // Brown beige
  'RAL 1012': '#ddaf28', // Lemon yellow
  'RAL 1013': '#e3d9c7', // Oyster white
  'RAL 1014': '#ddc49b', // Ivory
  'RAL 1015': '#e6d2b5', // Light ivory
  'RAL 1016': '#f1dd39', // Sulfur yellow
  'RAL 1017': '#f6a951', // Saffron yellow
  'RAL 1018': '#faca31', // Zinc yellow
  'RAL 1019': '#a48f7a', // Grey beige
  'RAL 1020': '#a08f65', // Olive yellow
  'RAL 1021': '#f6b600', // Colza yellow
  'RAL 1023': '#f7b500', // Traffic yellow
  'RAL 1024': '#ba8f4c', // Ochre yellow
  'RAL 1026': '#ffff00', // Luminous yellow
  'RAL 1027': '#a77f0f', // Curry
  'RAL 1028': '#ff9c00', // Melon yellow
  'RAL 1032': '#e2a300', // Broom yellow
  'RAL 1033': '#f99a1d', // Dahlia yellow
  'RAL 1034': '#eb9c52', // Pastel yellow
  'RAL 1035': '#8f8370', // Pearl beige
  'RAL 1036': '#806440', // Pearl gold
  'RAL 1037': '#f09200', // Sun yellow
  // --- Oranges (RAL 2000-RAL 2017; 14 entries) ---
  'RAL 2000': '#da6e00', // Yellow orange
  'RAL 2001': '#ba481c', // Red orange
  'RAL 2002': '#bf3922', // Vermilion
  'RAL 2003': '#f67829', // Pastel orange
  'RAL 2004': '#e25304', // Pure orange
  'RAL 2005': '#ff4d08', // Luminous orange
  'RAL 2007': '#ffb200', // Luminous bright orange
  'RAL 2008': '#ec6b22', // Bright red orange
  'RAL 2009': '#de5308', // Traffic orange
  'RAL 2010': '#d05d29', // Signal orange
  'RAL 2011': '#e26e0f', // Deep orange
  'RAL 2012': '#d5654e', // Salmon orange
  'RAL 2013': '#923e25', // Pearl orange
  'RAL 2017': '#fc5500', // RAL orange
  // --- Reds (RAL 3000-RAL 3033; 25 entries) ---
  'RAL 3000': '#a72920', // Flame red
  'RAL 3001': '#9b2423', // Signal red
  'RAL 3002': '#9b2321', // Carmine red
  'RAL 3003': '#861a22', // Ruby red
  'RAL 3004': '#6b1c23', // Purple red
  'RAL 3005': '#59191f', // Wine red
  'RAL 3007': '#3e2022', // Black red
  'RAL 3009': '#6d342d', // Oxide red
  'RAL 3011': '#782423', // Brown red
  'RAL 3012': '#c5856d', // Beige red
  'RAL 3013': '#972e25', // Tomato red
  'RAL 3014': '#cb7375', // Antique pink
  'RAL 3015': '#d8a0a6', // Light pink
  'RAL 3016': '#a63d30', // Coral red
  'RAL 3017': '#ca555d', // Rose
  'RAL 3018': '#c63f4a', // Strawberry red
  'RAL 3020': '#bb1f11', // Traffic red
  'RAL 3022': '#cf6955', // Salmon pink
  'RAL 3024': '#ff2d21', // Luminous red
  'RAL 3026': '#ff2a1c', // Luminous bright red
  'RAL 3027': '#ab273c', // Raspberry red
  'RAL 3028': '#cc2c24', // Pure red
  'RAL 3031': '#a63437', // Orient red
  'RAL 3032': '#701d24', // Pearl ruby red
  'RAL 3033': '#a53a2e', // Pearl pink
  // --- Violets (RAL 4001-RAL 4012; 12 entries) ---
  'RAL 4001': '#816183', // Red lilac
  'RAL 4002': '#8d3c4b', // Red violet
  'RAL 4003': '#c4618c', // Heather violet
  'RAL 4004': '#651e38', // Claret violet
  'RAL 4005': '#76689a', // Blue lilac
  'RAL 4006': '#903373', // Traffic purple
  'RAL 4007': '#47243c', // Purple violet
  'RAL 4008': '#844c82', // Signal violet
  'RAL 4009': '#9d8692', // Pastel violet
  'RAL 4010': '#bb4077', // Telemagenta
  'RAL 4011': '#6e6387', // Pearl violet
  'RAL 4012': '#6a6b7f', // Pearl blackberry
  // --- Blues (RAL 5000-RAL 5026; 25 entries) ---
  'RAL 5000': '#304f6e', // Violet blue
  'RAL 5001': '#0e4c64', // Green blue
  'RAL 5002': '#00387a', // Ultramarine blue
  'RAL 5003': '#1f3855', // Sapphire blue
  'RAL 5004': '#191e28', // Black blue
  'RAL 5005': '#005387', // Signal blue
  'RAL 5007': '#376b8c', // Brillant blue
  'RAL 5008': '#2b3a44', // Grey blue
  'RAL 5009': '#215f78', // Azure blue
  'RAL 5010': '#004f7c', // Gentian blue
  'RAL 5011': '#1a2b3c', // Steel blue
  'RAL 5012': '#0089b6', // Light blue
  'RAL 5013': '#193153', // Cobalt blue
  'RAL 5014': '#637d96', // Pigeon blue
  'RAL 5015': '#007caf', // Sky blue
  'RAL 5017': '#005b8c', // Traffic blue
  'RAL 5018': '#048b8c', // Turquoise blue
  'RAL 5019': '#005e83', // Capri blue
  'RAL 5020': '#00414b', // Ocean blue
  'RAL 5021': '#007577', // Water blue
  'RAL 5022': '#222d5a', // Night blue
  'RAL 5023': '#41698c', // Distant blue
  'RAL 5024': '#6093ac', // Pastel blue
  'RAL 5025': '#20697c', // Pearl gentian blue
  'RAL 5026': '#0f3052', // Pearl night blue
  // --- Greens (RAL 6000-RAL 6039; 37 entries) ---
  'RAL 6000': '#3c7460', // Patina green
  'RAL 6001': '#366735', // Emerald green
  'RAL 6002': '#325928', // Leaf green
  'RAL 6003': '#50533c', // Olive green
  'RAL 6004': '#024442', // Blue green
  'RAL 6005': '#114232', // Moss green
  'RAL 6006': '#3c392e', // Grey olive
  'RAL 6007': '#2c3222', // Bottle green
  'RAL 6008': '#36342a', // Brown green
  'RAL 6009': '#27352a', // Fir green
  'RAL 6010': '#4d6f39', // Grass green
  'RAL 6011': '#6b7c59', // Reseda green
  'RAL 6012': '#2f3d3a', // Black green
  'RAL 6013': '#7c765a', // Reed green
  'RAL 6014': '#474135', // Yellow olive
  'RAL 6015': '#3d3d36', // Black olive
  'RAL 6016': '#00694c', // Turquoise green
  'RAL 6017': '#587f40', // May green
  'RAL 6018': '#60993b', // Yellow green
  'RAL 6019': '#b9ceac', // Pastel green
  'RAL 6020': '#37422f', // Chrome green
  'RAL 6021': '#8a9977', // Pale green
  'RAL 6022': '#3a3327', // Olive drab
  'RAL 6024': '#008351', // Traffic green
  'RAL 6025': '#5e6e3b', // Fern green
  'RAL 6026': '#005f4e', // Opal green
  'RAL 6027': '#7ebab5', // Light green
  'RAL 6028': '#315442', // Pine green
  'RAL 6029': '#006f3d', // Mint green
  'RAL 6032': '#237f52', // Signal green
  'RAL 6033': '#45877f', // Mint turquoise
  'RAL 6034': '#7aadac', // Pastel turquoise
  'RAL 6035': '#194d25', // Pearl green
  'RAL 6036': '#04574b', // Pearl opal green
  'RAL 6037': '#008b29', // Pure green
  'RAL 6038': '#00b51b', // Luminous green
  'RAL 6039': '#b3c43e', // Fibrous green
  // --- Greys (RAL 7000-RAL 7048; 38 entries) ---
  'RAL 7000': '#7a888e', // Squirrel grey
  'RAL 7001': '#8c979c', // Silver grey
  'RAL 7002': '#817863', // Olive grey
  'RAL 7003': '#797669', // Moss grey
  'RAL 7004': '#9a9b9b', // Signal grey
  'RAL 7005': '#6b6e6b', // Mouse grey
  'RAL 7006': '#766a5e', // Beige grey
  'RAL 7008': '#745f3d', // Khaki grey
  'RAL 7009': '#5d6058', // Green grey
  'RAL 7010': '#585c56', // Tarpaulin grey
  'RAL 7011': '#52595d', // Iron grey
  'RAL 7012': '#575d5e', // Basalt grey
  'RAL 7013': '#575044', // Brown grey
  'RAL 7015': '#4f5358', // Slate grey
  'RAL 7016': '#383e42', // Anthracite grey
  'RAL 7021': '#2f3234', // Black grey
  'RAL 7022': '#4c4a44', // Umbra grey
  'RAL 7023': '#808076', // Concrete grey
  'RAL 7024': '#45494e', // Graphite grey
  'RAL 7026': '#374345', // Granite grey
  'RAL 7030': '#928e85', // Stone grey
  'RAL 7031': '#5b686d', // Blue grey
  'RAL 7032': '#b5b0a1', // Pebble grey
  'RAL 7033': '#7f8274', // Cement grey
  'RAL 7034': '#92886f', // Yellow grey
  'RAL 7035': '#c5c7c4', // Light grey
  'RAL 7036': '#979392', // Platinum grey
  'RAL 7037': '#7a7b7a', // Dusty grey
  'RAL 7038': '#b0b0a9', // Agate grey
  'RAL 7039': '#6b665e', // Quartz grey
  'RAL 7040': '#989ea1', // Window grey
  'RAL 7042': '#8e9291', // Traffic grey A
  'RAL 7043': '#4f5250', // Traffic grey B
  'RAL 7044': '#b7b3a8', // Silk grey
  'RAL 7045': '#8d9295', // Telegrey 1
  'RAL 7046': '#7e868a', // Telegrey 2
  'RAL 7047': '#c8c8c7', // Telegrey 4
  'RAL 7048': '#817b73', // Pearl mouse grey
  // --- Browns (RAL 8000-RAL 8029; 20 entries) ---
  'RAL 8000': '#89693f', // Green brown
  'RAL 8001': '#9d622b', // Ochre brown
  'RAL 8002': '#794d3e', // Signal brown
  'RAL 8003': '#7e4b27', // Clay brown
  'RAL 8004': '#8d4931', // Copper brown
  'RAL 8007': '#70462b', // Fawn brown
  'RAL 8008': '#724a25', // Olive brown
  'RAL 8011': '#5a3827', // Nut brown
  'RAL 8012': '#66332b', // Red brown
  'RAL 8014': '#4a3526', // Sepia brown
  'RAL 8015': '#5e2f26', // Chestnut brown
  'RAL 8016': '#4c2b20', // Mahogany brown
  'RAL 8017': '#442f29', // Chocolate brown
  'RAL 8019': '#3d3635', // Grey brown
  'RAL 8022': '#1a1719', // Black brown
  'RAL 8023': '#a45729', // Orange brown
  'RAL 8024': '#795038', // Beige brown
  'RAL 8025': '#755847', // Pale brown
  'RAL 8028': '#513a2a', // Terra brown
  'RAL 8029': '#7f4031', // Pearl copper
  // --- Whites and Blacks (RAL 9001-RAL 9023; 15 entries) ---
  'RAL 9001': '#e9e0d2', // Cream
  'RAL 9002': '#d6d5cb', // Grey white
  'RAL 9003': '#ecece7', // Signal white
  'RAL 9004': '#2b2b2c', // Signal black
  'RAL 9005': '#0e0e10', // Jet black
  'RAL 9006': '#a1a1a0', // White aluminium
  'RAL 9007': '#868581', // Grey aluminium
  'RAL 9010': '#f1ede1', // Pure white
  'RAL 9011': '#27292b', // Graphite black
  'RAL 9012': '#f8f2e1', // Cleanroom white
  'RAL 9016': '#f1f1ea', // Traffic white
  'RAL 9017': '#29292a', // Traffic black
  'RAL 9018': '#c8cbc4', // Papyrus white
  'RAL 9022': '#858583', // Pearl light grey
  'RAL 9023': '#787b7a', // Pearl dark grey
} as const;

export type RalColorName = keyof typeof ralColors;

/**
 * RAL Classic as a `Palette<RalColorName>`. 216 entries spanning
 * RAL 1000-RAL 9023 across ten color groups. Keys are RAL codes
 * ('RAL 1000', 'RAL 9023'); the English color name is in source-side
 * comments for skimmers. Default metric is `'deltaE2000'`.
 *
 * @example
 * identify('#27292b', { palette: ral });               // 'RAL 9011' (Graphite black)
 * resolve('RAL 5002', { palette: ral });               // '#00387a' (Ultramarine blue)
 * ral.colors['RAL 1003'];                              // '#f9a900' (Signal yellow)
 */
export const ral = {
  name: 'ral',
  colors: ralColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<RalColorName>;
