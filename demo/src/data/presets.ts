// Hero-section presets — one click applies all three: input, palette, metric.
// Kept as data so the hero doesn't know which brand colors are currently in
// rotation, and useDemoState doesn't care about their labels.

import type { DistanceMetric } from 'chromonym';
import type { PaletteKey } from '../components/PaletteGrid.js';

export interface Preset {
  label: string;
  color: string;
  palette: PaletteKey;
  metric: DistanceMetric;
}

export const PRESETS: readonly Preset[] = [
  { label: 'T-Mobile magenta → Pantone', color: '#E20074', palette: 'pantone', metric: 'deltaE2000' },
  { label: 'Spotify green → Pantone', color: '#1DB954', palette: 'pantone', metric: 'deltaE2000' },
  { label: 'Facebook blue → Pantone', color: '#1877F2', palette: 'pantone', metric: 'deltaEok' },
  { label: 'Dodger blue → web', color: '#1E90FF', palette: 'web', metric: 'deltaE76' },
  { label: 'Blueviolet → X11 (ΔE76 picks differently)', color: '#8A2BE2', palette: 'x11', metric: 'deltaE76' },
];
