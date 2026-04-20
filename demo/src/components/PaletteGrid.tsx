// Reusable palette visualizer — selector + scrollable swatch grid + selection.
// Designed for reuse across demo sections; zero external deps (the grid is
// literally <div>s with flex-wrap, the swatch a plain <button>).

import { type Palette, crayola, pantone, web, x11 } from 'chromonym';

export type PaletteKey = 'web' | 'x11' | 'pantone' | 'crayola';

export const PALETTES: Record<PaletteKey, Palette> = { web, x11, pantone, crayola };

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  web: 'CSS / web',
  x11: 'X11',
  pantone: 'Pantone',
  crayola: 'Crayola',
};

export const PALETTE_KEYS: readonly PaletteKey[] = ['web', 'x11', 'pantone', 'crayola'];

interface PaletteGridProps {
  paletteKey: PaletteKey;
  onPaletteChange: (key: PaletteKey) => void;
  selectedName: string | null;
  onSelect: (name: string) => void;
  highlightedNames?: readonly string[];
  // The rank (0 = best) of each highlighted entry — used to dim runners-up.
  highlightRanks?: ReadonlyMap<string, number>;
  ariaLabel: string;
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
  className = '',
}: PaletteGridProps) {
  const palette = PALETTES[paletteKey];
  const entries = Object.entries(palette.colors) as Array<[string, string]>;
  const highlightSet = new Set(highlightedNames ?? []);
  const selectedHex = selectedName ? (palette.colors as Record<string, string>)[selectedName] : null;

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <label className="block mb-2">
        <span className="text-xs uppercase tracking-wide text-neutral-500">palette</span>
        <select
          value={paletteKey}
          onChange={(e) => onPaletteChange(e.target.value as PaletteKey)}
          className="w-full h-10 rounded border border-neutral-300 px-2 mt-1 bg-white text-sm"
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
        className="flex-1 min-h-0 max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2"
        aria-label={`${ariaLabel} swatch grid`}
      >
        <div className="flex flex-wrap gap-[5px]">
          {entries.map(([name, hex]) => {
            const isSelected = name === selectedName;
            const isHighlighted = highlightSet.has(name);
            const rank = highlightRanks?.get(name);
            return (
              <Swatch
                key={name}
                name={name}
                hex={hex}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                rank={rank}
                onClick={() => onSelect(name)}
              />
            );
          })}
        </div>
      </div>

      <div
        className="text-xs text-neutral-500 mt-2 font-mono truncate"
        title={selectedName ?? undefined}
      >
        {selectedName && selectedHex ? `${selectedName} · ${selectedHex}` : '— nothing selected —'}
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
  onClick: () => void;
}

function Swatch({ name, hex, isSelected, isHighlighted, rank, onClick }: SwatchProps) {
  // Ring style priority: selected > highlighted (by rank) > default.
  let ringClass = '';
  if (isSelected) {
    ringClass = 'ring-2 ring-offset-1 ring-blue-600 z-10';
  } else if (isHighlighted) {
    ringClass =
      rank === 0
        ? 'ring-2 ring-offset-1 ring-amber-500 z-10'
        : 'ring-2 ring-amber-300';
  }

  const rankSuffix = rank !== undefined ? ` · #${rank + 1}` : '';
  const ariaSuffix = isSelected
    ? ' (selected)'
    : isHighlighted
      ? ` (nearest match #${(rank ?? 0) + 1})`
      : '';

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${name} · ${hex}${rankSuffix}`}
      aria-label={`${name} ${hex}${ariaSuffix}`}
      style={{ backgroundColor: hex }}
      className={`w-[15px] h-[15px] rounded-[2px] cursor-pointer outline-none hover:scale-110 transition-transform ${ringClass}`}
    />
  );
}
