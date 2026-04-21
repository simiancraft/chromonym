// Page header: volume/issue eyebrow, wordmark, tagline, and the Github/npm
// link row. Takes `hex` so the Wordmark's R / G / B ghost layers can each
// animate their x-offset in lockstep with the demo's currently selected
// color — the masthead is part of the interaction, not a static logo.
//
// Hiding in the top eyebrow row are two decorative-looking inputs that
// actually drive the wordmark: a `<select>` styled as eyebrow text that
// cycles the ghost layers' mix-blend-mode, and a thin line-with-a-dot
// slider that dials their opacity. They read as part of the chrome; they
// behave like controls.

import { useState } from 'react';
import { Wordmark } from './Wordmark.js';

interface MastheadProps {
  hex: string;
}

// Supported blend modes for the ghost layers. Order roughly runs
// "most kinetic" → "least" so picking blindly lands somewhere visually
// interesting. 'difference' is the default because it produces the
// cleanest R-G-B fringes against the cream paper.
const BLEND_MODES = [
  'difference',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
  'normal',
] as const;

type BlendMode = (typeof BLEND_MODES)[number];

export function Masthead({ hex }: MastheadProps) {
  const [blendMode, setBlendMode] = useState<BlendMode>('difference');
  const [ghostOpacityPct, setGhostOpacityPct] = useState(100);

  return (
    <header className="bh-rise space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-x-4 gap-y-1 bh-rule-thick pt-2">
        <span className="bh-eyebrow">vol. 3 · issue 01</span>

        <div className="flex items-baseline gap-4">
          <select
            className="eyebrow-select"
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value as BlendMode)}
            aria-label="wordmark blend mode"
          >
            {BLEND_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            className="eyebrow-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={ghostOpacityPct}
            onChange={(e) => setGhostOpacityPct(Number(e.target.value))}
            aria-label="wordmark ghost opacity"
          />
        </div>

        <span className="bh-eyebrow">2026 · typescript</span>
      </div>

      <Wordmark
        hex={hex}
        ghostBlendMode={blendMode}
        ghostOpacity={ghostOpacityPct / 100}
        className="mt-2"
      />

      <div className="grid grid-cols-[1fr_auto] items-end gap-6 pt-2">
        <div className="max-w-2xl">
          <p
            className="text-base md:text-lg leading-snug"
            style={{ fontWeight: 500 }}
          >
            The last color-naming library you'll need.
          </p>
          <p
            className="text-xs md:text-sm leading-snug opacity-75 mt-[6px]"
            style={{ fontWeight: 400 }}
          >
            Lean enough for quick CSS name lookups; deep enough for Pantone,
            Crayola, X11, and your own palettes. One tight API (identify,
            resolve, convert) with six perceptual distance metrics, full
            TypeScript inference, and zero cost for palettes you don't import.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono uppercase tracking-wider">
          <a
            href="https://github.com/simiancraft/chromonym"
            rel="noopener"
            className="underline decoration-[2px] underline-offset-[6px] hover:text-[var(--bh-red)]"
          >
            github
          </a>
          <a
            href="https://www.npmjs.com/package/chromonym"
            rel="noopener"
            className="underline decoration-[2px] underline-offset-[6px] hover:text-[var(--bh-red)]"
          >
            npm
          </a>
        </div>
      </div>
      {/* The masthead-to-act divider is the ConvergenceStrip below, driven
          by the current input color — no inert `bh-rule` here. */}
    </header>
  );
}
