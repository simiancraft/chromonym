// Minimal canvas-based color picker. Pick a pixel from any image source
// (preset / local file / live webcam), hover previews, click pins. On pin,
// writes the hex back to the shared demo `input` via `onPick` — so the
// surrounding IdentifyPanel's picker, palette tiles, result swatches, and
// code snippet all react to the same state. No local controls (palette,
// metric, k): those live at the panel level.

import {
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// Vite prepends BASE_URL so the URLs survive the GitHub Pages subpath deploy.
const BASE = import.meta.env.BASE_URL;

const PRESETS = [
  { key: 'simian', label: 'Simiancraft', url: `${BASE}presets/simian.png` },
  { key: 'bauhaus', label: 'Bauhaus', url: `${BASE}presets/bauhaus.svg` },
  { key: 'spectrum', label: 'Spectrum', url: `${BASE}presets/spectrum.svg` },
] as const;

type PresetKey = (typeof PRESETS)[number]['key'];

// Intrinsic canvas dimensions. CSS scales responsively; mouse coords are
// mapped back to these via the bounding-rect ratio on every event.
const CANVAS_W = 640;
const CANVAS_H = 480;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

type SourceKind = 'preset' | 'file' | 'webcam';

interface PickedPixel {
  x: number;
  y: number;
  hex: string;
}

interface EyedropperProps {
  /** Writes the picked color back to shared demo state on pin. */
  onPick: (hex: string) => void;
}

export function Eyedropper({ onPick }: EyedropperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hoverRafRef = useRef<number | null>(null);
  const pendingHoverEventRef = useRef<{ clientX: number; clientY: number } | null>(null);

  const [sourceKind, setSourceKind] = useState<SourceKind>('preset');
  const [presetKey, setPresetKey] = useState<PresetKey>('simian');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [pinned, setPinned] = useState<PickedPixel | null>(null);
  const [hover, setHover] = useState<PickedPixel | null>(null);

  // ---- Canvas drawing ---------------------------------------------------

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

  useEffect(() => {
    if (sourceKind === 'webcam') return;
    const url = sourceKind === 'file' ? fileDataUrl : PRESETS.find((p) => p.key === presetKey)?.url;
    if (!url) return;
    const img = new Image();
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

  const pinAt = useCallback(
    (p: PickedPixel) => {
      setPinned((prev) => {
        if (prev && prev.x === p.x && prev.y === p.y) return null;
        onPick(p.hex);
        return p;
      });
    },
    [onPick],
  );

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

  const onCanvasClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const p = pickPixelAt(e.clientX, e.clientY);
    if (p) pinAt(p);
  };

  const onCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const step = e.shiftKey ? 10 : 1;
    const current =
      pinned ??
      hover ?? { x: Math.floor(CANVAS_W / 2), y: Math.floor(CANVAS_H / 2), hex: '#000000' };
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
      case ' ':
        if (current) pinAt(current);
        e.preventDefault();
        return;
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

  useEffect(
    () => () => {
      if (hoverRafRef.current !== null) cancelAnimationFrame(hoverRafRef.current);
    },
    [],
  );

  // ---- Render -----------------------------------------------------------

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Source row */}
      <div className="flex flex-wrap gap-[4px] items-center">
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
          <FolderGlyph /> file
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
          {sourceKind === 'webcam' ? (
            <>
              <StopGlyph /> stop
            </>
          ) : (
            <>
              <CameraGlyph /> webcam
            </>
          )}
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

      {/* Canvas */}
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
          aria-label="image to pick colors from; arrow keys nudge, Enter pins"
        />
        {pinned && <PinnedMarker x={pinned.x} y={pinned.y} />}
        <video
          ref={videoRef}
          playsInline
          muted
          aria-hidden
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Micro-readout: pinned vs hover, so the user knows which mode is active */}
      <div className="font-mono text-[10px] opacity-60 flex items-center gap-2">
        {pinned ? (
          <>
            <span>pinned</span>
            <code>{pinned.hex}</code>
            <span className="opacity-70">· click again to unpin</span>
          </>
        ) : hover ? (
          <>
            <span>hover</span>
            <code>{hover.hex}</code>
          </>
        ) : (
          <span>hover the canvas · arrows to nudge · enter to pin</span>
        )}
      </div>
    </div>
  );
}

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
      className="inline-flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-wider px-2 py-[5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-ink)] focus-visible:ring-offset-1"
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
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1 4a1 1 0 0 1 1-1h4l2 2h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" />
    </svg>
  );
}

function CameraGlyph() {
  return (
    <svg width="11" height="10" viewBox="0 0 18 14" fill="currentColor" aria-hidden>
      <path d="M5 0L3 2H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2l-2-2H5zm4 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
    </svg>
  );
}

function StopGlyph() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="8" height="8" />
    </svg>
  );
}

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
