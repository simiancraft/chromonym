// Palette selector as a 2×2 Bauhaus tile grid. Replaces a generic <select>
// with four primary-block tiles — each a flat-color poster for its palette,
// carrying a 5-swatch sample strip as proof of its flavor. The selected tile
// is framed by a heavy black rule; the unselected tiles stay crisp and flat.
//
// Four palettes on four tiles. The `tone` is the tile's Bauhaus block color,
// fixed per palette for recognition; `ink` flips to black/cream based on tone
// luminance so the display text stays legible.

import { useRef } from 'react';
import { PALETTES, PALETTE_LABELS, type PaletteKey } from './PaletteGrid.js';

interface PaletteTilesProps {
  selected: PaletteKey;
  onSelect: (key: PaletteKey) => void;
  /** `grid` = 2×2 block (the original, used when vertical space is cheap).
   *  `row`  = 4×1 horizontal strip — use when the tiles share a row with
   *  other controls and we're saving vertical space. */
  layout?: 'grid' | 'row';
}

const TILE_META: Record<PaletteKey, { tone: string; ink: string }> = {
  web: { tone: 'var(--bh-red)', ink: 'var(--bh-cream)' },
  x11: { tone: 'var(--bh-yellow)', ink: 'var(--bh-ink)' },
  pantone: { tone: 'var(--bh-blue)', ink: 'var(--bh-cream)' },
  crayola: { tone: 'var(--bh-ink)', ink: 'var(--bh-cream)' },
};

const ORDER: PaletteKey[] = ['web', 'x11', 'pantone', 'crayola'];

export function PaletteTiles({ selected, onSelect, layout = 'grid' }: PaletteTilesProps) {
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // ARIA radio-group keyboard model: arrow keys move focus + selection
  // through the group; Tab moves out. Home/End jump to first/last.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = ORDER.indexOf(selected);
    let nextIdx = currentIdx;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIdx = (currentIdx + 1) % ORDER.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIdx = (currentIdx - 1 + ORDER.length) % ORDER.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = ORDER.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const nextKey = ORDER[nextIdx];
    if (!nextKey) return;
    onSelect(nextKey);
    tileRefs.current[nextIdx]?.focus();
  };

  const gridClass =
    layout === 'row'
      ? 'grid grid-cols-2 sm:grid-cols-4 gap-[3px] p-[3px]'
      : 'grid grid-cols-2 gap-[3px] p-[3px]';

  return (
    <div
      className={gridClass}
      style={{ backgroundColor: 'var(--bh-ink)' }}
      role="radiogroup"
      aria-label="palette selector"
      onKeyDown={handleKeyDown}
    >
      {ORDER.map((key, idx) => {
        const { tone, ink } = TILE_META[key];
        const isSelected = selected === key;
        const palette = PALETTES[key];
        const colors = Object.values(palette.colors) as string[];
        const step = Math.max(1, Math.floor(colors.length / 5));
        const sample = Array.from({ length: 5 }, (_, i) => colors[i * step]!);
        const count = colors.length;

        return (
          <button
            key={key}
            ref={(el) => {
              tileRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            // Roving tabindex: only the active tile takes Tab focus; arrow
            // keys move focus + selection through the others.
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(key)}
            className={`relative flex flex-col justify-between text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${layout === 'row' ? 'p-3' : 'p-4'}`}
            style={{
              backgroundColor: tone,
              color: ink,
              minHeight: layout === 'row' ? '96px' : '132px',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div
                  className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-70"
                  style={{ color: ink }}
                >
                  palette / {String(idx + 1).padStart(2, '0')}
                </div>
                <div
                  className={`lowercase font-semibold tracking-[-0.02em] ${layout === 'row' ? 'text-lg' : 'text-2xl'}`}
                  style={{ color: ink }}
                >
                  {PALETTE_LABELS[key]}
                </div>
              </div>
              <div
                className="font-mono text-[10px] tracking-[0.15em] opacity-80 mt-1"
                style={{ color: ink }}
              >
                {count}
              </div>
            </div>

            <div className="flex gap-[2px] mt-3" aria-hidden>
              {sample.map((hex, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length deterministic
                  key={i}
                  className="flex-1 h-3"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>

            {isSelected && (
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 0 3px var(--bh-ink)',
                }}
              />
            )}
            {isSelected && (
              <span
                aria-hidden
                className="absolute top-2 right-2 font-mono text-[9px] tracking-[0.2em] uppercase px-1.5 py-[2px]"
                style={{
                  backgroundColor: 'var(--bh-ink)',
                  color: 'var(--bh-cream)',
                }}
              >
                active
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
