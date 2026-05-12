import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Pokémon type colors — the 18 canonical type symbols as displayed on
 * type badges in modern Pokémon media.
 *
 * Keys are Title Case singular ('Fire', 'Water', 'Grass'), matching the
 * in-game spelling. `standardNormalize` strips case and punctuation, so
 * `resolve('fire')`, `resolve('FIRE')`, and `resolve('Fire')` all hit
 * the same entry.
 *
 * sRGB values are community-cited approximations of the type-badge
 * colors documented on Bulbapedia
 * (https://bulbapedia.bulbagarden.net/wiki/Type), which itself sources
 * from in-game asset extraction. Pokémon names and the type framework
 * are trademarks of Nintendo, Game Freak, and The Pokémon Company; this
 * palette is a nominative reference, not an official asset set. See
 * NOTICE.md.
 *
 * Default metric: `deltaE76`. The set is tiny (18 entries) and the
 * inter-color distances are large enough that any sensible metric
 * picks the same neighbor; deltaE76 is the cheapest.
 */
const pokemonColors = {
  // --- Gen 1 (RGBY) ---
  Normal: '#a8a77a',
  Fighting: '#c22e28',
  Flying: '#a98ff3',
  Poison: '#a33ea1',
  Ground: '#e2bf65',
  Rock: '#b6a136',
  Bug: '#a6b91a',
  Ghost: '#735797',
  Fire: '#ee8130',
  Water: '#6390f0',
  Grass: '#7ac74c',
  Electric: '#f7d02c',
  Psychic: '#f95587',
  Ice: '#96d9d6',
  Dragon: '#6f35fc',

  // --- Gen 2 (GSC) ---
  Dark: '#705746',
  Steel: '#b7b7ce',

  // --- Gen 6 (XY) ---
  Fairy: '#d685ad',
} as const;

export type PokemonColorName = keyof typeof pokemonColors;

/**
 * The 18 Pokémon type colors as a `Palette<PokemonColorName>`.
 *
 * Keys are Title Case ('Fire', 'Water'); standard normalizer accepts
 * any case + punctuation variant. Default metric is `'deltaE76'`: the
 * set is small enough that metric choice is academic.
 *
 * @example
 * identify('#ee8130', { palette: pokemon });          // 'Fire'
 * resolve('water', { palette: pokemon });             // '#6390f0'
 * pokemon.colors.Dragon;                              // '#6f35fc'
 */
export const pokemon = {
  name: 'pokemon',
  colors: pokemonColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE76',
} as const satisfies Palette<PokemonColorName>;
