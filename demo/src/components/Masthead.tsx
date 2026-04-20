// Page header: volume/issue eyebrow, wordmark, tagline, and the
// Github/npm link row. Takes `metric` so the Wordmark's CMYK channel
// offsets can animate in lockstep with the current distance-metric choice.

import type { DistanceMetric } from 'chromonym';
import { Wordmark } from './Wordmark.js';

interface MastheadProps {
  metric: DistanceMetric;
}

export function Masthead({ metric }: MastheadProps) {
  return (
    <header className="bh-rise space-y-4">
      <div className="flex items-baseline justify-between bh-rule-thick pt-2">
        <span className="bh-eyebrow">vol. 3 · issue 01</span>
        <span className="bh-eyebrow">2026 · typescript</span>
      </div>

      <Wordmark metric={metric} className="mt-2" />

      <div className="grid grid-cols-[1fr_auto] items-end gap-6 pt-2">
        <div className="max-w-2xl">
          {/* Headline sentence keeps the original display size; the
              detail sentences below drop to small body so the block has
              real hierarchy instead of uniform marketing prose. */}
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
