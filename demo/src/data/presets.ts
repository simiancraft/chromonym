// Hero-section presets — one click applies all three: input, palette, metric.
// The shape carries `name` and `palette` separately so the preset button can
// render them hierarchically (brand name big, palette name small).

import type { DistanceMetric } from 'chromonym';
import type { PaletteKey } from '../components/PaletteGrid.js';

export interface Preset {
  /** Human brand name — the loud line on the preset button. */
  name: string;
  color: string;
  palette: PaletteKey;
  metric: DistanceMetric;
}

export const PRESETS: readonly Preset[] = [
  { name: 'T-Mobile Magenta', color: '#E20074', palette: 'pantone', metric: 'deltaE2000' },
  { name: 'Spotify Green', color: '#1DB954', palette: 'pantone', metric: 'deltaE2000' },
  { name: 'Facebook Blue', color: '#1877F2', palette: 'pantone', metric: 'deltaEok' },
  { name: 'Dodger Blue', color: '#1E90FF', palette: 'web', metric: 'deltaE76' },
  { name: 'Blueviolet', color: '#8A2BE2', palette: 'x11', metric: 'deltaE76' },
];
