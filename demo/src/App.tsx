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
import bannerUrl from '../../.github/assets/banner.png';

const PALETTES = { web, x11, pantone, crayola } as const;
type PaletteKey = keyof typeof PALETTES;
const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

// Brand hex presets for the "translate this color" section. Each is a
// widely-recognizable brand mark; the demo shows how it lands in all
// four built-in palettes at once.
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
  'euclidean-srgb': 'Euclidean (sRGB) — fastest, non-perceptual',
  'euclidean-linear': 'Euclidean (linear RGB)',
  deltaE76: 'ΔE*76 — CIELAB Euclidean',
  deltaE94: 'ΔE*94 — CIE 1994',
  deltaE2000: 'ΔE*00 / CIEDE2000 — industry standard',
  deltaEok: 'ΔE OKLAB — modern, perceptually uniform',
};

// Warhammer 40k–flavored BYO palette. Defined inline in the demo source —
// passed straight to `identify`/`resolve` without registering anything.
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

// Read initial state from the URL so shared links reproduce the demo state.
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

  // Write state to URL on every change (replaceState — don't pollute history).
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

  const matchedName = useMemo(
    () => identify(input, { palette, metric }),
    [input, palette, metric],
  );

  const matchedHex = useMemo(() => {
    if (!matchedName) return null;
    return resolve(matchedName, { palette }) as string | null;
  }, [matchedName, palette]);

  // `warhammer` is module-scope const — included in deps for hygiene in case
  // it's ever lifted into state.
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <header className="text-center space-y-3">
          <img src={bannerUrl} alt="chromonym" className="mx-auto w-full max-w-xl" />
          <p className="text-neutral-600">
            Tree-shakeable color naming for TypeScript. Scrub a color — see the nearest name across
            four built-in palettes, with your choice of perceptual distance metric.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <a href="https://github.com/simiancraft/chromonym" className="text-blue-600 hover:underline">
              GitHub →
            </a>
            <span className="text-neutral-300">·</span>
            <a href="https://www.npmjs.com/package/chromonym" className="text-blue-600 hover:underline">
              npm
            </a>
          </div>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">color</span>
              <input
                type="color"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-12 rounded border border-neutral-300 cursor-pointer mt-1"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">palette</span>
              <select
                value={paletteKey}
                onChange={(e) => setPaletteKey(e.target.value as PaletteKey)}
                className="w-full h-12 rounded border border-neutral-300 px-3 mt-1"
              >
                {PALETTE_KEYS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">distance metric</span>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as DistanceMetric)}
                className="w-full h-12 rounded border border-neutral-300 px-3 mt-1"
              >
                {METRICS.map((m) => (
                  <option key={m} value={m}>
                    {METRIC_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs uppercase tracking-wide text-neutral-500 self-center mr-1">
              try:
            </span>
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => {
                  setInput(p.color);
                  setPaletteKey(p.palette);
                  setMetric(p.metric);
                }}
                className="text-xs px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-neutral-500">input</div>
              <div
                className="h-32 rounded-lg border border-neutral-300 mt-1"
                style={{ backgroundColor: input }}
              />
              <code className="text-sm text-neutral-600 mt-1 block">{input}</code>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-neutral-500">nearest match</div>
              <div
                className="h-32 rounded-lg border border-neutral-300 mt-1"
                style={{ backgroundColor: matchedHex ?? 'transparent' }}
              />
              <code className="text-sm text-neutral-600 mt-1 block">{matchedHex ?? '—'}</code>
            </div>
          </div>

          <div className="text-center pt-2">
            <div className="text-xs uppercase tracking-wide text-neutral-500" id="match-name-label">
              name
            </div>
            <div
              className="text-5xl font-mono font-semibold pt-1"
              role="status"
              aria-live="polite"
              aria-labelledby="match-name-label"
            >
              {matchedName ?? 'unknown'}
            </div>
          </div>
        </section>

        <CrossPaletteSection input={input} setInput={setInput} />

        <section className="bg-amber-50/60 rounded-xl shadow-sm p-6 space-y-4 border-2 border-dashed border-amber-300">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Bring your own palette</h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                user-supplied
              </span>
            </div>
            <p className="text-sm text-neutral-700 mt-1">
              Any object matching <code className="text-xs bg-white/70 px-1 rounded">Palette&lt;Name&gt;</code>{' '}
              works. This 6-color palette is defined inline in the demo source and passed straight to
              <code className="text-xs bg-white/70 px-1 rounded mx-1">identify</code>— no
              registration, full type inference.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(warhammer.colors).map(([key, hex]) => (
              <div key={key} className="text-center">
                <div
                  className="h-14 rounded border border-neutral-300"
                  style={{ backgroundColor: hex }}
                />
                <div className="text-xs text-neutral-700 mt-1 break-words leading-tight">
                  {key}
                </div>
                <code className="text-[10px] text-neutral-500">{hex}</code>
              </div>
            ))}
          </div>

          <pre className="text-xs font-mono bg-white/70 border border-amber-200 rounded p-3 overflow-x-auto">
{`const warhammer = {
  name: 'warhammer40k',
  colors: {
    'world eaters red': '#8b1a1a',
    'adeptus red': '#652022',
    'sons of malice white': '#e8e4d8',
    'the flawless host purple': '#6b2d7d',
    'nurgle green': '#748c3f',
    'alpha legion teal': '#2a6d7a',
  },
  normalize: (s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
  defaultMetric: 'deltaE2000',
} as const satisfies Palette;

identify(${JSON.stringify(input)}, { palette: warhammer })
// → ${JSON.stringify(warhammerMatch)}`}
          </pre>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-neutral-500">your input</div>
              <div
                className="h-20 rounded-lg border border-neutral-300 mt-1"
                style={{ backgroundColor: input }}
              />
              <code className="text-sm text-neutral-600 mt-1 block">{input}</code>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-neutral-500">warhammer match</div>
              <div
                className="h-20 rounded-lg border border-neutral-300 mt-1"
                style={{ backgroundColor: warhammerHex ?? 'transparent' }}
              />
              <code className="text-sm text-neutral-600 mt-1 block">{warhammerMatch ?? '—'}</code>
            </div>
          </div>

          <div className="text-center text-xs italic text-neutral-500 pt-1">
            For the glory of the Omnissiah.
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">conversions</div>
          <pre className="text-sm font-mono text-neutral-800 overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(conversions, null, 2)}
          </pre>
        </section>

        <footer className="text-center text-xs text-neutral-500 pt-4 space-y-1">
          <div>
            Shareable link — this demo's URL updates as you scrub. Copy and send.
          </div>
          <div>
            Pantone® is a registered trademark of Pantone LLC. Chromonym is not affiliated with
            Pantone; values are community approximations. See{' '}
            <a
              href="https://github.com/simiancraft/chromonym/blob/main/NOTICE.md"
              className="underline"
            >
              NOTICE.md
            </a>
            .
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- Cross-palette translation: one color → nearest in all four palettes ---
// Uses `identify` with `k: 1` to pull the single best match in each built-in
// palette along with its ΔE distance to the input, so users can see at a
// glance how faithful each representation is.
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
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-neutral-200">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Translate this color across every palette</h2>
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
            cross-palette
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">
          Same input, four answers. Each column runs{' '}
          <code className="text-xs bg-neutral-100 px-1 rounded">identify(…, {'{ k: 1 }'})</code>{' '}
          against a different built-in palette and shows the nearest match with its perceptual
          distance (lower = closer). Try a brand color:
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {BRAND_PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            onClick={() => setInput(p.hex)}
            className="text-xs px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition"
          >
            <span
              className="inline-block w-3 h-3 rounded-sm mr-1 align-middle border border-neutral-300"
              style={{ backgroundColor: p.hex }}
              aria-hidden
            />
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {perPalette.map(({ key, label, name, hex, distance }) => (
          <div
            key={key}
            className="border border-neutral-200 rounded-lg overflow-hidden flex flex-col"
          >
            <div
              className="h-20"
              style={{ backgroundColor: hex ?? 'transparent' }}
              aria-label={`${label} nearest-match swatch`}
            />
            <div className="p-2 space-y-0.5">
              <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
              <div className="text-sm font-mono text-neutral-800 break-words leading-tight">
                {name ?? '—'}
              </div>
              <div className="text-[10px] text-neutral-500">
                <code>{hex ?? '—'}</code>
                {distance !== null && (
                  <span className="ml-1 text-neutral-500">· ΔE {distance.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 pt-1 italic">
        Each palette uses its own <code>defaultMetric</code>. Distance units vary by metric —
        ΔE values are in ΔE space (≈1 = just-noticeable for most of the gamut); the
        Euclidean metrics are raw channel distances.
      </p>
    </section>
  );
}
