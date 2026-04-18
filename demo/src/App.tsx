import {
  COLOR_FORMATS,
  type ColorFormat,
  type ColorspaceName,
  convert,
  type DistanceMetric,
  identify,
  resolve,
} from 'chromonym';
import { useMemo, useState } from 'react';

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

export function App() {
  const [input, setInput] = useState('#dc143c');
  const [colorspace, setColorspace] = useState<ColorspaceName>('web');
  const [metric, setMetric] = useState<DistanceMetric>('deltaE76');

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
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">chromonym</h1>
          <p className="text-neutral-600">
            Tree-shakeable color naming for TypeScript. Scrub a color — see the nearest name across
            three colorspaces, with your choice of perceptual distance metric.
          </p>
          <a
            href="https://github.com/simiancraft/chromonym"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            GitHub →
          </a>
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

        <footer className="text-center text-xs text-neutral-500 pt-4">
          Pantone® is a registered trademark of Pantone LLC. Chromonym is not affiliated with
          Pantone; values are community approximations. See{' '}
          <a
            href="https://github.com/simiancraft/chromonym/blob/main/NOTICE.md"
            className="underline"
          >
            NOTICE.md
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
