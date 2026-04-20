// Palette selector as a 2×2 Bauhaus tile grid (or 4×1 row). Each tile is a
// flat-color poster for its palette carrying a 5-swatch sample strip as
// proof of its flavor. Unselected tiles wear a hairline border; the selected
// tile wears a thicker border plus a small ink block flush with its top-
// right corner — quieter than the old "ACTIVE" text pill but reads at a
// glance because it connects to the border itself.

import { useRef } from 'react';
import { PALETTES, PALETTE_LABELS, type PaletteKey } from './PaletteGrid.js';

interface PaletteTilesProps {
  selected: PaletteKey;
  onSelect: (key: PaletteKey) => void;
  layout?: 'grid' | 'row';
}

const TILE_META: Record<PaletteKey, { tone: string; ink: string }> = {
  web: { tone: 'var(--bh-red)', ink: 'var(--bh-cream)' },
  x11: { tone: 'var(--bh-yellow)', ink: 'var(--bh-ink)' },
  pantone: { tone: 'var(--bh-blue)', ink: 'var(--bh-cream)' },
  crayola: { tone: 'var(--bh-ink)', ink: 'var(--bh-cream)' },
};

const ORDER: PaletteKey[] = ['web', 'x11', 'pantone', 'crayola'];

// Indicator square lives flush to the top-right corner when a tile is
// selected — same scale as a sample swatch (12px) so the visual language
// inside the tile is consistent.
const CORNER_SIZE = 14;

export function PaletteTiles({ selected, onSelect, layout = 'grid' }: PaletteTilesProps) {
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(key)}
            className={`relative flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${layout === 'row' ? 'p-[12px]' : 'p-4'}`}
            style={{
              backgroundColor: tone,
              color: ink,
              minHeight: layout === 'row' ? '88px' : '132px',
              boxShadow: isSelected
                ? 'inset 0 0 0 3px var(--bh-ink)'
                : 'inset 0 0 0 1px var(--bh-ink)',
            }}
          >
            {/* Title spans full width; upper-right corner is owned by the
                count (unselected) or the ink indicator (selected), so the
                two can't clash. The right padding on the title reserves
                the corner slot. */}
            <div
              className={`lowercase font-semibold tracking-[-0.02em] ${layout === 'row' ? 'text-base leading-none' : 'text-2xl'}`}
              style={{ color: ink, paddingRight: CORNER_SIZE + 8 }}
            >
              {PALETTE_LABELS[key]}
            </div>

            {layout === 'grid' && (
              <div
                className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-70 mt-1"
                style={{ color: ink }}
              >
                palette / {String(idx + 1).padStart(2, '0')}
              </div>
            )}

            {/* Sample strip pushed to the bottom; spacer above it. */}
            <div className={`flex gap-[2px] mt-auto ${layout === 'row' ? 'pt-3' : 'pt-4'}`} aria-hidden>
              {sample.map((hex, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length deterministic
                  key={i}
                  className="flex-1 h-3"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>

            {/* Upper-right corner — swaps between the entry count (idle)
                and a flush ink block (selected). Both absolute so the
                title above can claim full width. */}
            {isSelected ? (
              <span
                aria-hidden
                className="absolute top-0 right-0"
                style={{
                  width: CORNER_SIZE,
                  height: CORNER_SIZE,
                  backgroundColor: 'var(--bh-ink)',
                }}
              />
            ) : (
              <span
                aria-hidden
                className="absolute font-mono text-[10px] tracking-[0.15em] opacity-80"
                style={{
                  top: 6,
                  right: 8,
                  color: ink,
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
