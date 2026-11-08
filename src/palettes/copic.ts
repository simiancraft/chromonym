import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Copic Sketch marker colors, covering the complete 358-color range.
 *
 * Keys are the marker codes ('B00', 'YG03', 'C-5'). The English color
 * name is preserved as an inline source comment. `standardNormalize`
 * makes codes case-insensitive and ignores punctuation, so `resolve('b00')`
 * and `resolve('C5')` match the canonical entries.
 *
 * sRGB values are from the dual MIT/Apache-2.0 licensed
 * github.com/sile/copic_colors dataset at commit
 * 42651233ab925fe872acd1956a77d8d5139f5013. Copic® is a registered
 * trademark of Too Corporation; this palette is a nominative reference,
 * not an official Copic product. See NOTICE.md.
 *
 * Default metric: `deltaE2000`. The range contains densely spaced
 * marker shades, so CIEDE2000's perceptual compensation gives useful
 * nearest-color results across the full set.
 */
const copicColors = {
  BV0000: '#eeecf5', // Pale Thistle
  BV000: '#eee7f1', // Iridescent Mauve
  BV00: '#e9e3f0', // Mauve Shadow
  BV01: '#c8c4df', // Viola
  BV02: '#bec4df', // Prune
  BV04: '#92a4ce', // Blue Berry
  BV08: '#b08cb9', // Blue Violet
  BV11: '#e0dcec', // Soft Violet
  BV13: '#989ec9', // Hydrangea Blue
  BV17: '#7e90bd', // Deep Reddish Blue
  BV20: '#dce3f2', // Dull Lavender
  BV23: '#c4cde1', // Grayish Lavender
  BV25: '#908fac', // Grayish Violet
  BV29: '#2e4256', // Slate
  BV31: '#e6e8f4', // Pale Lavender
  BV34: '#7f92bd', // Bluebell
  V0000: '#f3f1f8', // Rose Quartz
  V000: '#f7f2f7', // Pale Heath
  V01: '#edccde', // Heath
  V04: '#edb9d1', // Lilac
  V05: '#ecb4ce', // Azalea
  V06: '#dba5c6', // Lavender
  V09: '#97599a', // Violet
  V12: '#f2dfeb', // Pale Lilac
  V15: '#e0b6d1', // Mallow
  V17: '#b3a1c7', // Amethyst
  V20: '#d5ccd6', // Wisteria
  V22: '#7b6f90', // Ash Lavender
  V25: '#b6aec6', // Pale Blackberry
  V28: '#787aa0', // Eggplant
  V91: '#efd0d8', // Pale Grape
  V93: '#edcddf', // Early Grape
  V95: '#c589aa', // Light Grape
  V99: '#4f334d', // Aubergine
  RV0000: '#f6eff6', // Evening Primrose
  RV000: '#f7e9f1', // Pale Purple
  RV00: '#f3d3e9', // Water Lily
  RV02: '#fcdee9', // Sugared Almond Pink
  RV04: '#f9b0c5', // Shock Pink
  RV06: '#ee86ae', // Cerise
  RV09: '#e87cac', // Fuchsia
  RV10: '#fef1f5', // Pale Pink
  RV11: '#fcdfe3', // Pink
  RV13: '#fcd3de', // Tender Pink
  RV14: '#f8a0bc', // Begonia Pink
  RV17: '#e58bb5', // Deep Magenta
  RV19: '#de73a7', // Red Violet
  RV21: '#feeeed', // Light Pink
  RV23: '#fbc6cf', // Pure Pink
  RV25: '#f8a1c1', // Dog Rose Flower
  RV29: '#f14a81', // Crimson
  RV32: '#fddcd7', // Shadow Pink
  RV34: '#fbbcb8', // Dark Pink
  RV42: '#fbc7bf', // Salmon Pink
  RV52: '#dc9cb6', // Cotton Candy
  RV55: '#d96196', // Hollyhock
  RV63: '#db8ab5', // Begonia
  RV66: '#8d3765', // Raspberry
  RV69: '#9c6276', // Peony
  RV91: '#eddee8', // Grayish Cherry
  RV93: '#eec3d2', // Smoky Purple
  RV95: '#c694aa', // Baby Blossoms
  RV99: '#6e5764', // Argyle Purple
  R0000: '#fcf6f2', // Pink Beryl
  R000: '#fff6f2', // Cherry White
  R00: '#fff5ef', // Pinkish White
  R01: '#fde0da', // Pinkish Vanilla
  R02: '#fedcd0', // Rose Salmon
  R05: '#f89d85', // Salmon Red
  R08: '#f46d56', // Vermilion
  R11: '#ffe8dd', // Pale Cherry Pink
  R12: '#fedccb', // Light Tea Rose
  R14: '#f9a89d', // Light Rouge
  R17: '#f78f72', // Lipstick Orange
  R20: '#fee0d9', // Blush
  R21: '#fcb6ac', // Sardonyx
  R22: '#ff9999', // Light Prawn
  R24: '#f57f82', // Prawn
  R27: '#f25364', // Cadmium Red
  R29: '#ef0047', // Lipstick Red
  R30: '#feeae5', // Pale Yellowish Pink
  R32: '#fcccc4', // Peach
  R35: '#f57a8a', // Coral
  R37: '#ed787d', // Carmine
  R39: '#d65382', // Garnet
  R43: '#f18f96', // Bougainvillaea
  R46: '#e6506d', // Strong Red
  R56: '#c36679', // Currant
  R59: '#c55f7c', // Cardinal
  R81: '#f6d4dc', // Rose Pink
  R83: '#f5aabf', // Rose Mist
  R85: '#de769a', // Rose Red
  R89: '#91354d', // Dark Red
  YR0000: '#fcf6eb', // Pale Chiffon
  YR000: '#fff1e1', // Silk
  YR00: '#fedfc7', // Powder Pink
  YR01: '#fdd6b7', // Peach Puff
  YR02: '#ffe4cf', // Light Orange
  YR04: '#ffcf6d', // Chrome Orange
  YR07: '#f67833', // Cadmium Orange
  YR09: '#f35700', // Chinese Orange
  YR12: '#fee391', // Loquat
  YR14: '#ffd34c', // Caramel
  YR15: '#ffd198', // Pumpkin Yellow
  YR16: '#ffc417', // Apricot
  YR18: '#f57335', // Sanguine
  YR20: '#ffe9c9', // Yellowish Shade
  YR21: '#f8e5bb', // Cream
  YR23: '#f2db98', // Yellow Ochre
  YR24: '#f6dc6b', // Pale Sepia
  YR27: '#d86745', // Tuscan Orange
  YR30: '#f7edc9', // Macadamia nut
  YR31: '#ffe6b2', // Light Reddish Yellow
  YR61: '#fee2cc', // Spring Orange
  YR65: '#febb65', // Atoll
  YR68: '#f67700', // Orange
  YR82: '#ffd198', // Mellow Peach
  Y0000: '#fffef7', // Yellow Fluorite
  Y000: '#fffff6', // Pale Lemon
  Y00: '#fffee5', // Barium Yellow
  Y02: '#f9f5a0', // Canary Yellow
  Y04: '#f3e953', // Acacia
  Y06: '#fff772', // Yellow
  Y08: '#fff500', // Acid Yellow
  Y11: '#fffcd3', // Pale Yellow
  Y13: '#fcf9b7', // Lemon Yellow
  Y15: '#ffee72', // Cadmium Yellow
  Y17: '#ffea55', // Golden Yellow
  Y18: '#fff257', // Lightning Yellow
  Y19: '#ffee39', // Napoli Yellow
  Y21: '#fff2c9', // Buttercup Yellow
  Y23: '#fdeabe', // Yellowish Beige
  Y26: '#f6e56f', // Mustard
  Y28: '#d5b56e', // Lionet Gold
  Y32: '#fbe6ca', // Cashmere
  Y35: '#ffe081', // Maize
  Y38: '#ffff99', // Honey
  YG0000: '#f7f9e4', // Lily White
  YG00: '#eeeba6', // Mimosa Yellow
  YG01: '#eef2c8', // Green Bice
  YG03: '#eaeeb2', // Yellow Green
  YG05: '#e2e999', // Salad
  YG06: '#d3e398', // Yellowish Green
  YG07: '#b6d135', // Acid Green
  YG09: '#93c560', // Lettuce Green
  YG11: '#ecf3d5', // Mignonette
  YG13: '#dfe9a6', // Chartreuse
  YG17: '#7abf4a', // Grass Green
  YG21: '#f9f8c6', // Anise
  YG23: '#efef98', // New Leaf
  YG25: '#dce47f', // Celadon Green
  YG41: '#e1eed9', // Pale Cobalt Green
  YG45: '#c5e0be', // Cobalt Green
  YG61: '#b7ca90', // Pale Moss
  YG63: '#b5d2ab', // Pea Green
  YG67: '#97c592', // Moss
  YG91: '#e4dfb8', // Putty
  YG93: '#dedba6', // Grayish Yellow
  YG95: '#dbd267', // Pale Olive
  YG97: '#aaa000', // Spanish Olive
  YG99: '#6a7800', // Marine Green
  G0000: '#f6faf6', // Crystal Opal
  G000: '#f7fbf7', // Pale Green
  G00: '#eaf5f6', // Jade Green
  G02: '#dbecd9', // Spectrum Green
  G03: '#b0de7f', // Meadow Green
  G05: '#7dc079', // Emerald Green
  G07: '#8fc676', // Nile Green
  G09: '#8fc460', // Veronese Green
  G12: '#deeccb', // Sea Green
  G14: '#aad294', // Apple Green
  G16: '#76c19c', // Malachite
  G17: '#27ae7d', // Forest Green
  G19: '#49b68a', // Bright Parrot Green
  G20: '#f2f7e0', // Wax White
  G21: '#d3e8d3', // Lime Green
  G24: '#d1e4bb', // Willow
  G28: '#239665', // Ocean Green
  G29: '#3e8667', // Pine Tree Green
  G40: '#ecf4e3', // Dim Green
  G43: '#92b35c', // Pistachio
  G46: '#54895d', // Mistletoe
  G82: '#dbe2c4', // Spring Dim Green
  G85: '#b3cdb5', // Verdigris
  G94: '#aab38e', // Grayish Olive
  G99: '#7b8e3f', // Olive
  BG0000: '#f5f9f6', // Snow Green
  BG000: '#f7fbf9', // Pale Aqua
  BG01: '#d6ebf8', // Aqua Blue
  BG02: '#d4ebed', // New Blue
  BG05: '#9cd5e6', // Holiday Blue
  BG07: '#33b8d2', // Petroleum Blue
  BG09: '#09b1cd', // Blue Green
  BG10: '#e7f3f2', // Cool Shadow
  BG11: '#daeef2', // Moon White
  BG13: '#d3eaeb', // Mint Green
  BG15: '#b5ddd6', // Aqua
  BG18: '#56beb3', // Teal Blue
  BG23: '#cde7e0', // Coral Sea
  BG32: '#cce6db', // Aqua Mint
  BG34: '#b8dedb', // Horizon Green
  BG45: '#c1e2e3', // Nile Blue
  BG49: '#15b2bc', // Duck Blue
  BG53: '#5cb6bd', // Ice Mint
  BG57: '#04a2ad', // Jasper
  BG70: '#e5eee3', // Ocean Mist
  BG72: '#88bec1', // Ice Ocean
  BG75: '#b5ddd6', // Abyss Green
  BG78: '#48756b', // Bronze
  BG90: '#d1ccb8', // Gray Sky
  BG93: '#cbcec4', // Green Gray
  BG96: '#9ab09e', // Bush
  BG99: '#89a996', // Flagstone Blue
  B0000: '#f6fbfe', // Pale Celestine
  B000: '#edf6f6', // Pale Porcelain Blue
  B00: '#eaf6f9', // Frost Blue
  B01: '#e1f1f3', // Mint Blue
  B02: '#c5e6f0', // Robin's Egg Blue
  B04: '#8dd1e7', // Tahitian Blue
  B05: '#64c5e5', // Process Blue
  B06: '#00ace2', // Peacock Blue
  B12: '#d6eaf0', // Ice Blue
  B14: '#8dd1eb', // Light Blue
  B16: '#01bae7', // Chanine Blue
  B18: '#2991c9', // Lapis Lazuli
  B21: '#e6f1fa', // Baby Blue
  B23: '#abcbe9', // Phthalo Blue
  B24: '#a3d5f1', // Sky
  B26: '#7fbbe3', // Cobalt Blue
  B28: '#1571b0', // Royal Blue
  B29: '#0077ba', // Ultramarine
  B32: '#eaf3f7', // Pale Blue
  B34: '#9bcbeb', // Manganese Blue
  B37: '#0472a3', // Antwerp Blue
  B39: '#286aa7', // Prussian Blue
  B41: '#eaf3fb', // Powder Blue
  B45: '#8fc7ea', // Smoky Blue
  B52: '#c1d6e1', // Soft Greenish Blue
  B60: '#e4e8f4', // Pale Blue Gray
  B63: '#bcc6e2', // Light Hydrangea
  B66: '#6473b4', // Clematis
  B69: '#1967a7', // Stratospheric Blue
  B79: '#31418f', // Iris
  B91: '#e1e9ed', // Pale Grayish Blue
  B93: '#abcbdf', // Light Crockery Blue
  B95: '#88b0ca', // Light Grayish Cobalt
  B97: '#45809d', // Night Blue
  B99: '#004d7a', // Agate
  E0000: '#fffaf3', // Floral White
  E000: '#fff8f1', // Pale Fruit Pink
  E00: '#fff6ee', // Cotton Pearl
  E01: '#fff2e9', // Pink Flamingo
  E02: '#fff1e6', // Fruit Pink
  E04: '#eccace', // Lipstick Rose
  E07: '#d99278', // Light Mahogany
  E08: '#d5745c', // Brown
  E09: '#e27453', // Burnt Sienna
  E11: '#ffefde', // Barley Beige
  E13: '#efd2bb', // Desert Sand
  E15: '#fdc797', // Earthenware
  E17: '#c46655', // Reddish Brass
  E18: '#97564a', // Copper
  E19: '#ce5425', // Redwood
  E21: '#ffe9d2', // Soft Sun
  E23: '#aa6a4b', // Hazelnut
  E25: '#dfb693', // Caribe Cocoa
  E27: '#ac866d', // Milk Chocolate
  E29: '#903f0a', // Burnt Umber
  E30: '#f7efcf', // Bisque
  E31: '#f6ecd7', // Brick Beige
  E33: '#f6dcbd', // Sand
  E34: '#f5d7b3', // Toast
  E35: '#eed2b2', // Chamois
  E37: '#d9a566', // Sepia
  E39: '#d27d33', // Leather
  E40: '#f7f0e5', // Brick White
  E41: '#fff4e8', // Pearl White
  E42: '#f2e8d3', // Sand White
  E43: '#f0e6cb', // Dull Ivory
  E44: '#d4c9b6', // Clay
  E47: '#9a826c', // Dark Brown
  E49: '#7a5d45', // Dark Bark
  E50: '#f7f0f1', // Egg Shell
  E51: '#fff1de', // Milky White
  E53: '#f6eccc', // Raw Silk
  E55: '#f5e6c4', // Light Camel
  E57: '#c29a6a', // Light Walnut
  E59: '#ad9076', // Walnut
  E70: '#f1e9e2', // Ash Rose
  E71: '#ebe1da', // Champagne
  E74: '#b5998c', // Cocoa Brown
  E77: '#947157', // Maroon
  E79: '#52382d', // Cashew
  E81: '#dccd98', // Ivory
  E84: '#b4955f', // Khaki
  E87: '#5b4d38', // Fig
  E89: '#7b746a', // Pecan
  E93: '#fedbc2', // Tea Rose
  E95: '#fec788', // Tea Orange
  E97: '#f3a962', // Deep Orange
  E99: '#c06508', // Baked Clay
  'C-00': '#f1f4f6', // Cool Gray No.00
  'C-0': '#edf2f4', // Cool Gray No.0
  'C-1': '#e4eaed', // Cool Gray No.1
  'C-2': '#d9e0e4', // Cool Gray No.2
  'C-3': '#d0d5da', // Cool Gray No.3
  'C-4': '#b9c1c7', // Cool Gray No.4
  'C-5': '#a4aeb2', // Cool Gray No.5
  'C-6': '#939ba1', // Cool Gray No.6
  'C-7': '#777f83', // Cool Gray No.7
  'C-8': '#63696d', // Cool Gray No.8
  'C-9': '#535150', // Cool Gray No.9
  'C-10': '#1f1e1e', // Cool Gray No.10
  'N-0': '#f2f2f2', // Neutral Gray No.0
  'N-1': '#ebebeb', // Neutral Gray No.1
  'N-2': '#e3e3e3', // Neutral Gray No.2
  'N-3': '#dcdcdc', // Neutral Gray No.3
  'N-4': '#c9c9c9', // Neutral Gray No.4
  'N-5': '#b7b6b6', // Neutral Gray No.5
  'N-6': '#a4a4a4', // Neutral Gray No.6
  'N-7': '#858485', // Neutral Gray No.7
  'N-8': '#6f6e6e', // Neutral Gray No.8
  'N-9': '#535150', // Neutral Gray No.9
  'N-10': '#1f1e1e', // Neutral Gray No.10
  'T-0': '#f2f2f2', // Toner Gray No.0
  'T-1': '#f0f0ee', // Toner Gray No.1
  'T-2': '#e9e9e6', // Toner Gray No.2
  'T-3': '#dddcd7', // Toner Gray No.3
  'T-4': '#cac8c4', // Toner Gray No.4
  'T-5': '#b8b5b0', // Toner Gray No.5
  'T-6': '#a4a29e', // Toner Gray No.6
  'T-7': '#858380', // Toner Gray No.7
  'T-8': '#6f6d6a', // Toner Gray No.8
  'T-9': '#53504d', // Toner Gray No.9
  'T-10': '#1f1e1e', // Toner Gray No.10
  'W-00': '#f7f7f1', // Warm Gray No.00
  'W-0': '#f7f6f0', // Warm Gray No.0
  'W-1': '#eeede7', // Warm Gray No.1
  'W-2': '#eeede9', // Warm Gray No.2
  'W-3': '#dddcd5', // Warm Gray No.3
  'W-4': '#cac9c2', // Warm Gray No.4
  'W-5': '#b8b6b0', // Warm Gray No.5
  'W-6': '#a4a39c', // Warm Gray No.6
  'W-7': '#86847f', // Warm Gray No.7
  'W-8': '#6f6e69', // Warm Gray No.8
  'W-9': '#53504c', // Warm Gray No.9
  'W-10': '#1f1e1d', // Warm Gray No.10
  '0': '#ffffff', // Colorless Blender
  '100': '#010101', // Black
  '110': '#010101', // Special Black
  FV: '#8470b2', // Fluorescent Violet
  FRV: '#f9b0cb', // Fluorescent Pink
  FYR: '#ffd7a4', // Fluorescent Orange
  FY: '#fff9a0', // Fluorescent Yellow
  FYG: '#dce4aa', // Fluorescent Yellow Green
  FG: '#afce15', // Fluorescent Green
  FBG: '#80cde7', // Fluorescent Blue Green
  FB: '#0b93cd', // Fluorescent Blue
} as const;

export type CopicColorName = keyof typeof copicColors;

/**
 * The complete 358-color Copic Sketch marker range as a
 * `Palette<CopicColorName>`.
 *
 * @example
 * identify('#e1f1f3', { palette: copic }); // 'B01'
 * resolve('yg03', { palette: copic });     // '#eaeeb2'
 */
export const copic = {
  name: 'copic',
  colors: copicColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<CopicColorName>;
