// Side-by-side palette translator. Pick a color on either side, see the
// nearest-k matches on the other. Strategy and k are live-tunable so the
// user can watch how metric choice swings results in edge regions (ΔE76 vs
// ΔE2000 in saturated blues, for example).

import { type DistanceMetric, identify } from 'chromonym';
// React Compiler (see demo/vite.config.ts) auto-memoizes the identify
// call, derived arrays, and inline callbacks below.
import { useState } from 'react';
import { METRICS, METRIC_LABELS } from '../lib/metrics.js';
import { buildTranslateSnippet } from '../lib/snippets.js';
import { LiveSnippet } from './LiveSnippet.js';
import { PaletteGrid, PALETTES, type PaletteKey } from './PaletteGrid.js';

type Side = 'left' | 'right';

// Safe palette-entry lookup: the caller passes any string; we return the
// stored hex or `undefined`. Keeps `PALETTES[k].colors` typed with its
// literal name union at the source while tolerating unknown keys here.
function colorAt(paletteKey: PaletteKey, name: string | null): string | undefined {
  if (name == null) return undefined;
  const colors = PALETTES[paletteKey].colors as Readonly<Record<string, string>>;
  return colors[name];
}

export function CrossPaletteTranslator() {
  const [leftPalette, setLeftPalette] = useState<PaletteKey>('crayola');
  const [rightPalette, setRightPalette] = useState<PaletteKey>('web');
  const [leftSelected, setLeftSelected] = useState<string | null>(
    () => Object.keys(PALETTES.crayola.colors)[0] ?? null,
  );
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  const [metric, setMetric] = useState<DistanceMetric>('deltaE2000');
  const [k, setK] = useState(3);
  const [lastEdited, setLastEdited] = useState<Side>('left');

  // The authoritative "source" is whichever side was edited most recently.
  // The other side is computed — its top-k nearest matches are highlighted,
  // and the rank-0 match also becomes that side's `selected`.
  const srcPaletteKey = lastEdited === 'left' ? leftPalette : rightPalette;
  const dstPaletteKey = lastEdited === 'left' ? rightPalette : leftPalette;
  const srcSelected = lastEdited === 'left' ? leftSelected : rightSelected;

  let matches: Array<{ name: string; value: string; distance: number }> = [];
  let elapsedMs = 0;
  if (srcSelected) {
    const t0 = performance.now();
    matches = identify(srcSelected, {
      source: PALETTES[srcPaletteKey],
      palette: PALETTES[dstPaletteKey],
      metric,
      k,
    });
    elapsedMs = performance.now() - t0;
  }

  const highlightedNames = matches.map((m) => m.name);
  const highlightRanks = new Map(matches.map((m, i) => [m.name, i] as const));

  // The "selected" on the computed side is the rank-0 match.
  const computedSelected = matches[0]?.name ?? null;

  const leftShownSelected = lastEdited === 'left' ? leftSelected : computedSelected;
  const rightShownSelected = lastEdited === 'right' ? rightSelected : computedSelected;

  const leftShownHighlights = lastEdited === 'right' ? highlightedNames : undefined;
  const rightShownHighlights = lastEdited === 'left' ? highlightedNames : undefined;

  const leftShownRanks = lastEdited === 'right' ? highlightRanks : undefined;
  const rightShownRanks = lastEdited === 'left' ? highlightRanks : undefined;

  // Color hexes for the arrow gradient. `colorAt` normalizes the per-palette
  // literal-name-union lookup into a string → string | undefined shape, so
  // the nullish-coalesce fallback does real work without a cast at each site.
  const leftHex = colorAt(leftPalette, leftShownSelected) ?? '#cccccc';
  const rightHex = colorAt(rightPalette, rightShownSelected) ?? '#cccccc';

  // React Compiler keeps these callback references stable across
  // renders so PaletteGrid's auto-memoized Swatch doesn't re-render
  // all 907 pantone buttons on every parent tick.
  const onLeftPaletteChange = (key: PaletteKey) => {
    setLeftPalette(key);
    setLeftSelected(Object.keys(PALETTES[key].colors)[0] ?? null);
    setLastEdited('left');
  };
  const onRightPaletteChange = (key: PaletteKey) => {
    setRightPalette(key);
    setRightSelected(Object.keys(PALETTES[key].colors)[0] ?? null);
    setLastEdited('right');
  };
  const onLeftSelect = (name: string) => {
    setLeftSelected(name);
    setLastEdited('left');
  };
  const onRightSelect = (name: string) => {
    setRightSelected(name);
    setLastEdited('right');
  };

  return (
    <div
      className="p-5 md:p-6 space-y-4"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      <div>
        <div className="bh-eyebrow mb-2">click any swatch on either side</div>
        <p className="text-xs leading-snug opacity-80 max-w-2xl">
          The top-{k} nearest matches highlight on the other. Switch metrics
          to see where ΔE76 and ΔE2000 disagree; usually in saturated blue
          and purple.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
        <PaletteGrid
          ariaLabel="left"
          paletteKey={leftPalette}
          onPaletteChange={onLeftPaletteChange}
          selectedName={leftShownSelected}
          onSelect={onLeftSelect}
          highlightedNames={leftShownHighlights}
          highlightRanks={leftShownRanks}
        />

        <ArrowColumn
          leftHex={leftHex}
          rightHex={rightHex}
          metric={metric}
          onMetricChange={setMetric}
          k={k}
          onKChange={setK}
          elapsedMs={elapsedMs}
          matches={matches}
        />

        <PaletteGrid
          ariaLabel="right"
          paletteKey={rightPalette}
          onPaletteChange={onRightPaletteChange}
          selectedName={rightShownSelected}
          onSelect={onRightSelect}
          highlightedNames={rightShownHighlights}
          highlightRanks={rightShownRanks}
        />
      </div>

      <LiveSnippet
        label="signal · translate"
        tintHex={matches[0]?.value}
        {...buildTranslateSnippet({
          srcPalette: srcPaletteKey,
          dstPalette: dstPaletteKey,
          srcSelected,
          metric,
          k,
          matches,
        })}
        ariaLabel="live chromonym call for the current selection"
      />

    </div>
  );
}


interface ArrowColumnProps {
  leftHex: string;
  rightHex: string;
  metric: DistanceMetric;
  onMetricChange: (m: DistanceMetric) => void;
  k: number;
  onKChange: (k: number) => void;
  elapsedMs: number;
  matches: ReadonlyArray<{ name: string; value: string; distance: number }>;
}

function ArrowColumn({
  leftHex,
  rightHex,
  metric,
  onMetricChange,
  k,
  onKChange,
  elapsedMs,
  matches,
}: ArrowColumnProps) {
  const gradId = `cross-palette-arrow-grad`;
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 md:w-56 md:min-w-[14rem]">
      <div className="space-y-2">
        <label className="block">
          <span className="bh-eyebrow">metric</span>
          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value as DistanceMetric)}
            className="w-full h-10 px-2 mt-1 text-sm font-mono"
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
        </label>

        <label className="block">
          <span className="bh-eyebrow">k: {k} nearest</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={k}
            onChange={(e) => onKChange(Number(e.target.value))}
            className="w-full mt-1"
            style={{ accentColor: 'var(--bh-red)' }}
            aria-label={`top-k matches, currently ${k}`}
          />
        </label>
      </div>

      <div className="flex-1 flex items-center justify-center py-2">
        <svg
          viewBox="0 0 200 40"
          className="w-full h-12 md:h-16"
          role="img"
          aria-label={`gradient arrow from ${leftHex} to ${rightHex}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={leftHex} />
              <stop offset="100%" stopColor={rightHex} />
            </linearGradient>
          </defs>
          {/* Left arrow head (points left) */}
          <polygon points="0,20 20,8 20,32" fill={leftHex} />
          {/* Gradient bar body */}
          <rect x="18" y="12" width="164" height="16" fill={`url(#${gradId})`} rx="2" />
          {/* Right arrow head (points right) */}
          <polygon points="200,20 180,8 180,32" fill={rightHex} />
        </svg>
      </div>

      <div className="text-center space-y-1">
        <div className="text-xs font-mono opacity-60">
          lookup:{' '}
          <span className="opacity-100">
            {elapsedMs < 0.01 ? '<0.01' : elapsedMs.toFixed(2)} ms
          </span>
        </div>
        {matches[0] && (
          <div className="text-xs font-mono opacity-60">
            nearest distance:{' '}
            <span className="opacity-100">{matches[0].distance.toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
