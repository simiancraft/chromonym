// Image eyedropper — pick a pixel from any image source, see which palette
// entry chromonym resolves it to. Three source modes: preset images (incl.
// the simiancraft icon), a local file, and a live webcam feed. Reuses the
// PaletteGrid + LiveSnippet components from the translator.

import { type DistanceMetric, identify } from 'chromonym';
import {
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LiveSnippet } from './LiveSnippet.js';
import { PaletteGrid, PALETTES, type PaletteKey } from './PaletteGrid.js';

// Vite prepends BASE_URL so the URLs survive the GitHub Pages subpath deploy.
const BASE = import.meta.env.BASE_URL;

const PRESETS = [
  { key: 'simian', label: 'Simiancraft', url: `${BASE}presets/simian.png` },
  { key: 'bauhaus', label: 'Bauhaus primitives', url: `${BASE}presets/bauhaus.svg` },
  { key: 'spectrum', label: 'Spectrum wheel', url: `${BASE}presets/spectrum.svg` },
] as const;

type PresetKey = (typeof PRESETS)[number]['key'];

const METRICS: readonly DistanceMetric[] = [
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

// Intrinsic canvas dimensions. CSS scales it down responsively; mouse coords
// are mapped back to these via the bounding-rect ratio on every event.
const CANVAS_W = 640;
const CANVAS_H = 480;

type SourceKind = 'preset' | 'file' | 'webcam';

interface PickedPixel {
  x: number;
  y: number;
  hex: string;
}

export function Eyedropper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sourceKind, setSourceKind] = useState<SourceKind>('preset');
  const [presetKey, setPresetKey] = useState<PresetKey>('simian');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const [pinned, setPinned] = useState<PickedPixel | null>(null);
  const [hover, setHover] = useState<PickedPixel | null>(null);

  const [paletteKey, setPaletteKey] = useState<PaletteKey>('web');
  const [metric, setMetric] = useState<DistanceMetric>('deltaE2000');
  const [k, setK] = useState(3);

  // ---- Canvas drawing ---------------------------------------------------

  // Draws an image source covering the canvas while preserving aspect ratio.
  const drawImageCover = useCallback((img: CanvasImageSource, iw: number, ih: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.fillStyle = '#f2ebdd';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const scale = Math.min(CANVAS_W / iw, CANVAS_H / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (CANVAS_W - dw) / 2;
    const dy = (CANVAS_H - dh) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Load + draw the current static source (preset or file). Webcam has its
  // own rAF loop so it bypasses this effect.
  useEffect(() => {
    if (sourceKind === 'webcam') return;
    const url = sourceKind === 'file' ? fileDataUrl : PRESETS.find((p) => p.key === presetKey)?.url;
    if (!url) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => drawImageCover(img, img.naturalWidth, img.naturalHeight);
    img.src = url;
  }, [sourceKind, presetKey, fileDataUrl, drawImageCover]);

  // ---- Webcam lifecycle -------------------------------------------------

  const stopWebcam = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const startWebcam = useCallback(async () => {
    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const tick = () => {
        const canvas = canvasRef.current;
        if (!canvas || !streamRef.current) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && video.videoWidth > 0) {
          drawImageCover(video, video.videoWidth, video.videoHeight);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const name = (err as DOMException).name;
      if (name === 'NotAllowedError') setWebcamError('Camera permission denied.');
      else if (name === 'NotFoundError') setWebcamError('No camera found.');
      else setWebcamError(`Camera error: ${name}`);
      setSourceKind('preset');
    }
  }, [drawImageCover]);

  // Manage webcam start/stop whenever sourceKind flips.
  useEffect(() => {
    if (sourceKind === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [sourceKind, startWebcam, stopWebcam]);

  // ---- Pixel reading ----------------------------------------------------

  const pixelFromEvent = (e: ReactMouseEvent<HTMLCanvasElement>): PickedPixel | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * CANVAS_W);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * CANVAS_H);
    if (x < 0 || y < 0 || x >= CANVAS_W || y >= CANVAS_H) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    return { x, y, hex };
  };

  const onCanvasMove = (e: ReactMouseEvent<HTMLCanvasElement>) => setHover(pixelFromEvent(e));
  const onCanvasLeave = () => setHover(null);
  const onCanvasClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const p = pixelFromEvent(e);
    if (!p) return;
    if (pinned && pinned.x === p.x && pinned.y === p.y) setPinned(null);
    else setPinned(p);
  };

  const picked = pinned ?? hover;
  const pickedHex = picked?.hex ?? null;

  // ---- Identify + palette highlight ------------------------------------

  const { matches, elapsedMs } = useMemo(() => {
    if (!pickedHex)
      return {
        matches: [] as Array<{ name: string; value: string; distance: number }>,
        elapsedMs: 0,
      };
    const t0 = performance.now();
    const m = identify(pickedHex, { palette: PALETTES[paletteKey], metric, k });
    const t1 = performance.now();
    return { matches: m, elapsedMs: t1 - t0 };
  }, [pickedHex, paletteKey, metric, k]);

  const highlightedNames = matches.map((m) => m.name);
  const highlightRanks = new Map(matches.map((m, i) => [m.name, i] as const));
  const bestName = matches[0]?.name ?? null;
  const bestHex = matches[0]?.value ?? null;

  // ---- Code snippet -----------------------------------------------------

  const displayLines = [
    `import { identify, ${paletteKey} } from 'chromonym';`,
    ``,
    `identify(${pickedHex ? `'${pickedHex}'` : '/* hover the canvas */'}, {`,
    `  palette: ${paletteKey},`,
    `  metric:  '${metric}',`,
    `  k:       ${k},`,
    `})`,
  ];
  const copyLines = [...displayLines];
  if (matches.length > 0) {
    const shown = Math.min(matches.length, 3);
    displayLines.push('// → [');
    for (let i = 0; i < shown; i++) {
      const m = matches[i];
      displayLines.push(
        `//     { name: '${m.name}', value: '${m.value}', distance: ${m.distance.toFixed(3)} },`,
      );
    }
    if (matches.length > shown) displayLines.push('//     // …');
    displayLines.push('// ]');
  }

  // ---- Render -----------------------------------------------------------

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-neutral-200">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Eyedropper</h2>
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
            pixel pick
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">
          Pick a pixel from any image. Hover previews, click pins. Reads straight off an HTML
          canvas — works the same on a preset, a file you drag in, or a live webcam frame.
        </p>
      </div>

      {/* Source row */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500 mr-1">source:</span>
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.key}
            onClick={() => {
              setSourceKind('preset');
              setPresetKey(p.key);
              setPinned(null);
            }}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              sourceKind === 'preset' && presetKey === p.key
                ? 'bg-neutral-900 text-neutral-50 border-neutral-900'
                : 'bg-neutral-50 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`text-xs px-3 py-1 rounded-full border transition ${
            sourceKind === 'file'
              ? 'bg-neutral-900 text-neutral-50 border-neutral-900'
              : 'bg-neutral-50 border-neutral-300 hover:bg-neutral-100'
          }`}
        >
          📁 open file
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              setFileDataUrl(reader.result as string);
              setSourceKind('file');
              setPinned(null);
            };
            reader.readAsDataURL(f);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setSourceKind((prev) => (prev === 'webcam' ? 'preset' : 'webcam'));
            setPinned(null);
          }}
          className={`text-xs px-3 py-1 rounded-full border transition ${
            sourceKind === 'webcam'
              ? 'bg-neutral-900 text-neutral-50 border-neutral-900'
              : 'bg-neutral-50 border-neutral-300 hover:bg-neutral-100'
          }`}
        >
          {sourceKind === 'webcam' ? '■ stop camera' : '📷 webcam'}
        </button>
      </div>

      {webcamError && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
          {webcamError}
        </div>
      )}

      {/* Canvas + readout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_16rem] gap-4 md:gap-6 items-stretch">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={onCanvasMove}
            onMouseLeave={onCanvasLeave}
            onClick={onCanvasClick}
            className="w-full h-auto rounded-lg border border-neutral-300 cursor-crosshair bg-neutral-100"
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
            aria-label="image to pick colors from"
          />
          {/* Pinned marker */}
          {pinned && (
            <PinnedMarker x={pinned.x} y={pinned.y} />
          )}
          {/* Hidden video for webcam */}
          <video ref={videoRef} playsInline muted className="hidden" />
        </div>

        <div className="space-y-3 min-w-0">
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500">picked</div>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="w-10 h-10 rounded border border-neutral-300 shrink-0"
                style={{ backgroundColor: pickedHex ?? 'transparent' }}
              />
              <code className="text-sm font-mono truncate">{pickedHex ?? '— hover canvas —'}</code>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500">nearest name</div>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="w-10 h-10 rounded border border-neutral-300 shrink-0"
                style={{ backgroundColor: bestHex ?? 'transparent' }}
              />
              <div className="truncate">
                <div className="text-sm font-mono truncate">{bestName ?? '—'}</div>
                <div className="text-[10px] text-neutral-500 font-mono truncate">
                  {bestHex ?? ''} {matches[0] && `· Δ ${matches[0].distance.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono">
            lookup: {elapsedMs < 0.01 ? '<0.01' : elapsedMs.toFixed(2)} ms
            {pinned && <span className="ml-2 text-neutral-400">· pinned — click again to unpin</span>}
          </div>
        </div>
      </div>

      {/* Controls: metric + k (palette lives inside PaletteGrid below) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-neutral-500">metric</span>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as DistanceMetric)}
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
          <span className="text-xs uppercase tracking-wide text-neutral-500">k: {k} nearest</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full mt-1 accent-indigo-600"
          />
        </label>
      </div>

      {/* Palette grid (reused) with the nearest match highlighted */}
      <PaletteGrid
        ariaLabel="eyedropper target"
        paletteKey={paletteKey}
        onPaletteChange={setPaletteKey}
        selectedName={bestName}
        onSelect={() => {
          /* no-op — this grid reads from the eyedropper's picked color */
        }}
        highlightedNames={highlightedNames}
        highlightRanks={highlightRanks}
      />

      <LiveSnippet
        displayText={displayLines.join('\n')}
        copyText={copyLines.join('\n')}
        ariaLabel="live chromonym call for the eyedropper"
      />

      <p className="text-xs text-neutral-500 italic pt-1">
        Canvas-native: `ctx.getImageData(x, y, 1, 1)` → hex → `identify`. Works on any image
        source that draws to a 2D canvas, which is almost everything.
      </p>
    </section>
  );
}

// Circular marker for the pinned pixel. Positioned in CSS space relative to
// the canvas (which is a sibling in the same relative container), so it
// scales with responsive canvas resizing.
function PinnedMarker({ x, y }: { x: number; y: number }) {
  const leftPct = (x / CANVAS_W) * 100;
  const topPct = (y / CANVAS_H) * 100;
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="w-5 h-5 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.75)]" />
    </div>
  );
}
