// Hero identify panel — color picker, palette tiles, metric selector,
// presets, result swatches, and a LiveSnippet. All three controls are
// connected to the shared demo state; applyPreset sets all three at once.
//
// Kept as a plain presentation component: no local state, no effects.
// Each prop corresponds directly to a value / action from useDemoState(),
// so the mapping from state → view is visible at the call site.

import type { DistanceMetric } from 'chromonym';
import { type Preset, PRESETS } from '../data/presets.js';
import { METRICS, METRIC_LABELS } from '../lib/metrics.js';
import { buildIdentifySnippet } from '../lib/snippets.js';
import { LiveSnippet } from './LiveSnippet.js';
import { type PaletteKey } from './PaletteGrid.js';
import { PaletteTiles } from './PaletteTiles.js';

interface HeroIdentifierProps {
  input: string;
  setInput: (hex: string) => void;
  paletteKey: PaletteKey;
  setPaletteKey: (k: PaletteKey) => void;
  metric: DistanceMetric;
  setMetric: (m: DistanceMetric) => void;
  applyPreset: (p: Preset) => void;
  matchedName: string | null;
  matchedHex: string | null;
}

export function HeroIdentifier({
  input,
  setInput,
  paletteKey,
  setPaletteKey,
  metric,
  setMetric,
  applyPreset,
  matchedName,
  matchedHex,
}: HeroIdentifierProps) {
  return (
    <div
      className="p-6 md:p-8 space-y-8"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      {/* controls row: input + tiles + metric */}
      <div className="grid md:grid-cols-[220px_1fr_240px] gap-6">
        <div>
          <div className="bh-eyebrow mb-2">input</div>
          <label className="block">
            <input
              type="color"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[132px] cursor-pointer appearance-none"
              style={{ border: '1px solid var(--bh-ink)', padding: 0 }}
              aria-label="color picker"
            />
          </label>
          <code className="block font-mono text-xs mt-2">{input}</code>
        </div>

        <div>
          <div className="bh-eyebrow mb-2">palette</div>
          <PaletteTiles selected={paletteKey} onSelect={setPaletteKey} />
        </div>

        <div>
          <div className="bh-eyebrow mb-2">metric</div>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as DistanceMetric)}
            className="w-full h-12 px-3 text-sm font-mono bg-[var(--bh-cream)] focus:outline-none focus-visible:ring-2"
            style={{ border: '1px solid var(--bh-ink)' }}
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
          <div className="font-mono text-[10px] leading-snug opacity-60 mt-2">
            the wordmark fringe above tracks this choice — crude metrics
            mis-register the print; deltaEok / deltaE2000 converge.
          </div>
        </div>
      </div>

      <div className="bh-rule" />

      {/* presets */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="bh-eyebrow">presets</span>
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            onClick={() => applyPreset(p)}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-[6px] hover:bg-[var(--bh-ink)] hover:text-[var(--bh-cream)] transition-colors"
            style={{ border: '1px solid var(--bh-ink)' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bh-rule" />

      {/* result — input / match / name */}
      <div className="grid md:grid-cols-[1fr_1fr_1.6fr] gap-6 items-end">
        <div>
          <div className="bh-eyebrow mb-2">scrubbed</div>
          <div
            className="aspect-[4/3]"
            style={{ backgroundColor: input, border: '1px solid var(--bh-ink)' }}
          />
          <code className="font-mono text-xs block mt-2">{input}</code>
        </div>

        <div>
          <div className="bh-eyebrow mb-2">nearest · {paletteKey}</div>
          <div
            className="aspect-[4/3]"
            style={{
              backgroundColor: matchedHex ?? 'transparent',
              border: '1px solid var(--bh-ink)',
            }}
          />
          <code className="font-mono text-xs block mt-2">{matchedHex ?? '—'}</code>
        </div>

        <div className="relative">
          <div className="bh-eyebrow mb-2" id="match-name-label">
            name
          </div>
          <div
            className="bh-caps break-words leading-[0.9]"
            role="status"
            aria-live="polite"
            aria-labelledby="match-name-label"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              fontFamily: "'Unbounded', sans-serif",
            }}
          >
            {matchedName ?? 'unknown'}
          </div>
          <div className="font-mono text-xs uppercase tracking-wider mt-3 opacity-70">
            via {METRIC_LABELS[metric]}
          </div>
        </div>
      </div>

      <LiveSnippet
        label="signal · identify"
        tintHex={matchedHex ?? input}
        {...buildIdentifySnippet({ input, paletteKey, metric, matchedName })}
        ariaLabel="live chromonym identify call for the current input"
      />
    </div>
  );
}
