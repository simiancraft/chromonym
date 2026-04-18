import {
  COLOR_FORMATS,
  type ColorFormat,
  type ColorspaceName,
  convert,
  type DistanceMetric,
  identify,
  resolve,
} from 'chromonym';
import { useEffect, useMemo, useState } from 'react';
import bannerUrl from '../../.github/assets/banner.png';

const COLORSPACES: ColorspaceName[] = ['web', 'x11', 'pantone'];

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

// Read initial state from the URL so shared links reproduce the demo state.
function readParams() {
  if (typeof window === 'undefined') return { color: '#E20074', colorspace: 'pantone' as ColorspaceName, metric: 'deltaE2000' as DistanceMetric };
  const p = new URLSearchParams(window.location.search);
  const color = p.get('c') ?? '#E20074';
  const colorspace = (p.get('cs') ?? 'pantone') as ColorspaceName;
  const metric = (p.get('m') ?? 'deltaE2000') as DistanceMetric;
  return {
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#E20074',
    colorspace: (COLORSPACES as string[]).includes(colorspace) ? colorspace : 'pantone',
    metric: (METRICS as string[]).includes(metric) ? metric : 'deltaE2000',
  };
}

const PRESETS: Array<{ label: string; color: string; colorspace: ColorspaceName; metric: DistanceMetric }> = [
  { label: 'T-Mobile magenta → Pantone', color: '#E20074', colorspace: 'pantone', metric: 'deltaE2000' },
  { label: 'Spotify green → Pantone', color: '#1DB954', colorspace: 'pantone', metric: 'deltaE2000' },
  { label: 'Facebook blue → Pantone', color: '#1877F2', colorspace: 'pantone', metric: 'deltaEok' },
  { label: 'Dodger blue → web', color: '#1E90FF', colorspace: 'web', metric: 'deltaE76' },
  { label: 'Blueviolet → X11 (ΔE76 picks differently)', color: '#8A2BE2', colorspace: 'x11', metric: 'deltaE76' },
];

export function App() {
  const initial = readParams();
  const [input, setInput] = useState(initial.color);
  const [colorspace, setColorspace] = useState<ColorspaceName>(initial.colorspace);
  const [metric, setMetric] = useState<DistanceMetric>(initial.metric);

  // Write state to URL on every change (replaceState — don't pollute history).
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('c', input);
    p.set('cs', colorspace);
    p.set('m', metric);
    const qs = `?${p.toString()}`;
    if (window.location.search !== qs) {
      window.history.replaceState({}, '', `${window.location.pathname}${qs}`);
    }
  }, [input, colorspace, metric]);

  const matchedName = useMemo(() => identify(input, { colorspace, metric }), [input, colorspace, metric]);

  const matchedHex = useMemo(() => {
    if (!matchedName) return null;
    return resolve(matchedName, { colorspace }) as string | null;
  }, [matchedName, colorspace]);

  const conversions = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const fmt of COLOR_FORMATS) {
      try {
        out[fmt as ColorFormat] = convert(input, { format: fmt as ColorFormat });
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
            three colorspaces, with your choice of perceptual distance metric.
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
              <span className="text-sm font-medium text-neutral-700">colorspace</span>
              <select
                value={colorspace}
                onChange={(e) => setColorspace(e.target.value as ColorspaceName)}
                className="w-full h-12 rounded border border-neutral-300 px-3 mt-1"
              >
                {COLORSPACES.map((c) => (
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
                  setColorspace(p.colorspace);
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
            <div className="text-xs uppercase tracking-wide text-neutral-500">name</div>
            <div className="text-5xl font-mono font-semibold pt-1">{matchedName ?? 'unknown'}</div>
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
