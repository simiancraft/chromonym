import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * The Institute of Heraldry's 45 common heraldic yarn colors from the
 * "Common Colors Conversion Chart" in the 2022 TIOH Palette Sampler.
 * The sampler's published HEX values are reproduced unchanged, except
 * that White uses cable 67101 from the DoD heraldic yarn card instead
 * of the sampler's duplicated 67103.
 *
 * TIOH derived the screen values from Pantone references. They are
 * on-screen approximations of physical yarns, not measured yarn colors.
 * The `tcca` palette contains NBS measurements of the 1946 textile cards
 * to which these later heraldic yarns are matched. See NOTICE.md for
 * provenance and limitations.
 */
const tiohColors = {
  'AF Yellow 67103': '#ffcd00', // Textile 65023.
  'Yellow 67108': '#ffbf3c', // Textile 65002.
  'Golden Orange 67109': '#ff9e18', // Textile 65003.
  'Orange 67110': '#ff4d00', // Textile 65004.
  'Paprica 67151': '#ff4713', // Textile 80041.
  'MC Scarlet 67154': '#ea0029', // No textile cable listed.
  'Scarlet 67111': '#c10230', // Textile 65006.
  'Brick Red 67113': '#8a2432', // Textile 65020.
  'Maroon 67114': '#572a31', // Textile 65017.
  'Purple 67115': '#60269e', // Textile 65009.
  'Brittany Blue 67119': '#a2c5d3', // Textile 80130.
  'Bluebird 67117': '#7badd3', // Textile 65026.
  'Oriental Blue 67172': '#0071ce', // Textile 65027.
  'VM Blue #2 67173': '#004987', // Textile 68003.
  'Teal Blue 67121': '#003e52', // Textile 65024.
  'Dark Blue 67126': '#00263a', // Textile 65012.
  'Flag Blue 67124': '#011e41', // Textile 80077.
  'Cobalt 67122': '#00205c', // Textile 65011.
  'Old Glory Blue 67178': '#002169', // Textile 80075.
  'Ultramarine Blue 67118': '#001689', // Textile 65010.
  'Mintleaf 67186': '#a2d45e', // Textile 80062.
  'Emerald 67128': '#61a60e', // Textile 80063.
  'Primitive Green 67188': '#009845', // Textile 80119.
  'Irish Green 67189': '#00833e', // Textile 80120.
  'Myrtle Green 67190': '#007934', // Textile 80065.
  'Bottle Green 67191': '#095540', // Textile 65025.
  'Spruce Green 67130': '#004c45', // Textile 80066.
  'Green 67129': '#1a5632', // Textile 65007.
  'Army Green 67131': '#294634', // Textile 66034.
  'Olive 67134': '#4d5a31', // Textile 66022.
  'Natural 67192': '#ccc4a7', // Textile 80008.
  'Khaki 67193': '#b2a77e', // Textile 80162.
  'Buff 67135': '#bc955c', // Textile 65015.
  'Bronze 67147': '#8b6f4b', // Textile 80111.
  'Bagby Green 67204': '#a19200', // Textile 80089.
  'Olive Drab 67133': '#6b5a24', // Textile 66021.
  'Gold Brown 67194': '#bb6125', // Textile 80166.
  'Toast 67195': '#9d5918', // Textile 10042.
  'Spicebrown 67196': '#75391c', // Textile 80129.
  'Brown 67136': '#623c21', // Textile 65016.
  'Black 67138': '#000000', // Textile 65018.
  'Smoke 67201': '#53575a', // Textile 80099.
  'Steel 67199': '#7b868c', // Textile 80141.
  'Silver Gray 67137': '#9ea1a2', // Textile 65008.
  'White 67101': '#ffffff', // Textile 65005; sampler yarn 67103 corrected from DoD card.
} as const;

export type TiohColorName = keyof typeof tiohColors;

function tiohNormalize(input: string): string {
  return /\d{5}/.exec(input)?.[0] ?? standardNormalize(input);
}

export const tioh = {
  name: 'tioh',
  colors: tiohColors,
  normalize: tiohNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<TiohColorName>;
