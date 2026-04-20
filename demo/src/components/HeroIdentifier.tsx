// Combined identify panel — the above-the-fold demo. Two input modalities
// (color picker + image-canvas eyedropper) feed the same shared `input`
// state; last-in wins. Shared palette tiles (row) + metric selector drive
// the identify call; the output is a full-width scrubbed/nearest/BIG NAME
// row plus one LiveSnippet for the act.
//
// Before this consolidation, scrub and eyedropper were separate demos
// doing the same thing (color → name) through different input UIs. Merging
// them puts both inputs side-by-side and gives the user one canonical
// identify interaction with two ways to drive it.

import type { DistanceMetric } from 'chromonym';
import { type Preset, PRESETS } from '../data/presets.js';
import { METRICS, METRIC_LABELS } from '../lib/metrics.js';
import { buildIdentifySnippet } from '../lib/snippets.js';
import { Eyedropper } from './Eyedropper.js';
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
  elapsedMs: number;
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
  elapsedMs,
}: HeroIdentifierProps) {
  return (
    <div
      className="p-5 md:p-6 space-y-6"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      {/* ── Inputs: color picker · eyedropper canvas (last-in wins) ── */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        <div>
          <div className="bh-eyebrow mb-2">scrub</div>
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
          <div className="bh-eyebrow mb-2">pixel · from image</div>
          <Eyedropper onPick={setInput} />
        </div>
      </div>

      {/* ── Palette tiles (row) + metric ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6 items-start">
        <div>
          <div className="bh-eyebrow mb-2">palette</div>
          <PaletteTiles selected={paletteKey} onSelect={setPaletteKey} layout="row" />
        </div>
        <div>
          <div className="bh-eyebrow mb-2">metric</div>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as DistanceMetric)}
            className="w-full h-10 px-2 text-sm font-mono"
            style={{
              border: '1px solid var(--bh-ink)',
              backgroundColor: 'var(--bh-cream)',
            }}
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

      {/* ── Presets ── */}
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

      {/* ── Output row (full width): scrubbed · nearest · BIG NAME ── */}
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
            className="break-words leading-[0.9] font-semibold lowercase tracking-[-0.02em]"
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
          <div className="font-mono text-xs uppercase tracking-wider mt-3 opacity-70 flex flex-wrap gap-x-3">
            <span>via {METRIC_LABELS[metric]}</span>
            <span>·</span>
            <span>
              lookup{' '}
              <span className="opacity-100">
                {elapsedMs < 0.01 ? '<0.01' : elapsedMs.toFixed(2)} ms
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── One snippet for the whole act ── */}
      <LiveSnippet
        label="signal · identify"
        tintHex={matchedHex ?? input}
        {...buildIdentifySnippet({ input, paletteKey, metric, matchedName })}
        ariaLabel="live chromonym identify call for the current input"
      />
    </div>
  );
}
