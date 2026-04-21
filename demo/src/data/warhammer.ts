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
    'ultramarines blue': '#2a5f9e',
    'the flawless host purple': '#6b2d7d',
    'nurgle green': '#748c3f',
    'alpha legion teal': '#2a6d7a',
    'imperial fists yellow': '#f0c020',
  },
  normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<
  | 'world eaters red'
  | 'adeptus red'
  | 'sons of malice white'
  | 'ultramarines blue'
  | 'the flawless host purple'
  | 'nurgle green'
  | 'alpha legion teal'
  | 'imperial fists yellow'
>;

// Canonical warhammer color-name union, derived from the palette literal
// above. Exported so every consumer of this data (invocations map, the
// Kandinsky SVG shape list, the KandinskyBYO component's generic prop)
// reads from the same source — adding or removing a color on the palette
// fails the compile at every affected call site.
export type WarhammerName = keyof (typeof warhammer)['colors'];

// In-universe battle-cry for each faction. Rendered only in the *displayed*
// BYO snippet (not the copy payload) so scrubbing the input across factions
// swaps the flavor line. Half easter egg, half interactive: the code block
// reads differently depending on what the user just matched.
//
// Sons of Malice is the one Chaos Space Marine renegade chapter that rejects
// the four Chaos gods outright; "we are the damned" is the canonical in-
// universe framing of that opposition, which is why it replaces the looser
// "spite the gods" draft.
export const WARHAMMER_INVOCATIONS: Record<WarhammerName, string> = {
  'world eaters red': 'blood for the blood god',
  'adeptus red': 'for the glory of the omnissiah',
  'sons of malice white': 'we are the damned',
  'ultramarines blue': 'courage and honour',
  'the flawless host purple': 'perfection in all things',
  'nurgle green': 'grandfather nurgle smiles',
  'alpha legion teal': 'hydra dominatus',
  'imperial fists yellow': 'primarch-progenitor',
};
