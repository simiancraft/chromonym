import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Textile Color Card Association palette: 216 colors from the ninth
 * edition of the Standard Color Card of America and 22 colors from
 * the U.S. Army Color Card, as measured by the National Bureau of
 * Standards in 1946.
 *
 * Source: Reimann, Judd, and Keegan, "Spectrophotometric and
 * colorimetric determination of the colors of the TCCA standard color
 * cards", Journal of Research of the National Bureau of Standards 36,
 * 209 (March 1946), Research Paper RP1700, Table 5. This US Government
 * publication is public domain. See NOTICE.md for conversion details
 * and limitations.
 *
 * These measurements describe silk samples from the 1946 ninth-edition
 * cards. Later editions, including the renumbered 10th edition, and
 * present-day heraldic yarns may differ. Several shades are fluorescent,
 * so sRGB values are approximations by construction. Out-of-gamut
 * channels are clamped.
 */
const tccaColors = {
  'White 70001': '#e5e1d7', // Munsell 2.5Y 8.8/0.7; ISCC-NBS Yellowish white.
  'Ivory 70002': '#ece2d0', // Munsell 1.0Y 8.9/1.3; ISCC-NBS Very pale orange.
  'Cream 70003': '#e9e1c7', // Munsell 3.5Y 8.8/1.7; ISCC-NBS Pale yellow.
  'Eggshell 70004': '#e0cfae', // Munsell 1.6Y 8.2/2.5; ISCC-NBS Weak yellowish orange.
  'Leghorn 70005': '#e6cc98', // Munsell 2.4Y 8.2/4.2; ISCC-NBS Weak yellowish orange.
  'Maize 70006': '#f5c979', // Munsell 1.1Y 8.2/6.8; ISCC-NBS Moderate yellowish orange.
  'Pale Blue 70007': '#cad2d1', // Munsell 8.4BG 8.2/0.5; ISCC-NBS Light bluish gray.
  'Pastel Blue 70008': '#adc3cf', // Munsell 0.2PB 7.6/2.6; ISCC-NBS Very pale blue.
  'Baby Blue 70009': '#abc5d3', // Munsell 0.2PB 7.7/3.0; ISCC-NBS Very pale blue.
  'Sky Blue 70010': '#8ca9ba', // Munsell 9.4B 6.6/3.4; ISCC-NBS Pale blue.
  'Blue Flower 70011': '#8aaec8', // Munsell 1.2PB 6.8/4.7; ISCC-NBS Pale blue.
  'Forget-me-not 70012': '#6ea9cb', // Munsell 0.2PB 6.5/6.4; ISCC-NBS Light blue.
  'Flesh Pink 70013': '#eccec5', // Munsell 9.9R 8.4/2.6; ISCC-NBS Pale to weak pink.
  'Baby Pink 70014': '#f6c7c6', // Munsell 3.4R 8.3/4.1; ISCC-NBS Light to moderate pink.
  'Pastel Pink 70015': '#f5b9bb', // Munsell 2.0R 7.9/5.4; ISCC-NBS Moderate pink.
  'Arbutus Pink 70016': '#f4b3b8', // Munsell 1.0R 7.8/5.9; ISCC-NBS Moderate to strong pink.
  'Rose Pink 70017': '#f39da7', // Munsell 0.2R 7.2/7.9; ISCC-NBS Strong pink.
  'Sea Pink 70018': '#d9828a', // Munsell 1.5R 6.2/8.2; ISCC-NBS Light purplish red.
  'Tourmaline 70019': '#b4c8c2', // Munsell 3.4BG 7.8/1.3; ISCC-NBS Light bluish gray.
  'Turquoise 70020': '#8ac1c0', // Munsell 8.5BG 7.3/3.7; ISCC-NBS Light blue green.
  'Blue Turquoise 70021': '#54aab7', // Munsell 2.7B 6.3/5.6; ISCC-NBS Light greenish blue.
  'Grotto Blue 70022': '#0090ad', // Munsell 5.1B 5.3/7.4; ISCC-NBS Moderate blue.
  'Peacock 70023': '#00667c', // Munsell 4.2B 3.8/6.0; ISCC-NBS Moderate greenish blue.
  'Duckling 70024': '#004856', // Munsell 2.9B 2.7/4.5; ISCC-NBS Dusky to dark blue.
  'Tea Rose 70025': '#ffaea3', // Munsell 6.2R 7.8/7.4; ISCC-NBS Strong pink.
  'Salmon Pink 70026': '#ffa992', // Munsell 8.5R 7.6/7.7; ISCC-NBS Strong orange pink.
  'Shell Pink 70027': '#ff9e94', // Munsell 5.6R 7.6/10.1; ISCC-NBS Strong pink.
  'Melon Pink 70028': '#ff807b', // Munsell 5.1R 6.7/11.5; ISCC-NBS Light reddish orange.
  'Tigerlily 70029': '#de625c', // Munsell 5.9R 5.6/11.3; ISCC-NBS Mod. to str. reddish orange.
  'Flame Red 70030': '#d0463b', // Munsell 7.3R 4.8/12.7; ISCC-NBS Strong reddish orange.
  'Nile 70031': '#b8c293', // Munsell 4.9GY 7.5/3.3; ISCC-NBS Pale to weak yellow green.
  'Pistache 70032': '#8bad89', // Munsell 0.4G 6.6/3.6; ISCC-NBS Weak yellowish green.
  'Tarragon 70033': '#6b8b6f', // Munsell 1.1G 5.3/3.4; ISCC-NBS Weak green.
  'Palmetto 70034': '#697764', // Munsell 8.7GY 4.7/2.0; ISCC-NBS Dusky yellow green.
  'Reseda 70035': '#485a4a', // Munsell 0.8G 3.5/2.3; ISCC-NBS Dusky green.
  'Evergreen 70036': '#2d4131', // Munsell 0.6G 2.5/2.8; ISCC-NBS Very dusky green.
  'Apricot 70037': '#d9a073', // Munsell 5.5YR 6.9/6.1; ISCC-NBS Weak orange.
  'Honeydew 70038': '#f19c6e', // Munsell 2.5YR 7.0/8.3; ISCC-NBS Moderate orange.
  'Salmon 70039': '#ef7c5e', // Munsell 8.8R 6.3/10.7; ISCC-NBS Strong reddish orange.
  'Tangerine 70040': '#c8473b', // Munsell 7.4R 4.7/11.9; ISCC-NBS Strong reddish orange.
  'Paprica 70041': '#cf3725', // Munsell 8.2R 4.6/14.3; ISCC-NBS Vivid reddish orange.
  'Pimento 70042': '#c22827', // Munsell 7.2R 4.2/14.1; ISCC-NBS Vivid red.
  'Sistine 70043': '#819eba', // Munsell 2.6PB 6.2/4.7; ISCC-NBS Pale blue.
  'Copenhagen 70044': '#587090', // Munsell 4.2PB 4.5/4.8; ISCC-NBS Weak purplish blue.
  'Tile Blue 70045': '#456482', // Munsell 2.5PB 4.0/4.7; ISCC-NBS Weak blue.
  'Flemish Blue 70046': '#365170', // Munsell 3.7PB 3.3/4.7; ISCC-NBS Weak purplish blue.
  'Peking Blue 70047': '#27496d', // Munsell 4.0PB 3.0/5.5; ISCC-NBS Moderate purplish blue.
  'Marine Corps 70048': '#2a3d5b', // Munsell 4.9PB 2.5/4.4; ISCC-NBS Dusky purplish blue.
  'Cherry 70049': '#b52e5f', // Munsell 8.8RP 4.1/12.4; ISCC-NBS Moderate purplish red.
  'Harvard Crimson 70050': '#992548', // Munsell 0.7R 3.4/10.3; ISCC-NBS Deep purplish red.
  'Ruby 70051': '#8e2d50', // Munsell 8.6RP 3.4/9.2; ISCC-NBS Deep purplish red.
  'American Beauty 70052': '#7f1e41', // Munsell 0.2R 2.8/8.8; ISCC-NBS Deep purplish red.
  'Magenta 70053': '#852146', // Munsell 9.3RP 3.0/9.0; ISCC-NBS Deep purplish red.
  'Redgrape 70054': '#6f2043', // Munsell 8.2RP 2.6/7.8; ISCC-NBS Very dark purplish red.
  'Lavender 70055': '#a28dad', // Munsell 5.5P 6.0/4.8; ISCC-NBS Pale purple.
  'Lilac 70056': '#8f6b96', // Munsell 6.5P 4.9/6.4; ISCC-NBS Moderate purple.
  'Mauve 70057': '#8e62a2', // Munsell 5.2P 4.7/9.3; ISCC-NBS Moderate purple.
  'Violet 70058': '#7953a3', // Munsell 2.6P 4.2/11.0; ISCC-NBS Strong purple.
  'Pansy 70059': '#482a74', // Munsell 0.9P 2.4/10.0; ISCC-NBS Deep bluish purple.
  'Purple 70060': '#362355', // Munsell 0.6P 1.8/6.9; ISCC-NBS Dark bluish purple.
  'Spring Green 70061': '#87ab51', // Munsell 6.3GY 6.4/7.2; ISCC-NBS Moderate yellowish green.
  'Mintleaf 70062': '#66a153', // Munsell 8.8GY 5.9/7.6; ISCC-NBS Moderate yellowish green.
  'Emerald 70063': '#238140', // Munsell 1.2G 4.6/8.2; ISCC-NBS Moderate yellowish green.
  'Hunter 70064': '#255532', // Munsell 1.0G 3.1/5.1; ISCC-NBS Very dark yellowish green.
  'Myrtle 70065': '#1a573f', // Munsell 4.5G 3.2/5.1; ISCC-NBS Dark green.
  'Bottle Green 70066': '#254034', // Munsell 4.9G 2.4/2.9; ISCC-NBS Very dusky green.
  'Jasmine 70067': '#f4d16b', // Munsell 3.6Y 8.4/7.7; ISCC-NBS Moderate yellow.
  'Spanish Yellow 70068': '#f9b30f', // Munsell 0.4Y 7.6/12.2; ISCC-NBS Strong yellowish orange.
  'Orange 70069': '#f18e13', // Munsell 5.7YR 6.6/12.7; ISCC-NBS Strong orange.
  'Princeton Orange 70070': '#ed8423', // Munsell 4.3YR 6.4/12.5; ISCC-NBS Strong orange.
  'Golden Poppy 70071': '#e56613', // Munsell 1.6YR 5.7/13.8; ISCC-NBS Strong reddish orange.
  'Indian Orange 70072': '#d74f28', // Munsell 9.4R 5.1/13.2; ISCC-NBS Strong reddish orange.
  'Perwinkle 70073': '#6b6d9f', // Munsell 8.7PB 4.6/6.8; ISCC-NBS Moderate bluish purple.
  'Cornflower Blue 70074': '#5455a0', // Munsell 8.4PB 3.8/9.8; ISCC-NBS Strong bluish purple.
  'Old Glory Blue 70075': '#343360', // Munsell 8.2PB 2.3/6.1; ISCC-NBS Dark bluish purple.
  'Independence 70076': '#2c2e4c', // Munsell 7.8PB 2.0/4.3; ISCC-NBS Dusky bluish purple.
  'National Flag Blue 70077': '#292a3e', // Munsell 7.6PB 1.7/2.5; ISCC-NBS Dusky purplish blue.
  'Homage Blue 70078': '#282938', // Munsell 7.7PB 1.7/2.0; ISCC-NBS Purplish black.
  'Geranium 70079': '#de405b', // Munsell 2.7R 5.0/14.0; ISCC-NBS Vivid purplish red.
  'Scarlet 70080': '#d1243c', // Munsell 4.9R 4.5/14.9; ISCC-NBS Vivid red.
  'Cardinal 70081': '#9b2437', // Munsell 4.1R 3.4/10.6; ISCC-NBS Deep red.
  'Dark Cardinal 70082': '#782436', // Munsell 2.8R 2.8/7.7; ISCC-NBS Deep red.
  'Garnet 70083': '#5b2933', // Munsell 3.0R 2.3/4.9; ISCC-NBS Very dark red.
  'Maroon 70084': '#532f38', // Munsell 1.0R 2.4/3.5; ISCC-NBS Very dusky purplish red.
  'Lustre Blue 70085': '#394e86', // Munsell 6.6PB 3.3/7.9; ISCC-NBS Moderate purplish blue.
  'Yale Blue 70086': '#334283', // Munsell 7.3PB 2.9/8.8; ISCC-NBS Strong purplish blue.
  'Royal Blue 70087': '#243471', // Munsell 6.9PB 2.3/8.4; ISCC-NBS Dark purplish blue.
  'Navy 1 70088': '#2c3752', // Munsell 5.8PB 2.3/3.9; ISCC-NBS Dusky purplish blue.
  'Navy 2 70089': '#242d43', // Munsell 5.7PB 1.8/3.2; ISCC-NBS Dusky purplish blue.
  'Midnight 70090': '#242836', // Munsell 6.0PB 1.6/1.9; ISCC-NBS Bluish black.
  'Champagne 70091': '#d9b998', // Munsell 8.5YR 7.6/3.5; ISCC-NBS Pale to weak orange.
  'Cork 70092': '#a47e60', // Munsell 6.8YR 5.4/4.0; ISCC-NBS Light brown.
  'Sandalwood 70093': '#906e56', // Munsell 6.0YR 4.8/3.6; ISCC-NBS Light brown.
  'Oakwood 70094': '#805b43', // Munsell 5.2YR 4.1/3.7; ISCC-NBS Moderate brown.
  'Tobacco 70095': '#593a2c', // Munsell 4.3YR 2.7/3.1; ISCC-NBS Dark brown.
  'African Brown 70096': '#463a36', // Munsell 4.7YR 2.5/1.1; ISCC-NBS Brownish black.
  'Vassar Rose 70097': '#e38fa1', // Munsell 8.1RP 6.7/8.1; ISCC-NBS Light purplish red.
  'Peach Blossom 70098': '#d0647c', // Munsell 9.2RP 5.5/10.3; ISCC-NBS Strong purplish red.
  'Strawberry 70099': '#a94d66', // Munsell 8.8RP 4.4/8.8; ISCC-NBS Moderate purplish red.
  'Raspberry 70100': '#8c3753', // Munsell 8.6RP 3.5/8.2; ISCC-NBS Dark purplish red.
  'Claret 70101': '#4d2b36', // Munsell 9.9RP 2.2/3.4; ISCC-NBS Very dusky purplish red.
  'Burgundy 70102': '#432b34', // Munsell 8.7RP 2.0/2.3; ISCC-NBS Very dusky red purple.
  'Ecru 70103': '#ae9c83', // Munsell 0.9Y 6.4/2.3; ISCC-NBS Pale brown.
  'Beige 70104': '#9d836c', // Munsell 7.8YR 5.5/2.8; ISCC-NBS Pale brown.
  'Fawn 70105': '#88715c', // Munsell 8.1YR 4.8/2.6; ISCC-NBS Pale brown.
  'Beaver 70106': '#746050', // Munsell 7.6YR 4.1/2.0; ISCC-NBS Weak brown.
  'Autumn Brown 70107': '#563f30', // Munsell 7.1YR 2.8/2.5; ISCC-NBS Weak brown.
  'Seal 70108': '#443831', // Munsell 7.1YR 2.4/1.3; ISCC-NBS Dusky brown.
  'Old Blue 70109': '#95a0a8', // Munsell 1.2PB 6.4/1.7; ISCC-NBS Medium bluish gray.
  'Mistiblu 70110': '#717a86', // Munsell 3.5PB 4.9/2.0; ISCC-NBS Pale purplish blue.
  'West Point 70111': '#4d5662', // Munsell 3.6PB 3.5/1.7; ISCC-NBS Dark bluish gray.
  'Bluesteel 70112': '#434d5b', // Munsell 4.0PB 3.2/2.0; ISCC-NBS Weak purplish blue.
  'Stone Blue 70113': '#454a5a', // Munsell 6.0PB 3.1/2.0; ISCC-NBS Weak purplish blue.
  'Graphite Blue 70114': '#2d3240', // Munsell 6.2PB 2.0/2.0; ISCC-NBS Bluish black.
  'Amberlite 70115': '#cb9b65', // Munsell 8.6YR 6.6/5.9; ISCC-NBS Dusky yellowish orange.
  'Topaz 70116': '#c58c52', // Munsell 7.3YR 6.1/6.8; ISCC-NBS Weak orange.
  'Burnished Straw 70117': '#a6734c', // Munsell 5.8YR 5.1/5.5; ISCC-NBS Light brown.
  'Gold Brown 70118': '#9c5f3e', // Munsell 3.4YR 4.5/6.2; ISCC-NBS Moderate brown.
  'Brown 70119': '#6a422d', // Munsell 4.2YR 3.1/4.2; ISCC-NBS Moderate brown.
  'Caramel Brown 70120': '#573428', // Munsell 3.1YR 2.5/3.5; ISCC-NBS Dusky reddish brown.
  'Starlight Blue 70121': '#9facc0', // Munsell 5.2PB 6.8/3.2; ISCC-NBS Very pale purplish blue.
  'Lupine 70122': '#7e8fb0', // Munsell 5.6PB 5.8/5.0; ISCC-NBS Pale purplish blue.
  'Hydrangea Blue 70123': '#56678b', // Munsell 5.7PB 4.2/5.1; ISCC-NBS Moderate purplish blue.
  'Grecian Rose 70124': '#c6887f', // Munsell 6.8R 6.1/5.5; ISCC-NBS Weak reddish orange.
  'Bois de Rose 70125': '#ab665f', // Munsell 6.6R 4.9/6.1; ISCC-NBS Weak reddish orange.
  'Mahogany 70126': '#643735', // Munsell 6.8R 2.8/3.8; ISCC-NBS Very dusky red.
  'Sunset 70127': '#ecc49a', // Munsell 8.2YR 8.0/4.4; ISCC-NBS Weak yellowish orange.
  'Tan 70128': '#b9966e', // Munsell 8.7YR 6.3/4.4; ISCC-NBS Light yellowish brown.
  'Maple Sugar 70129': '#947048', // Munsell 9.0YR 4.8/4.5; ISCC-NBS Moderate yellowish brown.
  'Almond Green 70130': '#6a7b69', // Munsell 0.2G 4.8/2.0; ISCC-NBS Weak green.
  'Blue Spruce 70131': '#4d6f62', // Munsell 7.3G 4.3/2.8; ISCC-NBS Weak blue green.
  'Jungle Green 70132': '#233f39', // Munsell 1.1BG 2.4/2.7; ISCC-NBS Very dusky green.
  'Orchid 70133': '#c4a2c4', // Munsell 7.5P 6.9/5.8; ISCC-NBS Light reddish purple.
  'Amethyst 70134': '#774b7a', // Munsell 7.4P 3.8/7.2; ISCC-NBS Moderate purple.
  'Plum 70135': '#4a2f50', // Munsell 6.4P 2.3/4.9; ISCC-NBS Very dusky purple.
  'Sand 70136': '#b4a998', // Munsell 1.4Y 6.8/1.5; ISCC-NBS Yellowish gray.
  'Castor 70137': '#584f46', // Munsell 9.8YR 3.3/1.0; ISCC-NBS Brownish gray.
  'Taupe 70138': '#4c443d', // Munsell 8.6YR 2.9/0.9; ISCC-NBS Brownish gray.
  'Nude 70139': '#b19b87', // Munsell 8.4YR 6.4/2.2; ISCC-NBS Pale brown.
  'Toast Brown 70140': '#855e4b', // Munsell 3.6YR 4.2/3.7; ISCC-NBS Weak to moderate brown.
  'Spicebrown 70141': '#593a2d', // Munsell 3.6YR 2.7/3.1; ISCC-NBS Dark brown.
  'Brittany Blue 70142': '#5d8ca2', // Munsell 8.6B 5.4/4.8; ISCC-NBS Weak blue.
  'Old China 70143': '#3f6888', // Munsell 1.5PB 4.1/5.4; ISCC-NBS Moderate blue.
  'Peasant Blue 70144': '#3d5571', // Munsell 3.4PB 3.4/4.2; ISCC-NBS Dusky blue.
  'Aqua 70145': '#689393', // Munsell 8.0BG 5.6/3.0; ISCC-NBS Moderate blue green.
  'River Blue 70146': '#4a7075', // Munsell 1.1B 4.3/3.0; ISCC-NBS Moderate blue green.
  'Teal 70147': '#254e5d', // Munsell 5.3B 3.0/3.3; ISCC-NBS Dusky blue.
  'Peach 70148': '#f4b793', // Munsell 3.5YR 7.8/5.7; ISCC-NBS Pale to light orange.
  'Crab Apple 70149': '#ea6e58', // Munsell 7.7R 5.9/11.5; ISCC-NBS Strong reddish orange.
  'Lacquer 70150': '#a74139', // Munsell 7.3R 4.0/9.5; ISCC-NBS Dark reddish orange.
  'Silver 70151': '#9c9691', // Munsell 8.0YR 6.1/0.6; ISCC-NBS Light brownish gray.
  'Nickel 70152': '#959191', // Munsell 1.2R 5.9/0.5; ISCC-NBS Medium gray.
  'Steel 70153': '#757276', // Munsell 6.3P 4.7/0.8; ISCC-NBS Medium purplish gray.
  'Limepeel 70154': '#8e9845', // Munsell 2.7GY 5.9/6.0; ISCC-NBS Moderate yellow green.
  'Mosstone 70155': '#78803f', // Munsell 2.7GY 5.0/5.0; ISCC-NBS Dark yellow green.
  'Olive 70156': '#4d5431', // Munsell 3.1GY 3.3/3.2; ISCC-NBS Moderate olive green.
  'Old Gold 70157': '#b79341', // Munsell 2.3Y 6.1/6.9; ISCC-NBS Dusky yellowish orange.
  'Gold 70158': '#b08638', // Munsell 1.3Y 5.7/7.1; ISCC-NBS Strong yellowish brown.
  'Bronze 70159': '#66502d', // Munsell 1.8Y 3.5/3.8; ISCC-NBS Yellowish brown.
  'Burnt Orange 70160': '#b95d34', // Munsell 1.5YR 4.8/9.2; ISCC-NBS Moderate reddish orange.
  'Terra Cotta 70161': '#873e2e', // Munsell 9.8R 3.5/7.0; ISCC-NBS Moderate reddish brown.
  'Henna 70162': '#794035', // Munsell 9.4R 3.3/5.3; ISCC-NBS Moderate reddish brown.
  'Heliotrope 70163': '#804c6d', // Munsell 2.3RP 3.8/5.9; ISCC-NBS Moderate red purple.
  'Prune 70164': '#402840', // Munsell 8.6P 2.0/4.0; ISCC-NBS Very dusky reddish purple.
  'Eggplant 70165': '#372d38', // Munsell 7.5P 1.9/1.5; ISCC-NBS Purplish black.
  'Jade Green 70166': '#749768', // Munsell 8.8GY 5.7/4.6; ISCC-NBS Weak yellowish green.
  'Primitive Green 70167': '#00814e', // Munsell 3.6G 4.5/8.9; ISCC-NBS Strong green.
  'Irish Green 70168': '#006138', // Munsell 4.0G 3.3/8.8; ISCC-NBS Deep green.
  'Putty 70169': '#a0948b', // Munsell 6.5YR 6.0/1.2; ISCC-NBS Light brownish gray.
  'Pigeon 70170': '#847878', // Munsell 4.1R 5.0/1.1; ISCC-NBS Reddish gray.
  'Smoke 70171': '#4a4545', // Munsell 5.1R 2.9/0.4; ISCC-NBS Dark gray.
  'Purple Orchid 70172': '#8c3285', // Munsell 9.3P 3.6/12.1; ISCC-NBS Deep reddish purple.
  'Dahlia Purple 70173': '#692671', // Munsell 7.0P 2.8/10.2; ISCC-NBS Deep reddish purple.
  'Imperial Purple 70174': '#612d64', // Munsell 7.9P 2.7/8.0; ISCC-NBS Dark reddish purple.
  'Saxe Blue 70175': '#5d819a', // Munsell 0.8PB 5.1/4.6; ISCC-NBS Weak blue.
  'Electric 70176': '#2c5c73', // Munsell 8.6B 3.6/4.6; ISCC-NBS Dusky blue.
  'Majolica Blue 70177': '#2d5777', // Munsell 1.6PB 3.5/5.3; ISCC-NBS Dusky to dark blue.
  'Shrimp Pink 70178': '#f3686d', // Munsell 4.0R 6.0/12.8; ISCC-NBS Brilliant red.
  'Apple Red 70179': '#c52c3e', // Munsell 4.8R 4.3/13.6; ISCC-NBS Vivid red.
  'Old Glory Red 70180': '#9c1c2d', // Munsell 5.5R 3.3/11.1; ISCC-NBS Vivid red.
  'Chalk Pink 70181': '#e4aeaa', // Munsell 5.0R 7.4/4.6; ISCC-NBS Moderate pink.
  'Old Rose 70182': '#c27e85', // Munsell 1.1R 5.8/6.3; ISCC-NBS Light purplish red.
  'Goldmist 70183': '#beae73', // Munsell 5.3Y 7.0/4.5; ISCC-NBS Weak greenish yellow.
  'Lt. Olive Drab 70184': '#67553b', // Munsell 1.8Y 3.6/2.7; ISCC-NBS Weak brown.
  'Gull 70185': '#b0a6a0', // Munsell 5.0YR 6.7/0.9; ISCC-NBS Pinkish gray.
  'Grebe 70186': '#595554', // Munsell 1.8YR 3.5/0.3; ISCC-NBS Dark gray.
  'Flax 70187': '#bea680', // Munsell 1.2Y 6.8/3.5; ISCC-NBS Weak yellowish orange.
  'Khaki 70188': '#a18d6e', // Munsell 1.1Y 5.8/2.7; ISCC-NBS Pale brown.
  'Ashes of Rose 70189': '#a86f83', // Munsell 5.5RP 5.2/5.9; ISCC-NBS Moderate red purple.
  'Catawba 70190': '#552f42', // Munsell 5.0RP 2.4/4.7; ISCC-NBS Very dusky red purple.
  'Rose Beige 70191': '#b88f75', // Munsell 4.5YR 6.1/4.0; ISCC-NBS Light brown.
  'Cocoa 70192': '#7b4f40', // Munsell 1.9YR 3.7/4.0; ISCC-NBS Moderate brown.
  'Pearl Gray 70193': '#aca79d', // Munsell 2.3Y 6.7/0.7; ISCC-NBS Yellowish gray.
  'Dusty Pink 70194': '#ca9e8f', // Munsell 0.4YR 6.7/3.9; ISCC-NBS Moderate orange pink.
  'Dustblu 70195': '#808a99', // Munsell 4.3PB 5.6/2.4; ISCC-NBS Pale purplish blue.
  'Chamois 70196': '#c2a167', // Munsell 1.5Y 6.6/5.1; ISCC-NBS Light yellowish brown.
  'Crayon Green 70197': '#9dc598', // Munsell 10.0GY 7.4/4.2; ISCC-NBS Pale yellowish green.
  'Violine Pink 70198': '#b86186', // Munsell 4.8RP 5.1/9.0; ISCC-NBS Strong red purple.
  'Natural 70199': '#c0b29f', // Munsell 0.6Y 7.2/1.7; ISCC-NBS Very pale brown.
  'Spraygreen 70200': '#95ab9a', // Munsell 1.7G 6.6/1.9; ISCC-NBS Pale green.
  'Bisque 70201': '#b79b84', // Munsell 7.0YR 6.4/2.8; ISCC-NBS Light brown.
  'Crocus 70202': '#bf8fb2', // Munsell 0.2RP 6.3/6.4; ISCC-NBS Light reddish purple.
  'Popcorn 70203': '#e7c36a', // Munsell 2.8Y 7.9/7.2; ISCC-NBS Moderate yellow.
  "Robin's Egg 70204": '#6a878e', // Munsell 4.7B 5.3/2.5; ISCC-NBS Weak blue.
  'Lemon Yellow 70205': '#e9ca53', // Munsell 4.7Y 8.1/8.7; ISCC-NBS Moderate yellow.
  'Coral 70206': '#ff8f96', // Munsell 2.5R 7.1/10.6; ISCC-NBS Vivid pink.
  'Parrot Blue 70207': '#15939b', // Munsell 10.0BG 5.4/6.5; ISCC-NBS Moderate greenish blue.
  'Chartreuse 70208': '#c7be36', // Munsell 9.2Y 7.4/9.0; ISCC-NBS Moderate greenish yellow.
  'Oriental Blue 70209': '#005ca4', // Munsell 4.5PB 3.7/11.1; ISCC-NBS Vivid purplish blue.
  'Carmine 70210': '#bf1f48', // Munsell 2.7R 4.1/13.8; ISCC-NBS Vivid purplish red.
  'Bluebird 70211': '#346189', // Munsell 2.9PB 3.9/6.4; ISCC-NBS Moderate blue.
  'Parma Violet 70212': '#7456a2', // Munsell 1.7P 4.2/10.5; ISCC-NBS Strong bluish purple.
  'Fuchsia 70213': '#c00088', // Munsell 3.3RP 4.1/17.2; ISCC-NBS Vivid red purple.
  'Scarab Green 70214': '#02ab74', // Munsell 4.3G 6.0/9.3; ISCC-NBS Brilliant green.
  'Nugget Gold 70215': '#c09b16', // Munsell 3.9Y 6.4/9.3; ISCC-NBS Dark to deep yellow.
  'Sapphire Blue 70216': '#34367e', // Munsell 7.9PB 2.6/10.0; ISCC-NBS Deep bluish purple.
  'Golden Yellow 65001': '#e1ab00', // Munsell 2.0Y 7.1/11.3; ISCC-NBS Strong yellowish orange.
  'Yellow 65002': '#f19900', // Munsell 7.8YR 6.9/13.2; ISCC-NBS Strong orange.
  'Golden Orange 65003': '#e37e2f', // Munsell 3.8YR 6.1/11.4; ISCC-NBS Strong orange.
  'Orange 65004': '#da5228', // Munsell 9.5R 5.2/13.2; ISCC-NBS Strong reddish orange.
  'White 65005': '#dfd6c5', // Munsell 1.8Y 8.5/1.2; ISCC-NBS Yellowish white.
  'Scarlet 65006': '#a62c30', // Munsell 6.1R 3.7/11.2; ISCC-NBS Deep to vivid red.
  'Green 65007': '#32573b', // Munsell 1.2G 3.3/4.2; ISCC-NBS Very dark yellowish green.
  'Silver Gray 65008': '#9a9691', // Munsell 1.0Y 6.1/0.5; ISCC-NBS Medium gray.
  'Pansy 65009': '#533579', // Munsell 1.4P 2.8/9.1; ISCC-NBS Moderate bluish purple.
  'Ultramarine Blue 65010': '#22378c', // Munsell 7.0PB 2.6/11.8; ISCC-NBS Deep purplish blue.
  'Cobalt Blue 65011': '#323a5f', // Munsell 6.9PB 2.5/5.2; ISCC-NBS Dusky purplish blue.
  'Dark Blue 65012': '#2d2e30', // Munsell 7.3PB 1.8/0.4; ISCC-NBS Black.
  'Crimson 65013': '#962546', // Munsell 0.8R 3.4/10.2; ISCC-NBS Deep purplish red.
  'Light Blue 65014': '#6b8999', // Munsell 9.0B 5.4/3.4; ISCC-NBS Weak blue.
  'Buff 65015': '#daaf7a', // Munsell 9.0YR 7.2/5.4; ISCC-NBS Weak yellowish orange.
  'Brown 65016': '#654533', // Munsell 5.0YR 3.1/3.3; ISCC-NBS Moderate brown.
  'Maroon 65017': '#513337', // Munsell 3.3R 2.4/2.7; ISCC-NBS Very dusky red.
  'Black 65018': '#2d2e2f', // Munsell 5.1PB 1.8/0.2; ISCC-NBS Black.
  'Sky Blue 65019': '#2c3953', // Munsell 5.3PB 2.4/3.8; ISCC-NBS Dusky purplish blue.
  'Brick Red 65020': '#7c2c2b', // Munsell 6.8R 3.0/7.5; ISCC-NBS Deep reddish brown.
  'Old Gold 65021': '#c7a44d', // Munsell 3.1Y 6.7/7.1; ISCC-NBS Moderate yellow.
  'Mosstone 65022': '#738343', // Munsell 4.8GY 5.0/5.1; ISCC-NBS Dark yellow green.
} as const;

export type TccaColorName = keyof typeof tccaColors;

function tccaNormalize(input: string): string {
  return /\d{5}/.exec(input)?.[0] ?? standardNormalize(input);
}

export const tcca = {
  name: 'tcca',
  colors: tccaColors,
  normalize: tccaNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<TccaColorName>;
