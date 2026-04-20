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
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  // readParams runs once via the lazy initializer — we don't re-parse on
  // every render.
  const [input, setInput] = useState<string>(() => readParams().color);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>(() => readParams().palette);
  const [metric, setMetric] = useState<DistanceMetric>(() => readParams().metric);

  const palette = PALETTES[paletteKey];

  // URL sync. replaceState keeps the history stack clean — scrubbing a color
  // picker shouldn't fill Back with a hundred hex values.
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

  // Primary identify match — rank-0 of a k=1 call, so we get both the name
  // and its ΔE distance in one shot.
  const primary = useMemo(() => {
    const [best] = identify(input, { palette, metric, k: 1 });
    return best ?? null;
  }, [input, palette, metric]);
  const matchedName = primary?.name ?? null;
  const matchedHex = primary?.value ?? null;

  // Secondary palette for the background triangle: if the user's palette is
  // pantone, we show crayola's opinion, otherwise pantone. Reinforces the
  // "same color, many names" thesis passively.
  const secondaryKey: PaletteKey = paletteKey === 'pantone' ? 'crayola' : 'pantone';
  const secondary = useMemo(() => {
    const [best] = identify(input, { palette: PALETTES[secondaryKey], k: 1 });
    return best ?? null;
  }, [input, secondaryKey]);
  const secondaryHex = secondary?.value ?? null;

  // Resolve act (Warhammer BYO). identify picks the nearest faction name;
  // resolve looks its hex back up — the pulsing shape reads from this hex.
  const warhammerMatch = useMemo(
    () => identify(input, { palette: warhammer }),
    [input],
  );
  const warhammerHex = useMemo(() => {
    if (!warhammerMatch) return null;
    return resolve(warhammerMatch, { palette: warhammer }) as string | null;
  }, [warhammerMatch]);

  // Convert act — all five format outputs for the current input.
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

  // Stage gel colors. Defaults fall back to the Bauhaus primaries when no
  // match is available, so the background shapes never go transparent.
  const gels = useMemo(
    () => ({
      circleColor: input,
      squareColor: matchedHex ?? '#ffd500',
      triangleColor: secondaryHex ?? '#0038a8',
    }),
    [input, matchedHex, secondaryHex],
  );

  // Named action for applying a whole preset atomically — nicer signature
  // than three sequential setters and gives us a home for any future
  // side effects (analytics, toast on "why did X change", etc.).
  const applyPreset = useCallback((p: Preset) => {
    setInput(p.color);
    setPaletteKey(p.palette);
    setMetric(p.metric);
  }, []);

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
    warhammerMatch,
    warhammerHex,
    conversions,
    gels,
  };
}

export type DemoState = ReturnType<typeof useDemoState>;
