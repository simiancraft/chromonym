// Palette selector as a 2×2 Bauhaus tile grid (or 4×1 row). Each tile is
// a flat-color poster for its palette with a three-row internal layout:
//
//   row 1:  selection indicator (left) · entry count (right)
//   row 2:  palette name (lowercase, full width)
//   row 3:  5-swatch sample strip
//
// The selection indicator is a small ink square that only renders when the
// tile is selected. When it's missing, the row still holds its space so the
// other rows don't jump. Unselected tiles wear a 1px inset border; the
// selected tile wears a 3px inset border — selection reads at a glance.

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
  // Crayola was --bh-ink (pure black), which hid the selection indicator
  // entirely (ink square on ink background). Swap in a saturated warm
  // orange — keeps the primary-poster look, sits in the fourth quadrant
  // next to red/yellow/blue, and gives the ink indicator somewhere to
  // be seen.
  crayola: { tone: '#E8751A', ink: 'var(--bh-ink)' },
  // NTC: cool muted green to sit apart from the warm quadrant (red,
  // yellow, orange); keeps the Bauhaus primary-poster feel without
  // crowding the existing tiles.
  ntc: { tone: '#3d7a5a', ink: 'var(--bh-cream)' },
  // XKCD: deep plum to fill the purple register no other tile holds.
  // Survey data has an irreverent character; the tone stays inside
  // the muted Bauhaus palette rather than going neon.
  xkcd: { tone: '#5c2a6b', ink: 'var(--bh-cream)' },
  // FS 595C: olive-drab, the signature color of US military coatings
  // and a real FS595C chip ('FS 34087' is close). Wears the ink label
  // (cream would float too bright on the muted military tone).
  fs595c: { tone: '#4a5a3a', ink: 'var(--bh-cream)' },
};

const ORDER: PaletteKey[] = ['web', 'x11', 'pantone', 'crayola', 'ntc', 'xkcd', 'fs595c'];

// Indicator square — same scale family as the sample swatches (h-3 ≈ 12px).
const INDICATOR = 12;

export function PaletteTiles({ selected, onSelect, layout = 'grid' }: PaletteTilesProps) {
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = ORDER.indexOf(selected);
    const nextIdx = (() => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          return (currentIdx + 1) % ORDER.length;
        case 'ArrowLeft':
        case 'ArrowUp':
          return (currentIdx - 1 + ORDER.length) % ORDER.length;
        case 'Home':
          return 0;
        case 'End':
          return ORDER.length - 1;
        default:
          return null;
      }
    })();
    if (nextIdx === null) return;
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
            className={`flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${layout === 'row' ? 'p-[12px] gap-2' : 'p-4 gap-3'}`}
            style={{
              backgroundColor: tone,
              color: ink,
              minHeight: layout === 'row' ? '92px' : '132px',
              // Unselected tiles lean on the 3px inked gap between tiles
              // (the grid's own background) for separation, so selection
              // reads as a real visual event — a 4px inset frame appears
              // around exactly one tile.
              boxShadow: isSelected ? 'inset 0 0 0 4px var(--bh-ink)' : 'none',
            }}
          >
            {/* Row 1 — selection indicator (left) · count (right). The
                indicator is sized to the row-3 swatch height and uses
                the tile's own ink token so it contrasts with whatever
                tone the tile runs. The slot is always rendered so
                unselected tiles keep the same row height. */}
            <div className="flex items-center justify-between">
              {isSelected ? (
                <span
                  aria-hidden
                  style={{
                    width: INDICATOR,
                    height: INDICATOR,
                    backgroundColor: ink,
                  }}
                />
              ) : (
                <span aria-hidden style={{ width: INDICATOR, height: INDICATOR }} />
              )}
              <span
                className="font-mono text-[10px] tracking-[0.15em] opacity-80"
                style={{ color: ink }}
              >
                {count}
              </span>
            </div>

            {/* Row 2 — palette name, full width. */}
            <div
              className={`lowercase font-semibold tracking-[-0.02em] leading-none ${layout === 'row' ? 'text-base' : 'text-2xl'}`}
              style={{ color: ink }}
            >
              {PALETTE_LABELS[key]}
            </div>

            {/* Row 3 — 5-swatch sample strip, pinned to the bottom. */}
            <div className="flex gap-[2px] mt-auto" aria-hidden>
              {sample.map((hex, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length deterministic
                  key={i}
                  className="flex-1 h-3"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
