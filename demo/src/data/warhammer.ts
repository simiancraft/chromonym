// BYO palette for the resolve act: six Warhammer 40k faction colors rendered
// as a Kandinsky composition. Lives as its own module so App.tsx stays a
// composition root — the palette itself, the chants, and the component that
// reads them are all separable concerns.

import type { Palette } from 'chromonym';

export const warhammer = {
  name: 'warhammer40k',
  colors: {
    'world eaters red': '#8b1a1a',
    'adeptus red': '#652022',
    'sons of malice white': '#e8e4d8',
    'the flawless host purple': '#6b2d7d',
    'nurgle green': '#748c3f',
    'alpha legion teal': '#2a6d7a',
  },
  normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<
  | 'world eaters red'
  | 'adeptus red'
  | 'sons of malice white'
  | 'the flawless host purple'
  | 'nurgle green'
  | 'alpha legion teal'
>;

// In-universe battle-cry for each faction. Rendered only in the *displayed*
// BYO snippet (not the copy payload) so scrubbing the input across factions
// swaps the flavor line. Half easter egg, half interactive: the code block
// reads differently depending on what the user just matched.
export const WARHAMMER_INVOCATIONS: Record<keyof (typeof warhammer)['colors'], string> = {
  'world eaters red': 'blood for the blood god',
  'adeptus red': 'for the glory of the omnissiah',
  'sons of malice white': 'spite the gods',
  'the flawless host purple': 'perfection in all things',
  'nurgle green': 'grandfather nurgle smiles',
  'alpha legion teal': 'hydra dominatus',
};
