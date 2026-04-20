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
import { LiveSnippet } from './components/LiveSnippet.js';
import { PaletteTiles } from './components/PaletteTiles.js';
import { StageGels } from './components/StageGels.js';
import { Wordmark } from './components/Wordmark.js';

const PALETTES = { web, x11, pantone, crayola } as const;
type PaletteKey = keyof typeof PALETTES;
const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

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

  // `identify(..., { k: 1 })` so we get both the name and its distance.
  // Rank-0 matches the value a non-`k` call would return — no semantic drift.
  const primary = useMemo(() => {
    const [best] = identify(input, { palette, metric, k: 1 });
    return best ?? null;
  }, [input, palette, metric]);

  const matchedName = primary?.name ?? null;
  const matchedHex = primary?.value ?? null;

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

        {/* ===== act 01 · IDENTIFY — hero identifier ===== */}
        <div className="mt-12">
          <ActHeader act="act 01" title="identify" kicker="color → name" />
        </div>

        <section
          className="mt-4 relative"
          style={{
            backgroundColor: 'var(--bh-paper)',
            border: '1px solid var(--bh-ink)',
          }}
        >
          <SubChapterHeader eyebrow="identify" title="scrub" kicker="color picker" inline />

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
              displayText={[
                `import { identify, ${paletteKey} } from 'chromonym';`,
                ``,
                `identify('${input}', {`,
                `  palette: ${paletteKey},`,
                `  metric:  '${metric}',`,
                `})`,
                `// → ${matchedName ? `'${matchedName}'` : 'null'}`,
              ].join('\n')}
              copyText={[
                `import { identify, ${paletteKey} } from 'chromonym';`,
                ``,
                `identify('${input}', { palette: ${paletteKey}, metric: '${metric}' });`,
              ].join('\n')}
              ariaLabel="live chromonym identify call for the current input"
            />
          </div>
        </section>

        {/* ===== identify · translate (palette ↔ palette) ===== */}
        <div className="mt-10">
          <SubChapterHeader eyebrow="identify · cont." title="translate" kicker="palette ↔ palette" />
          <div style={{ border: '1px solid var(--bh-ink)', borderTop: 0 }}>
            <CrossPaletteTranslator />
          </div>
        </div>

        {/* ===== identify · eyedropper (pixel → name) ===== */}
        <div className="mt-10">
          <SubChapterHeader eyebrow="identify · cont." title="eyedropper" kicker="pixel → name" />
          <div style={{ border: '1px solid var(--bh-ink)', borderTop: 0 }}>
            <Eyedropper onPick={setInput} />
          </div>
        </div>

        {/* ===== divider: RGB channels of current input ===== */}
        <div className="mt-12">
          <ConvergenceStrip hex={input} />
        </div>

        {/* ===== act 02 · RESOLVE ===== */}
        <div className="mt-12">
          <ActHeader act="act 02" title="resolve" kicker="name → color" />
          <div className="mt-4">
            <KandinskyBYO
              input={input}
              matchedName={warhammerMatch}
              matchedHex={warhammerHex}
              colors={warhammer.colors}
            />
          </div>
        </div>

        {/* ===== act 03 · CONVERT ===== */}
        <div className="mt-12">
          <ActHeader act="act 03" title="convert" kicker="format ↔ format" />
          <div className="mt-4">
            <ConversionsScope conversions={conversions} tintHex={input} input={input} />
          </div>
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

// ---- Section markers ----------------------------------------------------
// Three "acts" structure the page into identify → resolve → convert. Sub-
// chapters live inside each act when a verb has multiple demos (identify
// has three: hero, translator, eyedropper). Both headers share the same
// Bauhaus treatment so the hierarchy reads by weight, not by novelty.

function ActHeader({
  act,
  title,
  kicker,
}: {
  act: string;
  title: string;
  kicker: string;
}) {
  return (
    <div
      className="flex items-end justify-between gap-4 pb-3"
      style={{ borderBottom: '3px solid var(--bh-ink)' }}
    >
      <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
        <span className="bh-eyebrow">{act}</span>
        <h2
          className="lowercase bh-caps leading-none"
          style={{
            fontFamily: "'Bauhaus Modern', 'Unbounded', sans-serif",
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
          }}
        >
          {title}
        </h2>
      </div>
      <span className="bh-eyebrow text-right shrink-0">{kicker}</span>
    </div>
  );
}

function SubChapterHeader({
  eyebrow,
  title,
  kicker,
  inline = false,
}: {
  eyebrow: string;
  title: string;
  kicker: string;
  inline?: boolean;
}) {
  // `inline` renders the header as the top bar *inside* a bordered section
  // (matches the hero identifier look). Otherwise it renders as a stand-
  // alone bar sitting above a bordered-bottom card (translator / eyedropper).
  return (
    <header
      className={`flex items-center justify-between px-5 py-3 ${inline ? '' : ''}`}
      style={{ backgroundColor: 'var(--bh-ink)', color: 'var(--bh-cream)' }}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
          {eyebrow}
        </span>
        <h3
          className="text-lg lowercase bh-caps"
          style={{ fontFamily: "'Bauhaus Modern', 'Unbounded', sans-serif" }}
        >
          {title}
        </h3>
      </div>
      <span className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
        {kicker}
      </span>
    </header>
  );
}
