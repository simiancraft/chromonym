// Central demo state — the single ownership boundary for `input`,
// `paletteKey`, and `metric`. Everything downstream (hero readout, Kandinsky
// pulse, background gels, convert screen, URL query string) derives from
// this hook. Kept as a custom hook rather than a full reducer because the
// state surface is small — three primitives plus a preset-application
// action — and promoting the local state of Translator/Eyedropper up here
// would kill their reusability.
//
// If the action vocabulary grows (undo/redo, presets-from-URL, saved states),
// flipping the internals from useState to useReducer is a drop-in swap; the
// return shape is already shaped around named actions (setInput,
// setPaletteKey, setMetric, applyPreset).

import {
  COLOR_FORMATS,
  type ColorFormat,
  type ColorInput,
  type DistanceMetric,
  convert,
  identify,
  resolve,
} from 'chromonym';
// React Compiler auto-memoizes derived values and callbacks at build
// time (see demo/vite.config.ts), so this file only reaches for React
// hooks with semantic requirements: useState for state, useRef for
// identity-stable mutable boxes, useEffect for side effects. No
// manual useMemo / useCallback — the compiler covers those.
import { useEffect, useRef, useState } from 'react';
import { PALETTES, type PaletteKey, PALETTE_KEYS } from '../components/PaletteGrid.js';
import { METRICS } from '../lib/metrics.js';
import type { Preset } from '../data/presets.js';
import { warhammer } from '../data/warhammer.js';

function readParams(): { color: string; palette: PaletteKey; metric: DistanceMetric } {
  if (typeof window === 'undefined') {
    return { color: '#E20074', palette: 'pantone', metric: 'deltaE2000' };
  }
  const p = new URLSearchParams(window.location.search);
  const color = p.get('c') ?? '#E20074';
  const palette = (p.get('cs') ?? 'pantone') as PaletteKey;
  const metric = (p.get('m') ?? 'deltaE2000') as DistanceMetric;
  return {
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#E20074',
    palette: (PALETTE_KEYS as readonly string[]).includes(palette) ? palette : 'pantone',
    metric: (METRICS as readonly string[]).includes(metric) ? metric : 'deltaE2000',
  };
}

export function useDemoState() {
  // readParams is called exactly once — a lazy tuple initializer so each
  // useState seeds from the same parse. (Prior versions called it three
  // times, which worked but re-parsed URLSearchParams each time.)
  const [initial] = useState(readParams);
  const [input, setInput] = useState<string>(initial.color);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>(initial.palette);
  const [metric, setMetric] = useState<DistanceMetric>(initial.metric);

  const palette = PALETTES[paletteKey];

  // URL sync, lightly debounced. A color-picker scrub emits changes at ~60 Hz;
  // writing to history that often is wasteful and spams DevTools. 150 ms is
  // imperceptible for share-link copy UX, cheap for scrubbing. replaceState
  // keeps the history stack clean — scrubbing shouldn't fill Back.
  const urlDebounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (urlDebounceRef.current !== null) window.clearTimeout(urlDebounceRef.current);
    urlDebounceRef.current = window.setTimeout(() => {
      const p = new URLSearchParams();
      p.set('c', input);
      p.set('cs', paletteKey);
      p.set('m', metric);
      const qs = `?${p.toString()}`;
      if (window.location.search !== qs) {
        window.history.replaceState({}, '', `${window.location.pathname}${qs}`);
      }
    }, 150);
    return () => {
      if (urlDebounceRef.current !== null) window.clearTimeout(urlDebounceRef.current);
    };
  }, [input, paletteKey, metric]);

  // Primary identify match — rank-0 of a k=1 call, so we get both the name
  // and its ΔE distance in one shot. elapsedMs is captured here so it
  // reflects the actual identify work for this input/palette/metric combo.
  const primaryStart = performance.now();
  const [primaryBest] = identify(input, { palette, metric, k: 1 });
  const identifyElapsedMs = performance.now() - primaryStart;
  const matchedName = primaryBest?.name ?? null;
  const matchedHex = primaryBest?.value ?? null;

  // Secondary palette for the background triangle: if the user's palette is
  // pantone, we show crayola's opinion, otherwise pantone. Reinforces the
  // "same color, many names" thesis passively.
  const secondaryKey: PaletteKey = paletteKey === 'pantone' ? 'crayola' : 'pantone';
  const [secondaryBest] = identify(input, { palette: PALETTES[secondaryKey], k: 1 });
  const secondaryHex = secondaryBest?.value ?? null;

  // Resolve act (Warhammer BYO). identify picks the nearest faction name;
  // resolve looks its hex back up — the pulsing shape reads from this hex.
  const warhammerMatch = identify(input, { palette: warhammer });
  // `resolve` returns `ColorValue | null`, which for the default HEX
  // format narrows to `HexColor | null`. Narrow via `typeof` instead of
  // asserting — the cast-shaped fix would lie the day a caller passes
  // `format: 'RGBA'` and resolve starts returning an Rgba object.
  const warhammerResolved = warhammerMatch
    ? resolve(warhammerMatch, { palette: warhammer })
    : null;
  const warhammerHex = typeof warhammerResolved === 'string' ? warhammerResolved : null;

  // Convert act — all five format outputs for the current input.
  const conversions: Record<string, unknown> = {};
  for (const fmt of COLOR_FORMATS) {
    try {
      conversions[fmt as ColorFormat] = convert(input as ColorInput, {
        format: fmt as ColorFormat,
      });
    } catch (e) {
      conversions[fmt as ColorFormat] = `— error: ${(e as Error).message}`;
    }
  }

  // Stage gel colors. Defaults fall back to the Bauhaus primaries when no
  // match is available, so the background shapes never go transparent.
  const gels = {
    circleColor: input,
    squareColor: matchedHex ?? '#ffd500',
    triangleColor: secondaryHex ?? '#0038a8',
  };

  // Named action for applying a whole preset atomically — nicer signature
  // than three sequential setters and gives us a home for any future
  // side effects (analytics, toast on "why did X change", etc.).
  const applyPreset = (p: Preset) => {
    setInput(p.color);
    setPaletteKey(p.palette);
    setMetric(p.metric);
  };

  return {
    input,
    setInput,
    paletteKey,
    setPaletteKey,
    metric,
    setMetric,
    applyPreset,
    matchedName,
    matchedHex,
    identifyElapsedMs,
    warhammerMatch,
    warhammerHex,
    conversions,
    gels,
  };
}

export type DemoState = ReturnType<typeof useDemoState>;
