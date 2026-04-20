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
        <p
          className="text-base md:text-lg leading-snug max-w-xl"
          style={{ fontWeight: 400 }}
        >
          a typeset manual for naming colors. scrub an input; read the
          nearest name across every palette; watch the signal lock in.
        </p>
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
