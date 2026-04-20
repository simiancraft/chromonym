import {
  COLOR_FORMATS,
  type ColorFormat,
  type ColorInput,
  type Palette,
  convert,
  crayola,
  type DistanceMetric,
  identify,
  pantone,
  resolve,
  web,
  x11,
} from 'chromonym';
import { useEffect, useMemo, useState } from 'react';
import { ConvergenceStrip } from './components/ConvergenceStrip.js';
import { ConversionsScope } from './components/ConversionsScope.js';
import { CrossPaletteTranslator } from './components/CrossPaletteTranslator.js';
import { Eyedropper } from './components/Eyedropper.js';
import { KandinskyBYO } from './components/KandinskyBYO.js';
import { PaletteTiles } from './components/PaletteTiles.js';
import { StageGels } from './components/StageGels.js';
import { Wordmark } from './components/Wordmark.js';

const PALETTES = { web, x11, pantone, crayola } as const;
type PaletteKey = keyof typeof PALETTES;
const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

const BRAND_PRESETS: Array<{ label: string; hex: string }> = [
  { label: 'T-Mobile magenta', hex: '#E20074' },
  { label: 'Spotify green', hex: '#1DB954' },
  { label: 'Slack aubergine', hex: '#4A154B' },
  { label: 'Coca-Cola red', hex: '#E4002B' },
  { label: 'IBM blue', hex: '#0F62FE' },
  { label: 'Facebook blue', hex: '#1877F2' },
  { label: 'YouTube red', hex: '#FF0000' },
  { label: 'Stripe indigo', hex: '#635BFF' },
];

const BUILT_IN_PALETTES: ReadonlyArray<{ key: PaletteKey; label: string }> = [
  { key: 'web', label: 'CSS / SVG' },
  { key: 'x11', label: 'X11' },
  { key: 'pantone', label: 'Pantone' },
  { key: 'crayola', label: 'Crayola' },
];

const METRICS: DistanceMetric[] = [
  'euclidean-srgb',
  'euclidean-linear',
  'deltaE76',
  'deltaE94',
  'deltaE2000',
  'deltaEok',
];

const METRIC_LABELS: Record<DistanceMetric, string> = {
  'euclidean-srgb': 'Euclidean · sRGB (fastest)',
  'euclidean-linear': 'Euclidean · linear RGB',
  deltaE76: 'ΔE*76 · CIELAB',
  deltaE94: 'ΔE*94 · CIE 1994',
  deltaE2000: 'ΔE*00 · CIEDE2000',
  deltaEok: 'ΔE OKLAB · modern',
};

const warhammer = {
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

function readParams() {
  if (typeof window === 'undefined') {
    return {
      color: '#E20074',
      palette: 'pantone' as PaletteKey,
      metric: 'deltaE2000' as DistanceMetric,
    };
  }
  const p = new URLSearchParams(window.location.search);
  const color = p.get('c') ?? '#E20074';
  const palette = (p.get('cs') ?? 'pantone') as PaletteKey;
  const metric = (p.get('m') ?? 'deltaE2000') as DistanceMetric;
  return {
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#E20074',
    palette: (PALETTE_KEYS as string[]).includes(palette) ? palette : 'pantone',
    metric: (METRICS as string[]).includes(metric) ? metric : 'deltaE2000',
  };
}

const PRESETS: Array<{
  label: string;
  color: string;
  palette: PaletteKey;
  metric: DistanceMetric;
}> = [
  { label: 'T-Mobile magenta → Pantone', color: '#E20074', palette: 'pantone', metric: 'deltaE2000' },
  { label: 'Spotify green → Pantone', color: '#1DB954', palette: 'pantone', metric: 'deltaE2000' },
  { label: 'Facebook blue → Pantone', color: '#1877F2', palette: 'pantone', metric: 'deltaEok' },
  { label: 'Dodger blue → web', color: '#1E90FF', palette: 'web', metric: 'deltaE76' },
  { label: 'Blueviolet → X11 (ΔE76 picks differently)', color: '#8A2BE2', palette: 'x11', metric: 'deltaE76' },
];

export function App() {
  const initial = readParams();
  const [input, setInput] = useState(initial.color);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>(initial.palette);
  const [metric, setMetric] = useState<DistanceMetric>(initial.metric);

  const palette = PALETTES[paletteKey];

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('c', input);
    p.set('cs', paletteKey);
    p.set('m', metric);
    const qs = `?${p.toString()}`;
    if (window.location.search !== qs) {
      window.history.replaceState({}, '', `${window.location.pathname}${qs}`);
    }
  }, [input, paletteKey, metric]);

  // `identify(..., { k: 1 })` so we get both the name and its ΔE distance —
  // the distance feeds the ConvergenceStrip. Rank-0 match is the same value
  // a non-`k` call would return, so no semantic drift.
  const primary = useMemo(() => {
    const [best] = identify(input, { palette, metric, k: 1 });
    return best ?? null;
  }, [input, palette, metric]);

  const matchedName = primary?.name ?? null;
  const matchedHex = primary?.value ?? null;
  const matchedDistance = primary?.distance ?? null;

  // Secondary palette for the background triangle — if the user's current
  // palette is pantone, we show crayola's opinion; otherwise pantone. This
  // reinforces the "same color, many names" thesis passively.
  const secondaryKey: PaletteKey = paletteKey === 'pantone' ? 'crayola' : 'pantone';
  const secondary = useMemo(() => {
    const [best] = identify(input, { palette: PALETTES[secondaryKey], k: 1 });
    return best ?? null;
  }, [input, secondaryKey]);
  const secondaryHex = secondary?.value ?? null;

  const warhammerMatch = useMemo(
    () => identify(input, { palette: warhammer }),
    [input],
  );
  const warhammerHex = useMemo(() => {
    if (!warhammerMatch) return null;
    return resolve(warhammerMatch, { palette: warhammer }) as string | null;
  }, [warhammerMatch]);

  const conversions = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const fmt of COLOR_FORMATS) {
      try {
        out[fmt as ColorFormat] = convert(input as ColorInput, { format: fmt as ColorFormat });
      } catch (e) {
        out[fmt as ColorFormat] = `— error: ${(e as Error).message}`;
      }
    }
    return out;
  }, [input]);

  // Default gel colors are the Bauhaus primaries; they shift only when the
  // user actually has a match to display. When matchedHex is null (shouldn't
  // happen from the color picker, but defensive), the gel stays Bauhaus.
  const circleColor = input;
  const squareColor = matchedHex ?? '#ffd500';
  const triangleColor = secondaryHex ?? '#0038a8';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StageGels
        circleColor={circleColor}
        squareColor={squareColor}
        triangleColor={triangleColor}
      />
      <div className="grain" aria-hidden />

      <main className="relative mx-auto max-w-4xl px-6 md:px-10 py-10 md:py-14" style={{ zIndex: 10 }}>
        {/* ===== masthead ===== */}
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
                className="underline decoration-[2px] underline-offset-[6px] hover:text-[var(--bh-red)]"
              >
                github
              </a>
              <a
                href="https://www.npmjs.com/package/chromonym"
                className="underline decoration-[2px] underline-offset-[6px] hover:text-[var(--bh-red)]"
              >
                npm
              </a>
            </div>
          </div>
          <div className="bh-rule bh-rule-draw mt-2" />
        </header>

        {/* ===== hero · identifier ===== */}
        <section
          className="mt-10 relative"
          style={{
            backgroundColor: 'var(--bh-paper)',
            border: '1px solid var(--bh-ink)',
          }}
        >
          <header
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: 'var(--bh-ink)', color: 'var(--bh-cream)' }}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                chapter 01
              </span>
              <h2
                className="text-lg lowercase bh-caps"
                style={{ fontFamily: "'Unbounded', sans-serif" }}
              >
                identify
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
              color → name
            </span>
          </header>

          <div className="p-6 md:p-8 space-y-8">
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
                    style={{
                      border: '1px solid var(--bh-ink)',
                      padding: '0',
                    }}
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
                  onClick={() => {
                    setInput(p.color);
                    setPaletteKey(p.palette);
                    setMetric(p.metric);
                  }}
                  className="font-mono text-[11px] uppercase tracking-wider px-3 py-[6px] hover:bg-[var(--bh-ink)] hover:text-[var(--bh-cream)] transition-colors"
                  style={{ border: '1px solid var(--bh-ink)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* convergence strip */}
            <ConvergenceStrip distance={matchedDistance} metric={metric} />

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
          </div>
        </section>

        {/* ===== cross-palette (built-in) ===== */}
        <div className="mt-10">
          <CrossPaletteSection input={input} setInput={setInput} />
        </div>

        {/* ===== interactive translator ===== */}
        <div className="mt-10">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ backgroundColor: 'var(--bh-ink)', color: 'var(--bh-cream)' }}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                chapter 03
              </span>
              <h2 className="text-lg lowercase bh-caps" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                translate
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
              palette ↔ palette
            </span>
          </div>
          <div style={{ border: '1px solid var(--bh-ink)', borderTop: 0 }}>
            <CrossPaletteTranslator />
          </div>
        </div>

        {/* ===== eyedropper · pixel → name ===== */}
        <div className="mt-10">
          <div className="bh-rule-thick flex items-baseline justify-between pb-2">
            <span className="bh-eyebrow">apparatus · iv</span>
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
              pixel · eyedropper
            </span>
          </div>
          <div style={{ border: '1px solid var(--bh-ink)', borderTop: 0 }}>
            <Eyedropper />
          </div>
        </div>

        {/* ===== byo · kandinsky ===== */}
        <div className="mt-10">
          <KandinskyBYO
            input={input}
            matchedName={warhammerMatch}
            matchedHex={warhammerHex}
            colors={warhammer.colors}
          />
        </div>

        {/* ===== conversions · crt ===== */}
        <div className="mt-10">
          <ConversionsScope conversions={conversions} tintHex={input} />
        </div>

        <footer className="mt-14 pt-6 bh-rule space-y-3 text-center">
          <div className="bh-eyebrow">colophon</div>
          <div className="font-mono text-xs opacity-70 max-w-xl mx-auto leading-relaxed">
            shareable url — this page's query string updates live as you scrub.
            copy and send.
          </div>
          <div className="font-mono text-[10px] tracking-wider opacity-60 max-w-xl mx-auto leading-relaxed">
            Display type:{' '}
            <a
              href="https://www.dafont.com/bauhaus-modern.font"
              className="underline"
            >
              Bauhaus Modern
            </a>{' '}
            by Nils Kähler. Used with attribution.
          </div>
          <div className="font-mono text-[10px] tracking-wider opacity-60 max-w-xl mx-auto leading-relaxed">
            Pantone® is a registered trademark of Pantone LLC. Chromonym is not
            affiliated with Pantone; values are community approximations. See{' '}
            <a
              href="https://github.com/simiancraft/chromonym/blob/main/NOTICE.md"
              className="underline"
            >
              NOTICE.md
            </a>
            .
          </div>
        </footer>
      </main>
    </div>
  );
}

// Cross-palette translation: one color → nearest in all four built-in palettes.
// Restyled to fit the Bauhaus manual: black header bar, 4-column grid of
// primary-colored tiles with distance readouts in monospace.
function CrossPaletteSection({
  input,
  setInput,
}: {
  input: string;
  setInput: (hex: string) => void;
}) {
  const perPalette = useMemo(() => {
    return BUILT_IN_PALETTES.map(({ key, label }) => {
      const palette = PALETTES[key];
      const [best] = identify(input, { palette, k: 1 });
      if (!best) return { key, label, name: null, hex: null, distance: null };
      return { key, label, name: best.name, hex: best.value, distance: best.distance };
    });
  }, [input]);

  return (
    <section style={{ border: '1px solid var(--bh-ink)', backgroundColor: 'var(--bh-paper)' }}>
      <header
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: 'var(--bh-ink)', color: 'var(--bh-cream)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
            chapter 02
          </span>
          <h2 className="text-lg lowercase bh-caps" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            cross-palette
          </h2>
        </div>
        <span className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
          one color · four answers
        </span>
      </header>

      <div className="p-6 space-y-4">
        <p className="text-sm leading-snug max-w-2xl">
          each column runs{' '}
          <code className="font-mono text-xs px-1" style={{ backgroundColor: 'var(--bh-cream)' }}>
            identify(…, {'{ k: 1 }'})
          </code>{' '}
          against a different built-in palette. same input, different vocabulary.
          try a brand mark:
        </p>

        <div className="flex flex-wrap gap-2">
          {BRAND_PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => setInput(p.hex)}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider px-3 py-[6px] hover:bg-[var(--bh-ink)] hover:text-[var(--bh-cream)] transition-colors"
              style={{ border: '1px solid var(--bh-ink)' }}
            >
              <span
                className="w-3 h-3 shrink-0"
                style={{ backgroundColor: p.hex, border: '1px solid var(--bh-ink)' }}
                aria-hidden
              />
              {p.label}
            </button>
          ))}
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[1px]"
          style={{ backgroundColor: 'var(--bh-ink)', border: '1px solid var(--bh-ink)' }}
        >
          {perPalette.map(({ key, label, name, hex, distance }) => (
            <div
              key={key}
              className="flex flex-col"
              style={{ backgroundColor: 'var(--bh-cream)' }}
            >
              <div
                className="h-20"
                style={{ backgroundColor: hex ?? 'transparent' }}
                aria-label={`${label} nearest-match swatch`}
              />
              <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <div className="bh-eyebrow opacity-70">{label}</div>
                  <div className="text-sm font-mono mt-1 break-words leading-tight">
                    {name ?? '—'}
                  </div>
                </div>
                <div className="font-mono text-[10px] opacity-60 pt-2 flex items-center justify-between">
                  <code>{hex ?? '—'}</code>
                  {distance !== null && <span>ΔE {distance.toFixed(2)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
