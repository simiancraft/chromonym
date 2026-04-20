// Combined identify panel — the above-the-fold demo. Two input modalities
// (image eyedropper + color picker) feed the same shared `input` state;
// last-in wins.
//
// Layout (third-based):
//
//   ┌──────────────────────────────────┬──────────────┐
//   │  source · [preset buttons]       │  scrub       │
//   │                                  │  [picker]    │
//   │  [canvas……………………………………………]       ├──────────────┤
//   │                                  │  value       │
//   │                                  │  hex · rgb · │
//   │                                  │  hsl         │
//   │  hover / pinned readout          ├──────────────┤
//   │                                  │  presets     │
//   │                                  │  [stacked]   │
//   └──────────────────────────────────┴──────────────┘
//
// Below the inputs: metric (left) + palette tiles row (right).
// Below that: scrubbed · nearest · BIG NAME output row + LiveSnippet.

import type { DistanceMetric } from 'chromonym';
import { type Preset, PRESETS } from '../data/presets.js';
import { METRICS, METRIC_DESCRIPTIONS, METRIC_LABELS } from '../lib/metrics.js';
import { buildIdentifySnippet } from '../lib/snippets.js';
import { Eyedropper } from './Eyedropper.js';
import { LiveSnippet } from './LiveSnippet.js';
import { PALETTE_LABELS, type PaletteKey } from './PaletteGrid.js';
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
  /** `convert()` output for every format keyed by ColorFormat — used for
   *  the live hex · rgb · hsl readout in the "value" section. */
  conversions: Readonly<Record<string, unknown>>;
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
  conversions,
}: HeroIdentifierProps) {
  const hex = typeof conversions.HEX === 'string' ? conversions.HEX : input;
  const rgb = typeof conversions.RGB === 'string' ? conversions.RGB : '—';
  const hsl = typeof conversions.HSL === 'string' ? conversions.HSL : '—';

  return (
    <div
      className="p-5 md:p-6 space-y-6"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      {/* ── Inputs: left 2/3 image eyedropper · right 1/3 scrub+value+presets ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2">
          <Eyedropper onPick={setInput} />
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <div>
            <div className="bh-eyebrow mb-2">scrub</div>
            <label className="block">
              <input
                type="color"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-[72px] cursor-pointer appearance-none"
                style={{ border: '1px solid var(--bh-ink)', padding: 0 }}
                aria-label="color picker"
              />
            </label>
          </div>

          <div>
            <div className="bh-eyebrow mb-2">value</div>
            <div
              className="grid grid-cols-1 gap-1 px-2 py-2 font-mono text-[10px] leading-snug"
              style={{
                border: '1px solid var(--bh-ink)',
                backgroundColor: 'var(--bh-cream)',
              }}
            >
              <div className="flex gap-2 items-baseline">
                <span className="opacity-50 text-[9px] tracking-[0.2em] uppercase shrink-0 w-8">
                  hex
                </span>
                <code className="truncate">{hex.toLowerCase()}</code>
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="opacity-50 text-[9px] tracking-[0.2em] uppercase shrink-0 w-8">
                  rgb
                </span>
                <code className="truncate">{rgb}</code>
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="opacity-50 text-[9px] tracking-[0.2em] uppercase shrink-0 w-8">
                  hsl
                </span>
                <code className="truncate">{hsl}</code>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="bh-eyebrow mb-1">presets</div>
            <div className="flex flex-col gap-[3px]">
              {PRESETS.map((p) => (
                <PresetButton key={p.name} preset={p} onApply={applyPreset} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls: metric (left) + palette tiles row (right) ── */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
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
          <div className="font-mono text-[10px] leading-snug opacity-70 mt-2">
            {METRIC_DESCRIPTIONS[metric]}
          </div>
        </div>
        <div>
          <div className="bh-eyebrow mb-2">palette</div>
          <PaletteTiles selected={paletteKey} onSelect={setPaletteKey} layout="row" />
        </div>
      </div>

      <div className="bh-rule" />

      {/* ── Output row (full width): scrubbed · nearest · BIG NAME ── */}
      <div className="grid md:grid-cols-[1fr_1fr_1.6fr] gap-6 items-end">
        <div>
          <div className="bh-eyebrow mb-2">selected</div>
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

      <LiveSnippet
        label="signal · identify"
        tintHex={matchedHex ?? input}
        {...buildIdentifySnippet({ input, paletteKey, metric, matchedName })}
        ariaLabel="live chromonym identify call for the current input"
      />
    </div>
  );
}

// Hierarchical preset button: brand name as the headline, palette name as a
// quieter subline. Stackable so PRESETS can live as a vertical column under
// the picker instead of wrapping wide across the full row.
function PresetButton({
  preset,
  onApply,
}: {
  preset: Preset;
  onApply: (p: Preset) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onApply(preset)}
      className="flex items-center gap-2 text-left px-2 py-[6px] transition-colors hover:bg-[var(--bh-ink)] hover:text-[var(--bh-cream)] group"
      style={{ border: '1px solid var(--bh-ink)' }}
    >
      <span
        className="w-3 h-3 shrink-0"
        style={{ backgroundColor: preset.color, border: '1px solid var(--bh-ink)' }}
        aria-hidden
      />
      <span className="flex flex-col leading-none min-w-0">
        <span className="text-[11px] font-semibold tracking-tight uppercase truncate">
          {preset.name}
        </span>
        <span className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-60 group-hover:opacity-80 mt-[2px]">
          {PALETTE_LABELS[preset.palette]}
        </span>
      </span>
    </button>
  );
}
