// Side-by-side palette translator. Pick a color on either side, see the
// nearest-k matches on the other. Strategy and k are live-tunable so the
// user can watch how metric choice swings results in edge regions (ΔE76 vs
// ΔE2000 in saturated blues, for example).

import { type DistanceMetric, identify } from 'chromonym';
import { useMemo, useState } from 'react';
import { LiveSnippet } from './LiveSnippet.js';
import { PaletteGrid, PALETTES, type PaletteKey } from './PaletteGrid.js';

const METRICS: readonly DistanceMetric[] = [
  'euclidean-srgb',
  'euclidean-linear',
  'deltaE76',
  'deltaE94',
  'deltaE2000',
  'deltaEok',
];

const METRIC_LABELS: Record<DistanceMetric, string> = {
  'euclidean-srgb': 'Euclidean (sRGB) — fastest',
  'euclidean-linear': 'Euclidean (linear RGB)',
  deltaE76: 'ΔE*76',
  deltaE94: 'ΔE*94',
  deltaE2000: 'ΔE*00 (CIEDE2000)',
  deltaEok: 'ΔE OKLAB',
};

type Side = 'left' | 'right';

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

  const { matches, elapsedMs } = useMemo(() => {
    if (!srcSelected)
      return { matches: [] as Array<{ name: string; value: string; distance: number }>, elapsedMs: 0 };
    const t0 = performance.now();
    const m = identify(srcSelected, {
      source: PALETTES[srcPaletteKey],
      palette: PALETTES[dstPaletteKey],
      metric,
      k,
    });
    const t1 = performance.now();
    return { matches: m, elapsedMs: t1 - t0 };
  }, [srcPaletteKey, dstPaletteKey, srcSelected, metric, k]);

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

  // Color hexes for the arrow gradient.
  const leftHex =
    leftShownSelected != null
      ? (PALETTES[leftPalette].colors as Record<string, string>)[leftShownSelected] ?? '#cccccc'
      : '#cccccc';
  const rightHex =
    rightShownSelected != null
      ? (PALETTES[rightPalette].colors as Record<string, string>)[rightShownSelected] ?? '#cccccc'
      : '#cccccc';

  const onLeftPaletteChange = (key: PaletteKey) => {
    setLeftPalette(key);
    const first = Object.keys(PALETTES[key].colors)[0] ?? null;
    setLeftSelected(first);
    setLastEdited('left');
  };
  const onRightPaletteChange = (key: PaletteKey) => {
    setRightPalette(key);
    const first = Object.keys(PALETTES[key].colors)[0] ?? null;
    setRightSelected(first);
    setLastEdited('right');
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-neutral-200">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Palette-to-palette translator</h2>
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            interactive
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">
          Click any swatch on either side — the top-{k} nearest matches highlight on the other.
          Switch metrics to see which ΔE formulation picks different neighbours (ΔE76 and ΔE2000
          can disagree hard in saturated blue/purple regions).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
        <PaletteGrid
          ariaLabel="left"
          paletteKey={leftPalette}
          onPaletteChange={onLeftPaletteChange}
          selectedName={leftShownSelected}
          onSelect={(name) => {
            setLeftSelected(name);
            setLastEdited('left');
          }}
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
          onSelect={(name) => {
            setRightSelected(name);
            setLastEdited('right');
          }}
          highlightedNames={rightShownHighlights}
          highlightRanks={rightShownRanks}
        />
      </div>

      <TranslatorSnippet
        srcPalette={srcPaletteKey}
        dstPalette={dstPaletteKey}
        srcSelected={srcSelected}
        metric={metric}
        k={k}
        matches={matches}
      />

      <p className="text-xs text-neutral-500 italic pt-1">
        Blue ring = the color you picked. Amber rings = top-{k} nearest matches ranked by the
        chosen metric (thicker ring = closer).
      </p>
    </section>
  );
}

interface TranslatorSnippetProps {
  srcPalette: PaletteKey;
  dstPalette: PaletteKey;
  srcSelected: string | null;
  metric: DistanceMetric;
  k: number;
  matches: ReadonlyArray<{ name: string; value: string; distance: number }>;
}

// Translator-flavored call — builds a display + copy text pair and hands
// them to the generic LiveSnippet. The pair split means the `// → [...]`
// comment is visible but not part of what the copy button sends.
function TranslatorSnippet({
  srcPalette,
  dstPalette,
  srcSelected,
  metric,
  k,
  matches,
}: TranslatorSnippetProps) {
  const shown = Math.min(matches.length, 3);
  const resultLines = matches.slice(0, shown).map(
    (m) => `//     { name: '${m.name}', value: '${m.value}', distance: ${m.distance.toFixed(3)} },`,
  );
  if (matches.length > shown) resultLines.push('//     // …');

  const codeLines = [
    `import { identify, ${srcPalette}, ${dstPalette} } from 'chromonym';`,
    ``,
    `identify(${srcSelected ? `'${srcSelected}'` : '/* pick a swatch */'}, {`,
    `  source:  ${srcPalette},`,
    `  palette: ${dstPalette},`,
    `  metric:  '${metric}',`,
    `  k:       ${k},`,
    `})`,
  ];
  const resultBlock = matches.length > 0 ? ['// → [', ...resultLines, '// ]'] : [];
  const displayText = [...codeLines, ...resultBlock].join('\n');
  const copyText = codeLines.join('\n');

  return (
    <LiveSnippet
      displayText={displayText}
      copyText={copyText}
      label="signal · translate"
      tintHex={matches[0]?.value}
      ariaLabel="live chromonym call for the current selection"
    />
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
          <span className="text-xs uppercase tracking-wide text-neutral-500">metric</span>
          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value as DistanceMetric)}
            className="w-full h-10 rounded border border-neutral-300 px-2 mt-1 bg-white text-sm"
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            k: {k} nearest
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={k}
            onChange={(e) => onKChange(Number(e.target.value))}
            className="w-full mt-1 accent-indigo-600"
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
        <div className="text-xs text-neutral-500">
          lookup:{' '}
          <span className="font-mono text-neutral-800">
            {elapsedMs < 0.01 ? '<0.01' : elapsedMs.toFixed(2)} ms
          </span>
        </div>
        {matches[0] && (
          <div className="text-xs text-neutral-500">
            nearest distance:{' '}
            <span className="font-mono text-neutral-800">{matches[0].distance.toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
