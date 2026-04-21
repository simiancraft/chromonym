// Reusable palette visualizer — selector + scrollable swatch grid + selection.
// Zero external deps; the swatch is a plain <button> (or a <div> in readOnly
// mode), the grid a flex-wrap. Shared by the translator (both sides) and the
// eyedropper (result-only).

import {
  crayola,
  fs595b,
  fs595c,
  isccNbs,
  ntc,
  pantone,
  resene,
  web,
  x11,
  xkcd,
} from 'chromonym';
import { memo, useMemo } from 'react';

// `as const` is load-bearing: it preserves each palette's literal name union
// through `PALETTES[k].colors`, so `Object.entries(...)` downstream doesn't
// decay to `string[]`. Without this the demo would need an `as Record<string,
// string>` laundered cast at every lookup site — exactly what chromonym's
// `Palette<Name>` generics exist to eliminate.
export const PALETTES = {
  web,
  x11,
  pantone,
  crayola,
  ntc,
  xkcd,
  fs595c,
  fs595b,
  isccNbs,
  resene,
} as const;
export type PaletteKey = keyof typeof PALETTES;

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  web: 'CSS / web',
  x11: 'X11',
  pantone: 'Pantone',
  crayola: 'Crayola',
  ntc: 'NTC',
  xkcd: 'XKCD',
  fs595c: 'FS 595C',
  fs595b: 'FS 595B',
  isccNbs: 'ISCC-NBS',
  resene: 'Resene',
};

export const PALETTE_KEYS = [
  'web',
  'x11',
  'pantone',
  'crayola',
  'ntc',
  'xkcd',
  'fs595c',
  'fs595b',
  'isccNbs',
  'resene',
] as const satisfies readonly PaletteKey[];

interface PaletteGridProps {
  paletteKey: PaletteKey;
  onPaletteChange: (key: PaletteKey) => void;
  selectedName: string | null;
  onSelect?: (name: string) => void;
  highlightedNames?: readonly string[];
  /** The rank (0 = best) of each highlighted entry — used to dim runners-up. */
  highlightRanks?: ReadonlyMap<string, number>;
  ariaLabel: string;
  /** When true, swatches are non-interactive display primitives — used by the
   *  eyedropper's result grid where the picked color comes from the canvas,
   *  not from clicking a swatch. */
  readOnly?: boolean;
  className?: string;
}

export function PaletteGrid({
  paletteKey,
  onPaletteChange,
  selectedName,
  onSelect,
  highlightedNames,
  highlightRanks,
  ariaLabel,
  readOnly = false,
  className = '',
}: PaletteGridProps) {
  const palette = PALETTES[paletteKey];

  // Memoize the entries array so flex-wrap doesn't get a fresh array identity
  // on every parent render; pantone's 907 tuples stay stable while only the
  // palette key is unchanged.
  const entries = useMemo(
    () => Object.entries(palette.colors) as Array<[string, string]>,
    [palette],
  );

  // Set + render-selected derivation. Set identity matters because Swatch
  // is memoized on the `isHighlighted` boolean (stable primitive).
  const highlightSet = useMemo(
    () => new Set(highlightedNames ?? []),
    [highlightedNames],
  );

  const selectedHex = selectedName
    ? (palette.colors as Readonly<Record<string, string>>)[selectedName]
    : null;

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <label className="block mb-2">
        <span className="bh-eyebrow">palette</span>
        <select
          value={paletteKey}
          onChange={(e) => onPaletteChange(e.target.value as PaletteKey)}
          className="w-full h-10 px-2 mt-1 text-sm font-mono"
          style={{
            border: '1px solid var(--bh-ink)',
            backgroundColor: 'var(--bh-cream)',
          }}
          aria-label={`${ariaLabel} palette selector`}
        >
          {PALETTE_KEYS.map((k) => (
            <option key={k} value={k}>
              {PALETTE_LABELS[k]} ({Object.keys(PALETTES[k].colors).length})
            </option>
          ))}
        </select>
      </label>

      <div
        className="flex-1 min-h-0 max-h-80 overflow-y-auto p-2"
        style={{
          border: '1px solid var(--bh-ink)',
          backgroundColor: 'var(--bh-cream)',
        }}
        aria-label={`${ariaLabel} swatch grid`}
      >
        <div className="flex flex-wrap gap-[5px]">
          {entries.map(([name, hex]) => (
            <Swatch
              key={name}
              name={name}
              hex={hex}
              isSelected={name === selectedName}
              isHighlighted={highlightSet.has(name)}
              rank={highlightRanks?.get(name)}
              readOnly={readOnly}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <div
        className="text-xs mt-2 font-mono truncate opacity-60"
        title={selectedName ?? undefined}
      >
        {selectedName && selectedHex
          ? `${selectedName} · ${selectedHex}`
          : '— nothing selected —'}
      </div>
    </div>
  );
}

interface SwatchProps {
  name: string;
  hex: string;
  isSelected: boolean;
  isHighlighted: boolean;
  rank?: number;
  readOnly: boolean;
  onSelect?: (name: string) => void;
}

// React.memo on Swatch means pantone's 907 swatches only re-render when their
// own state flips (selected/highlighted/rank), not when the parent re-renders
// for an unrelated reason.
const Swatch = memo(function Swatch({
  name,
  hex,
  isSelected,
  isHighlighted,
  rank,
  readOnly,
  onSelect,
}: SwatchProps) {
  let ringClass = '';
  if (isSelected) {
    ringClass = 'ring-2 ring-offset-1 ring-[var(--bh-ink)] z-10';
  } else if (isHighlighted) {
    ringClass =
      rank === 0
        ? 'ring-2 ring-offset-1 ring-[var(--bh-red)] z-10'
        : 'ring-2 ring-[var(--bh-red)]/60';
  }

  const rankSuffix = rank !== undefined ? ` · #${rank + 1}` : '';
  const ariaSuffix = isSelected
    ? ' (selected)'
    : isHighlighted
      ? ` (nearest match #${(rank ?? 0) + 1})`
      : '';
  const commonStyle = { backgroundColor: hex };
  const commonClass = `w-[15px] h-[15px] rounded-[2px] ${ringClass}`;
  const commonTitle = `${name} · ${hex}${rankSuffix}`;
  const commonAria = `${name} ${hex}${ariaSuffix}`;

  if (readOnly) {
    return (
      <div
        aria-label={commonAria}
        title={commonTitle}
        style={commonStyle}
        className={commonClass}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(name)}
      title={commonTitle}
      aria-label={commonAria}
      style={commonStyle}
      className={`${commonClass} cursor-pointer hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-ink)] focus-visible:ring-offset-1`}
    />
  );
});
