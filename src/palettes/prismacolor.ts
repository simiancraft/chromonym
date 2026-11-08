import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Prismacolor Premier Soft Core colored pencils, covering the 150-color set.
 *
 * Keys are the PC-prefixed pencil codes. The English color name is preserved
 * as an inline source comment. `standardNormalize` makes codes
 * case-insensitive and ignores punctuation.
 *
 * These approximate screen values are from Cyan Design's public "150
 * Prismacolor Premier Colored Pencils HEX Chart," published August 26, 2022,
 * and corrected February 14, 2024. The author describes the values as a scan
 * adjusted to resemble the physical pencils. The source states no reuse
 * terms. Prismacolor® is a registered trademark of Newell Brands; this
 * palette is a nominative reference, not an official Prismacolor product.
 * See NOTICE.md.
 *
 * Default metric: `deltaE2000`. The set contains densely spaced physical
 * pencil shades, so CIEDE2000 is a useful perceptual default.
 */
const prismacolorColors = {
  PC1035: '#eefd02', // Neon Yellow
  PC1004: '#dceb4d', // Yellow Chartreuse
  PC916: '#f0dd1c', // Canary Yellow
  PC915: '#eee84c', // Lemon Yellow
  PC1011: '#f9e465', // Deco Yellow
  PC917: '#edb50c', // Sunburst Yellow
  PC1012: '#e1b75c', // Jasmine
  PC940: '#dbaf61', // Sand
  PC942: '#cc8c43', // Yellow Ochre
  PC1034: '#bf793d', // Goldenrod
  PC1003: '#ed9b02', // Spanish Orange
  PC1002: '#e79002', // Yellowed Orange
  PC140: '#f8d2a1', // Eggshell
  PC997: '#dfc3a2', // Beige
  PC1036: '#fe5f00', // Neon Orange
  PC918: '#de6703', // Orange
  PC1033: '#c57042', // Mineral Orange
  PC1032: '#973e2d', // Pumpkin Orange
  PC118: '#db5732', // Cadmium Orange
  PC927: '#e1cac6', // Light Peach
  PC1001: '#d9917e', // Salmon Pink
  PC939: '#d5978c', // Peach
  PC921: '#cf5019', // Pale Vermillion
  PC922: '#c73214', // Poppy Red
  PC1013: '#feb9b2', // Deco Peach
  PC1092: '#d38b7f', // Nectar
  PC923: '#9c2316', // Scarlet Lake
  PC122: '#e92d3c', // Permanent Red
  PC928: '#ce918d', // Blush Pink
  PC926: '#cb4a45', // Carmine Red
  PC924: '#911914', // Crimson Red
  PC1031: '#7d3d3e', // Henna
  PC929: '#c94f5f', // Pink
  PC1014: '#fdbfce', // Deco Pink
  PC925: '#8a2226', // Crimson Lake
  PC1018: '#d2abb8', // Pink Rose
  PC930: '#af3e55', // Magenta
  PC993: '#cb5996', // Hot Pink
  PC1038: '#fc0186', // Neon Pink
  PC994: '#aa356a', // Process Red
  PC195: '#a2354f', // Pomegranate
  PC1030: '#853841', // Raspberry
  PC1029: '#673039', // Mahogany Red
  PC1019: '#a18a90', // Rosy Beige
  PC1017: '#836c7a', // Clay Rose
  PC1095: '#534141', // Black Raspberry
  PC995: '#912e6d', // Mulberry
  PC934: '#af61be', // Lavender
  PC1026: '#b79fb5', // Greyed Lavender
  PC1009: '#580f5a', // Dahlia Purple
  PC1078: '#3f262a', // Black Cherry
  PC931: '#3e103b', // Dark Purple
  PC956: '#8e73c2', // Lilac
  PC1008: '#654cad', // Parma Violet
  PC932: '#3c2673', // Violet
  PC132: '#4c4274', // Dioxazine Purple Hue
  PC996: '#332a45', // Black Grape
  PC933: '#121c87', // Violet Blue
  PC1007: '#3135a1', // Imperial Violet
  PC902: '#122f9e', // Ultramarine
  PC1023: '#c5cee1', // Cloud Blue
  PC1079: '#557fb5', // Blue Violet Lake
  PC208: '#2f3151', // Indanthrone Blue
  PC901: '#162452', // Indigo Blue
  PC1025: '#4f7197', // Periwinkle
  PC1101: '#124489', // Denim Blue
  PC133: '#0a4ac3', // Cobalt Blue Hue
  PC1102: '#538eec', // Blue Lake
  PC1103: '#5988d7', // Caribbean Sea
  PC1100: '#0f44a6', // China Blue
  PC1087: '#9dbcde', // Powder Blue
  PC1024: '#5e8bce', // Blue Slate
  PC904: '#479bde', // Light Cerulean Blue
  PC906: '#0a419a', // Copenhagen Blue
  PC103: '#016cb3', // Cerulean Blue
  PC903: '#0073c5', // True Blue
  PC1086: '#bbd8e1', // Sky Blue Light
  PC919: '#169dce', // Non Photo Blue
  PC1040: '#009ace', // Electric Blue
  PC1022: '#1e6495', // Mediterranean Blue
  PC936: '#436778', // Slate Grey
  PC1027: '#005194', // Peacock Blue
  PC1088: '#5786a5', // Muted Turquoise
  PC992: '#0fb4bb', // Light Aqua
  PC905: '#0283a6', // Aquamarine
  PC105: '#006ab5', // Cobalt Turquoise
  PC1006: '#028a7f', // Parrot Green
  PC920: '#48d49c', // Light Green
  PC910: '#38c98c', // True Green
  PC907: '#135450', // Peacock Green
  PC909: '#018248', // Grass Green
  PC908: '#224b29', // Dark Green
  PC1021: '#718f8e', // Jade Green
  PC1020: '#9bac9c', // Celadon Green
  PC289: '#e2ead9', // Grey Green Light
  PC1096: '#5a8555', // Kelly Green
  PC109: '#325430', // Prussian Green
  PC120: '#6e9260', // Sap Green Light
  PC911: '#2d5628', // Olive Green
  PC988: '#424722', // Marine Green
  PC1090: '#364e2b', // Kelp Green
  PC913: '#6bc631', // Spring Green
  PC912: '#438732', // Apple Green
  PC1089: '#bfce80', // Pale Sage
  PC989: '#bed40e', // Chartreuse
  PC1005: '#a59f33', // Limepeel
  PC1097: '#4f5230', // Moss Green
  PC1098: '#655526', // Artichoke
  PC1091: '#634523', // Green Ochre
  PC1094: '#7e715e', // Sandbar Brown
  PC1028: '#85633e', // Bronze
  PC914: '#e9deb7', // Cream
  PC1084: '#d2bf97', // Ginger Root
  PC941: '#684d3a', // Light Umber
  PC1082: '#623f33', // Chocolate
  PC1085: '#cfb5a4', // Peach Beige
  PC1093: '#d6b197', // Seashell Pink
  PC943: '#985343', // Burnt Ochre
  PC944: '#7b3830', // Terracotta
  PC945: '#8a5848', // Sienna Brown
  PC1083: '#c2b5b1', // Putty Beige
  PC1080: '#a27b74', // Beige Sienna
  PC1081: '#654042', // Chestnut
  PC937: '#502423', // Tuscan Red
  PC946: '#48342e', // Dark Brown
  PC948: '#433a33', // Sepia
  PC1099: '#474443', // Espresso
  PC947: '#42322f', // Dark Umber
  PC950: '#7f693a', // Metallic Gold
  PC949: '#7a7c7e', // Metallic Silver
  PC1059: '#cacfd0', // Cool Grey 10%
  PC1060: '#b7bcbe', // Cool Grey 20%
  PC1061: '#a5abaf', // Cool Grey 30%
  PC1063: '#70797b', // Cool Grey 50%
  PC1065: '#424c4e', // Cool Grey 70%
  PC1067: '#272a2b', // Cool Grey 90%
  PC1050: '#cbc9ca', // Warm Grey 10%
  PC1051: '#9b9799', // Warm Grey 20%
  PC1052: '#858382', // Warm Grey 30%
  PC1054: '#5c5a5b', // Warm Grey 50%
  PC1056: '#413e3f', // Warm Grey 70%
  PC1058: '#332f34', // Warm Grey 90%
  PC1068: '#cfcbc6', // French Grey 10%
  PC1069: '#beb5ad', // French Grey 20%
  PC1070: '#a89f97', // French Grey 30%
  PC1072: '#857972', // French Grey 50%
  PC1074: '#5d524c', // French Grey 70%
  PC1076: '#3c3430', // French Grey 90%
  PC935: '#18181b', // Black
  PC938: '#ffffff', // White
} as const;

export type PrismacolorColorName = keyof typeof prismacolorColors;

/**
 * The 150-color Prismacolor Premier Soft Core pencil set as a
 * `Palette<PrismacolorColorName>`.
 *
 * @example
 * identify('#162452', { palette: prismacolor }); // 'PC901'
 * resolve('pc 901', { palette: prismacolor });   // '#162452'
 */
export const prismacolor = {
  name: 'prismacolor',
  colors: prismacolorColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<PrismacolorColorName>;
