// Reusable palette visualizer — selector + scrollable swatch grid + selection.
// Zero external deps; the swatch is a plain <button> (or a <div> in readOnly
// mode), the grid a flex-wrap. Shared by the translator (both sides) and the
// eyedropper (result-only).

import {
  carc,
  copic,
  crayola,
  farrowBall,
  fs595b,
  fs595c,
  isccNbs,
  japanese,
  material,
  milStd101c,
  milStd709d,
  milStd2525d,
  munsell,
  nbs,
  ncs,
  ntc,
  pantone,
  pokemon,
  prismacolor,
  ral,
  resene,
  tailwind,
  tcca,
  tioh,
  usMilitary,
  uswds,
  web,
  werner,
  x11,
  xkcd,
} from 'chromonym';
// React Compiler (see demo/vite.config.ts) auto-memoizes the derived
// entries / highlight-set values below and the Swatch component itself,
// so this file doesn't reach for memo / useMemo directly.

// `as const` is load-bearing: it preserves each palette's literal name union
// through `PALETTES[k].colors`, so `Object.entries(...)` downstream doesn't
// decay to `string[]`. Without this the demo would need an `as Record<string,
// string>` laundered cast at every lookup site — exactly what chromonym's
// `Palette<Name>` generics exist to eliminate.
export const PALETTES = {
  web,
  x11,
  pantone,
  copic,
  prismacolor,
  crayola,
  farrowBall,
  ntc,
  xkcd,
  japanese,
  carc,
  fs595c,
  fs595b,
  tcca,
  tioh,
  isccNbs,
  munsell,
  nbs,
  resene,
  ncs,
  pokemon,
  werner,
  tailwind,
  ral,
  material,
  uswds,
  milStd101c,
  milStd709d,
  milStd2525d,
  usMilitary,
} as const;
export type PaletteKey = keyof typeof PALETTES;

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  web: 'CSS / web',
  x11: 'X11',
  pantone: 'Pantone',
  copic: 'Copic',
  prismacolor: 'Prismacolor',
  crayola: 'Crayola',
  farrowBall: 'Farrow & Ball',
  ntc: 'NTC',
  xkcd: 'XKCD',
  japanese: 'Japanese traditional',
  carc: 'CARC coatings',
  fs595c: 'FS 595C',
  fs595b: 'FS 595B',
  tcca: 'TCCA textile cards',
  tioh: 'TIOH heraldic yarns',
  isccNbs: 'ISCC-NBS',
  munsell: 'Munsell renotation',
  nbs: 'NBS',
  resene: 'Resene',
  ncs: 'NCS',
  pokemon: 'Pokémon',
  werner: "Werner's (1821)",
  tailwind: 'Tailwind',
  ral: 'RAL Classic',
  material: 'Material Design 3',
  uswds: 'USWDS',
  milStd101c: 'MIL-STD-101C',
  milStd709d: 'MIL-STD-709D',
  milStd2525d: 'MIL-STD-2525D',
  usMilitary: 'US military identity',
};

// Short demo-side descriptions surfaced in the palette-picker panel. Kept in
// the demo (not on the library's Palette type) so we don't pay bundle-size
// cost for a field every consumer can read on hover via JSDoc anyway.
export const PALETTE_DESCRIPTIONS: Record<PaletteKey, string> = {
  web: "CSS Color Module Level 4. The default palette; what browsers recognize in `color: red;` declarations.",
  x11: "X.Org rgb.txt from the UNIX graphical stack. 658 entries including dense gray ramps (gray 0 through gray 100).",
  pantone: "Pantone Coated (C). Print-industry codes like '185 C'; community-approximated sRGB values, not Pantone-licensed.",
  copic: "Copic Sketch markers. The complete 358-color range keyed by codes like 'B01' and 'YG03'; community sRGB approximations.",
  prismacolor: "Prismacolor Premier colored pencils. The 150-color set keyed by codes like 'PC901'; community-scanned sRGB approximations.",
  crayola: "Crayola crayon colors. The classic 64-standard box plus fluorescent neons and selected modern additions.",
  farrowBall: 'Farrow & Ball paint colors. 132 named, approximate screen values from an unofficial open-web color book.',
  ntc: "Chirag Mehta's 'Name That Color' dataset. 1566 broad-coverage design / UI / hardware names CSS and X11 don't reach.",
  xkcd: "The 2010 XKCD Color Survey. Crowd-sourced common-speech names (923 entries), CC0 public domain.",
  japanese: 'Traditional Japanese colors keyed by Hepburn romanization, including Sakura-iro, Ainezumi, and Kōbai-iro.',
  carc: 'Chemical Agent Resistant Coating colors for U.S. military vehicles and equipment, keyed by the names in MIL-DTL-53039E.',
  fs595c: "US Federal Standard 595C paint chips (682 entries). Military, aviation, and government-equipment coatings.",
  fs595b: "Federal Standard 595B, the 1989 predecessor to FS 595C. Many shared codes have different hex across the two revisions.",
  tcca: 'The 1946 NBS measurements of 238 silk colors from the ninth-edition TCCA Standard Color Card of America and U.S. Army Color Card.',
  tioh: "The Institute of Heraldry's 45 common yarn colors for U.S. military insignia, ribbons, flags, and embroidery, keyed by cable number.",
  isccNbs: "ISCC-NBS Method of Designating Colors (1955). 260 Munsell-partitioned named blocks; sRGB centroids by Paul Centore.",
  munsell: "Munsell renotation real colors. 2734 hue/value/chroma notations from RIT's public-domain xyY data, converted and gamut-clamped to sRGB.",
  nbs: "Alternate NBS digitization: same 1955 vocabulary as isccNbs, different sRGB values matching the physical chip book.",
  resene: "Resene Paints (New Zealand) catalog. 1378 named coatings with te reo Māori and NZ place-names.",
  ncs: "Natural Colour System (Sweden). Perceptual codes like '2030-R80B' describing blackness, chromaticness, and hue.",
  pokemon: 'The 18 canonical Pokémon type colors (Normal through Fairy). Tiny, iconic, useful as a chart theme. Nominative reference, not an official asset set.',
  werner: "Werner's Nomenclature of Colours (1821), the historical pigment reference Patrick Syme adapted from Abraham Werner and Darwin carried on the Beagle. 110 names with natural-history exemplars; hex values via Rougeux's CC-BY digitization.",
  tailwind: "Tailwind CSS default theme (v4.0). 22 hue families × 11 shades = 242 entries with keys matching the Tailwind class suffix ('slate-500', 'rose-950'). sRGB values converted from v4.0's OKLCH spec.",
  ral: "RAL Classic (RAL gGmbH, Bonn). 216 European industrial / architectural coatings keyed by RAL code ('RAL 1003', 'RAL 9011'). Pantone analog for European product, paint, and signage work; nominative reference, not a licensed RAL product.",
  material: "Material Design 3 baseline system color roles. 98 light and dark scheme tokens with keys like 'light-primary' and 'dark-on-surface'.",
  uswds: "U.S. Web Design System, the GSA's design system for federal websites. 461 system tokens keyed by name ('blue-60v', 'gray-cool-30'); grades 50 apart meet WCAG AA contrast. Public domain.",
  milStd101c: 'MIL-STD-101C pipeline and compressed-gas-cylinder identification colors. Ten names distinguish material hazards and support cylinder segregation.',
  milStd709d: 'MIL-STD-709D ammunition color coding. Eighteen Tier II names identify explosive, chemical, incendiary, practice, inert, and other ammunition roles.',
  milStd2525d: "MIL-STD-2525D Joint Military Symbology. The 20 colors map symbols use for standard identity: hostile, friend, neutral, unknown, and civilian, each in dark, medium, light, and unfilled.",
  usMilitary: 'Identity colors published by the U.S. Army, Department of the Air Force, and Department of War. 31 named colors from official brand and trademark guidance.',
};

export const PALETTE_KEYS = [
  'web',
  'x11',
  'pantone',
  'copic',
  'prismacolor',
  'crayola',
  'farrowBall',
  'ntc',
  'xkcd',
  'japanese',
  'carc',
  'fs595c',
  'fs595b',
  'tcca',
  'tioh',
  'isccNbs',
  'munsell',
  'nbs',
  'resene',
  'ncs',
  'pokemon',
  'werner',
  'tailwind',
  'ral',
  'material',
  'uswds',
  'milStd101c',
  'milStd709d',
  'milStd2525d',
  'usMilitary',
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

  // React Compiler auto-memoizes these derived values. pantone's 907
  // tuples and the highlightSet get stable identity automatically as
  // long as their inputs (`palette`, `highlightedNames`) are unchanged.
  const entries = Object.entries(palette.colors) as Array<[string, string]>;
  const highlightSet = new Set(highlightedNames ?? []);

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

// React Compiler auto-memoizes Swatch; pantone's 907 swatches only
// re-render when their own props flip (selected/highlighted/rank),
// not when the parent re-renders for an unrelated reason.
function Swatch({
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
}
