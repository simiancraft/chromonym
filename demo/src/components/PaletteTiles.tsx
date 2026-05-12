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
  // FS 595B (older revision): darker brown-olive to sit visibly
  // apart from fs595c's mid-olive without jumping into a new hue
  // register. Reads as "same family, earlier revision."
  fs595b: { tone: '#3c3a2a', ink: 'var(--bh-cream)' },
  // ISCC-NBS: neutral medium gray, fitting for the science-y Munsell-
  // derived standard. Restrained, formal, and visually distinct from
  // the other poster tones.
  isccNbs: { tone: '#6f7373', ink: 'var(--bh-cream)' },
  // NBS: slightly warmer, darker gray than isccNbs to signal the
  // sibling relationship while keeping it visually distinguishable.
  // Matches the 'physical chip book' vs 'centroid computation' story.
  nbs: { tone: '#4d4843', ink: 'var(--bh-cream)' },
  // Resene: deep pohutukawa red, a signature NZ color nodding at the
  // palette's distinctly local flavor. Distinct from web's bh-red by
  // pulling toward crimson.
  resene: { tone: '#8a1e2b', ink: 'var(--bh-cream)' },
  // NCS: cool Nordic blue-gray evoking Scandinavian design language
  // the NCS system grew out of. Pulls toward steel, distinct from
  // pantone's saturated blue.
  ncs: { tone: '#3e5a78', ink: 'var(--bh-cream)' },
  // Pokémon: official Fire-type red-orange. The 18-color palette is
  // unmistakably pop-cultural; the tile leans into that with one of
  // its own canonical hues instead of trying to blend with the
  // Bauhaus-restrained tones above.
  pokemon: { tone: '#ee8130', ink: 'var(--bh-cream)' },
  // Werner: Berlin Blue (#7994b5) is the palette's central
  // characteristic blue — Werner's own "pure" blue, the one Darwin
  // would have pointed at on his card. Tile color signals the
  // historical-pigment register, distinct from web/x11 modern blues.
  werner: { tone: '#7994b5', ink: 'var(--bh-ink)' },
};

const ORDER: PaletteKey[] = [
  'web',
  'x11',
  'pantone',
  'crayola',
  'ntc',
  'xkcd',
  'fs595c',
  'fs595b',
  'isccNbs',
  'nbs',
  'resene',
  'ncs',
  'pokemon',
  'werner',
];

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

  // With 12 palettes, 4 cols × 3 rows (desktop) / 2 cols × 6 rows (mobile)
  // keeps each tile legible without monster squares. The `layout` prop used
  // to select between 'row' (compact strip) and 'grid' (poster grid); both
  // now use the same responsive shape since the compact-strip variant is
  // unused by the current demo. Kept in the type so reintroducing a strip
  // layout later doesn't need a prop-API change.
  void layout;
  const gridClass = 'grid grid-cols-2 sm:grid-cols-4 gap-[3px] p-[3px]';

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
            className={`flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${layout === 'row' ? 'p-[12px] gap-2' : 'p-3 gap-2'}`}
            style={{
              backgroundColor: tone,
              color: ink,
              minHeight: layout === 'row' ? '92px' : '104px',
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

            {/* Row 2 — palette name, full width. Font unified across both
                layouts at 'text-base'; with 12 tiles packed 4×3 the prior
                'text-2xl' on grid overpowered the panel and crowded the
                longest labels ('ISCC-NBS', 'FS 595B'). */}
            <div
              className="lowercase font-semibold tracking-[-0.02em] leading-none text-base"
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
