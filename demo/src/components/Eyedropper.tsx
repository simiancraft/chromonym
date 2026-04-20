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
import { METRICS, METRIC_LABELS } from '../lib/metrics.js';
import { buildEyedropperSnippet } from '../lib/snippets.js';
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

// Intrinsic canvas dimensions. CSS scales it down responsively; mouse coords
// are mapped back to these via the bounding-rect ratio on every event.
const CANVAS_W = 640;
const CANVAS_H = 480;

// Cap an uploaded image at 10 MB — well below what'd break the tab but big
// enough for any phone camera roll. Larger files get rejected with a toast.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type SourceKind = 'preset' | 'file' | 'webcam';

interface PickedPixel {
  x: number;
  y: number;
  hex: string;
}

interface EyedropperProps {
  /** Called when the user pins a pixel — so the picked color can drive the
   *  rest of the demo's shared input state. */
  onPick?: (hex: string) => void;
}

export function Eyedropper({ onPick }: EyedropperProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Throttle pointer-driven pixel reads to one per animation frame so a fast
  // mouse doesn't trip getImageData + setState + identify at 100+ Hz.
  const hoverRafRef = useRef<number | null>(null);
  const pendingHoverEventRef = useRef<{ clientX: number; clientY: number } | null>(null);

  const [sourceKind, setSourceKind] = useState<SourceKind>('preset');
  const [presetKey, setPresetKey] = useState<PresetKey>('simian');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

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
    ctx.fillStyle = 'var(--bh-paper)';
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
    // Only set CORS for remote URLs; data: URLs from FileReader are same-
    // origin-equivalent and don't need the hint.
    if (!url.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => drawImageCover(img, img.naturalWidth, img.naturalHeight);
    img.onerror = () => setFileError('Could not load that image.');
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

  // Manage webcam start/stop whenever sourceKind flips. The `cancelled` flag
  // closes the async race where a fast source-toggle lets getUserMedia
  // resolve *after* the effect's cleanup already ran — without it, the
  // stream would leak the camera LED on.
  useEffect(() => {
    if (sourceKind !== 'webcam') {
      stopWebcam();
      return;
    }

    let cancelled = false;
    setWebcamError(null);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        try {
          await video.play();
        } catch {
          // play() can reject on autoplay policies — fall back to stop.
          stopWebcam();
          if (!cancelled) {
            setWebcamError('Could not start camera playback.');
            setSourceKind('preset');
          }
          return;
        }
        if (cancelled) {
          stopWebcam();
          return;
        }

        const tick = () => {
          const canvas = canvasRef.current;
          if (!canvas || !streamRef.current) return;
          if (video.videoWidth > 0) {
            drawImageCover(video, video.videoWidth, video.videoHeight);
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException).name;
        if (name === 'NotAllowedError') setWebcamError('Camera permission denied.');
        else if (name === 'NotFoundError') setWebcamError('No camera found.');
        else setWebcamError(`Camera error: ${name}`);
        setSourceKind('preset');
      }
    })();

    return () => {
      cancelled = true;
      stopWebcam();
    };
  }, [sourceKind, drawImageCover, stopWebcam]);

  // ---- Pixel reading ----------------------------------------------------

  // Reads the pixel under (clientX, clientY) off the canvas and returns a
  // PickedPixel or null if out of bounds. Wrapped in try/catch so a tainted
  // canvas (shouldn't happen with our source set, but future-proof) degrades
  // to null instead of throwing on every mousemove.
  const pickPixelAt = useCallback((clientX: number, clientY: number): PickedPixel | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * CANVAS_W);
    const y = Math.floor(((clientY - rect.top) / rect.height) * CANVAS_H);
    if (x < 0 || y < 0 || x >= CANVAS_W || y >= CANVAS_H) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    try {
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${[r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, '0')).join('')}`;
      return { x, y, hex };
    } catch {
      return null;
    }
  }, []);

  // rAF-throttled hover read. A fast mouse generates many mousemove events
  // per frame; we coalesce them and only do the getImageData + setState once
  // per animation frame.
  const onCanvasMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    pendingHoverEventRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (hoverRafRef.current !== null) return;
    hoverRafRef.current = requestAnimationFrame(() => {
      hoverRafRef.current = null;
      const evt = pendingHoverEventRef.current;
      pendingHoverEventRef.current = null;
      if (!evt) return;
      setHover(pickPixelAt(evt.clientX, evt.clientY));
    });
  };
  const onCanvasLeave = () => {
    if (hoverRafRef.current !== null) {
      cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
    pendingHoverEventRef.current = null;
    setHover(null);
  };
  const pinAt = useCallback(
    (p: PickedPixel) => {
      setPinned((prev) => {
        if (prev && prev.x === p.x && prev.y === p.y) return null;
        // Propagate to the shared demo input so the hero, translator, etc.
        // react in lockstep — pinning here *is* the same act as scrubbing
        // the color picker in the identify section.
        onPick?.(p.hex);
        return p;
      });
    },
    [onPick],
  );

  const onCanvasClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const p = pickPixelAt(e.clientX, e.clientY);
    if (p) pinAt(p);
  };

  // Keyboard navigation for the canvas: arrow keys nudge a focused cursor
  // by one canvas-pixel (Shift = 10px for faster traversal); Enter/Space
  // pin the current pixel. Canvases are pointer-only by default — this
  // promotes the eyedropper to keyboard-usable.
  const onCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const step = e.shiftKey ? 10 : 1;
    const current = pinned ?? hover ?? { x: Math.floor(CANVAS_W / 2), y: Math.floor(CANVAS_H / 2), hex: '#000000' };
    let nx = current.x;
    let ny = current.y;
    switch (e.key) {
      case 'ArrowLeft':
        nx = Math.max(0, current.x - step);
        break;
      case 'ArrowRight':
        nx = Math.min(CANVAS_W - 1, current.x + step);
        break;
      case 'ArrowUp':
        ny = Math.max(0, current.y - step);
        break;
      case 'ArrowDown':
        ny = Math.min(CANVAS_H - 1, current.y + step);
        break;
      case 'Enter':
      case ' ': {
        if (current) pinAt(current);
        e.preventDefault();
        return;
      }
      default:
        return;
    }
    e.preventDefault();
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    try {
      const [r, g, b] = ctx.getImageData(nx, ny, 1, 1).data;
      const hex = `#${[r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, '0')).join('')}`;
      setHover({ x: nx, y: ny, hex });
    } catch {
      /* tainted canvas — ignore */
    }
  };

  // Clean up any dangling hover rAF on unmount.
  useEffect(() => () => {
    if (hoverRafRef.current !== null) cancelAnimationFrame(hoverRafRef.current);
  }, []);

  const picked = pinned ?? hover;
  const pickedHex = picked?.hex ?? null;

  // ---- Identify + palette highlight ------------------------------------

  const { matches, elapsedMs, highlightedNames, highlightRanks } = useMemo(() => {
    if (!pickedHex) {
      return {
        matches: [] as Array<{ name: string; value: string; distance: number }>,
        elapsedMs: 0,
        highlightedNames: [] as string[],
        highlightRanks: new Map<string, number>(),
      };
    }
    const t0 = performance.now();
    const m = identify(pickedHex, { palette: PALETTES[paletteKey], metric, k });
    const t1 = performance.now();
    return {
      matches: m,
      elapsedMs: t1 - t0,
      highlightedNames: m.map((x) => x.name),
      highlightRanks: new Map(m.map((x, i) => [x.name, i] as const)),
    };
  }, [pickedHex, paletteKey, metric, k]);

  const bestName = matches[0]?.name ?? null;
  const bestHex = matches[0]?.value ?? null;

  // ---- Code snippet -----------------------------------------------------

  const snippet = buildEyedropperSnippet({ paletteKey, pickedHex, metric, k, matches });

  // ---- Render -----------------------------------------------------------

  return (
    <div
      className="p-5 md:p-6 space-y-4"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      <p className="text-sm max-w-2xl leading-snug">
        Pick a pixel from any image. Hover previews, click pins. Reads straight off an HTML
        canvas — works the same on a preset, a file you drag in, or a live webcam frame.
      </p>

      {/* Source row */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="bh-eyebrow mr-1">source</span>
        {PRESETS.map((p) => (
          <SourceButton
            key={p.key}
            active={sourceKind === 'preset' && presetKey === p.key}
            onClick={() => {
              setSourceKind('preset');
              setPresetKey(p.key);
              setPinned(null);
              setFileError(null);
            }}
          >
            {p.label}
          </SourceButton>
        ))}
        <SourceButton
          active={sourceKind === 'file'}
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderGlyph /> open file
        </SourceButton>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > MAX_FILE_BYTES) {
              setFileError(`File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`);
              e.target.value = '';
              return;
            }
            setFileError(null);
            const reader = new FileReader();
            reader.onload = () => {
              setFileDataUrl(reader.result as string);
              setSourceKind('file');
              setPinned(null);
            };
            reader.onerror = () => setFileError('Could not read file.');
            reader.readAsDataURL(f);
          }}
        />
        <SourceButton
          active={sourceKind === 'webcam'}
          onClick={() => {
            setSourceKind((prev) => (prev === 'webcam' ? 'preset' : 'webcam'));
            setPinned(null);
          }}
        >
          {sourceKind === 'webcam' ? <><StopGlyph /> stop camera</> : <><CameraGlyph /> webcam</>}
        </SourceButton>
      </div>

      {(webcamError || fileError) && (
        <div
          className="bh-eyebrow px-3 py-2"
          style={{
            backgroundColor: 'var(--bh-cream)',
            border: '1px solid var(--bh-red)',
            color: 'var(--bh-red)',
          }}
          role="alert"
        >
          {webcamError ?? fileError}
        </div>
      )}

      {/* Canvas + readout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_16rem] gap-4 md:gap-6 items-stretch">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            tabIndex={0}
            onMouseMove={onCanvasMove}
            onMouseLeave={onCanvasLeave}
            onClick={onCanvasClick}
            onKeyDown={onCanvasKeyDown}
            className="w-full h-auto cursor-crosshair focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bh-ink)]"
            style={{
              aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
              border: '1px solid var(--bh-ink)',
              backgroundColor: 'var(--bh-cream)',
            }}
            aria-label="image to pick colors from; arrow keys to nudge, Enter to pin"
          />
          {pinned && <PinnedMarker x={pinned.x} y={pinned.y} />}
          {/* Hidden video for webcam; off-screen instead of display:none
              because Safari has historically dropped frames from hidden video. */}
          <video
            ref={videoRef}
            playsInline
            muted
            aria-hidden
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
          />
        </div>

        <div className="space-y-3 min-w-0">
          <div>
            <div className="bh-eyebrow">picked</div>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="w-10 h-10 shrink-0"
                style={{
                  backgroundColor: pickedHex ?? 'transparent',
                  border: '1px solid var(--bh-ink)',
                }}
              />
              <code className="text-sm font-mono truncate">
                {pickedHex ?? '— hover canvas —'}
              </code>
            </div>
          </div>

          <div>
            <div className="bh-eyebrow">nearest name</div>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="w-10 h-10 shrink-0"
                style={{
                  backgroundColor: bestHex ?? 'transparent',
                  border: '1px solid var(--bh-ink)',
                }}
              />
              <div className="truncate">
                <div className="text-sm font-mono truncate">{bestName ?? '—'}</div>
                <div className="text-[10px] font-mono opacity-60 truncate">
                  {bestHex ?? ''} {matches[0] && `· Δ ${matches[0].distance.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono opacity-60">
            lookup: {elapsedMs < 0.01 ? '<0.01' : elapsedMs.toFixed(2)} ms
            {pinned && (
              <span className="ml-2 opacity-70">· pinned — click again to unpin</span>
            )}
          </div>
        </div>
      </div>

      {/* Controls: metric + k (palette lives inside PaletteGrid below) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="bh-eyebrow">metric</span>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as DistanceMetric)}
            className="w-full h-10 px-2 mt-1 text-sm font-mono"
            style={{ border: '1px solid var(--bh-ink)', backgroundColor: 'var(--bh-cream)' }}
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
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full mt-1"
            style={{ accentColor: 'var(--bh-red)' }}
          />
        </label>
      </div>

      {/* Palette grid — the swatches here are driven by the canvas pick, so
          they render read-only (no click handler, no pointer affordance). */}
      <PaletteGrid
        ariaLabel="eyedropper target"
        paletteKey={paletteKey}
        onPaletteChange={setPaletteKey}
        selectedName={bestName}
        highlightedNames={highlightedNames}
        highlightRanks={highlightRanks}
        readOnly
      />

      <LiveSnippet
        label="signal · identify · eyedropper"
        tintHex={pickedHex ?? undefined}
        {...snippet}
        ariaLabel="live chromonym call for the eyedropper"
      />
    </div>
  );
}

// ---- Source-row button + glyph primitives ------------------------------

function SourceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider px-3 py-[6px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-ink)] focus-visible:ring-offset-1"
      style={{
        border: '1px solid var(--bh-ink)',
        backgroundColor: active ? 'var(--bh-ink)' : 'transparent',
        color: active ? 'var(--bh-cream)' : 'var(--bh-ink)',
      }}
    >
      {children}
    </button>
  );
}

function FolderGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1 4a1 1 0 0 1 1-1h4l2 2h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" />
    </svg>
  );
}

function CameraGlyph() {
  return (
    <svg width="12" height="11" viewBox="0 0 18 14" fill="currentColor" aria-hidden>
      <path d="M5 0L3 2H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2l-2-2H5zm4 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
    </svg>
  );
}

function StopGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="8" height="8" />
    </svg>
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
