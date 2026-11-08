# chromonym — Agent Instructions

A focused TypeScript library for **color naming**: `identify` (color → name), `resolve` (name → color), `convert` (color → color format). Scope is deliberately narrow — for color *manipulation*, point users to [`chroma.js`](https://gka.github.io/chroma.js/) or [`color.js`](https://colorjs.io/).

The goal is to be the definitive map from what people see to what they call it: a color's name in CSS, in a paint catalog, in a military standard, or in everyday speech ("Pikachu yellow"). New named-color vocabularies are welcome (see Palette data provenance); utilities stay only where they serve naming and lookup.

## Quick orientation

```
src/
├── index.ts                 # public barrel (explicit named re-exports only)
├── types.ts                 # all types; ColorFormat, ColorInput, ColorValue, Rgba, Palette<Name>, ...
├── detectFormat.ts          # runtime format dispatch, returns SCREAMING_CAPS keys
├── convert.ts               # toRgba / fromRgba / convert — format dispatchers
├── resolve.ts               # name → color, defaults to web palette
├── identify.ts              # color → nearest name, defaults to web palette
├── indexing.ts              # lazy indexes (WeakMap keyed on Palette), nearest()
├── palettes/
│   ├── normalize.ts         # standardNormalize, pantoneNormalize (zero imports)
│   ├── web.ts               # 148 CSS/SVG colors — Palette wrapper over webColors
│   ├── x11.ts               # 658 X.Org rgb.txt entries — Palette wrapper
│   ├── pantone.ts           # 907 Pantone Coated approximations — Palette wrapper
│   └── <name>.ts            # one file per built-in palette; no barrel, src/index.ts re-exports each
├── conversions/             # per-format converters (hex, rgb, hsl, hsv, pantone); no barrel
└── math/
    ├── euclideanDistance.ts # squared + unsquared Euclidean in sRGB
    ├── colorSpace.ts        # sRGB, linear, XYZ, Lab, OKLab, and OKLCH conversions
    ├── deltaE.ts            # ΔE76, ΔE94, ΔE2000, and ΔEok
    ├── editDistance.ts      # fuzzy name matching for resolve's k option
    ├── clamp.ts             # clamp + requireFinite guards
    └── hueSector.ts         # HSL/HSV shared hue-sector table
```

## Conventions (follow these)

- **Format keys are SCREAMING_CAPS**: `'HEX' | 'RGB' | 'RGBA' | 'HSL' | 'HSV'`. These are dispatch keys — treat them as identifiers, not labels. `convert` also accepts `'NAME'` when a `palette` option is supplied (exact reverse lookup).
- **Palettes are objects, not strings**: `identify` / `resolve` take a `Palette<Name>` object (import `web`, `x11`, `pantone` — or BYO). There is **no** registry of string keys to look up. Each palette carries its own `name`, `colors`, `normalize`, and `defaultMetric`.
- **Canonical internal representation**: `Rgba = { r: number; g: number; b: number; a: number }`. All paths normalize to this.
- **Error semantics**:
  - Low-level converters (`hexToRgba` etc.) **throw** on malformed input.
  - `convert` **throws** on unrecognized input (parser-flavored).
  - `identify` / `resolve` return **`null`** (lookup-flavored).
  - Document any deviation in the README error-handling section.
- **Tree-shake contract**: `sideEffects: false`. Never add module-scope `console.log` or init-time computation. Barrels use explicit named re-exports.
- **Tests**: `test/` mirrors `src/`. Each source file has tests. `100%` line + function coverage is the target.
- **Commits**: Conventional Commits (`feat(scope): ...`, `fix:`, `refactor:`, `chore:`, `docs:`). Include measured improvement in perf-related commit bodies.
- **Do NOT** attribute AI co-authorship on commits.

## Common commands

```sh
bun test                             # run suite
bun test --coverage                  # coverage report (target 100%)
bun run typecheck                    # tsc --noEmit
bun run lint                         # biome check
bun run lint:fix                     # biome check --write
bun run check:eslint                 # eslint-plugin-react-compiler on demo/src
bun run check                        # full pre-PR gate (lint, eslint, typechecks, build, tests, demo build, knip, packaging)
bun run build                        # emit dist/ via tsc
bun run scripts/bench.ts             # hot-path micro-benchmarks
```

The demo has its own deps; before the first `check`, `check:eslint`, or `demo` run, do `cd demo && bun install`.

## Palette data provenance

Ship a palette when you can name an open-web source for it and its owner has no record of taking down redistributed color data.

- Record the source, its version or date, and its stated terms (or "none stated") in the palette's doc comment and its `NOTICE.md` section.
- Describe the values honestly: *reproduced* (copied as published), *converted* (computed from published measurements), or *approximate* (screen values for physical colors, including vendor values taken from a third-party dataset). Never present community values as official.
- Never copy a vendor's paid or gated product: swatch files, SDKs, apps, or anything behind a login.
- Give attribution wherever a source's license asks for it (CC BY-SA, for example).
- Pantone is frozen: the existing `pantone` palette stays as it is, and no Pantone values are added. Pantone LLC has had redistributed copies of its libraries taken down (2022, 2024).
- If a rights holder asks for removal, remove the palette in the next release and record it under "Removed palettes" in `NOTICE.md`.
- Do not park or close a palette request over licensing alone. When a case is borderline, ship it and flag the uncertainty in the pull request; the maintainer decides.

## Adding a new built-in palette

1. Add data at `src/palettes/<name>.ts`:
   ```ts
   import type { Palette } from '../types.js';
   import { standardNormalize } from './normalize.js';  // or pantoneNormalize / custom

   const <name>Colors = { /* key: '#hex', ... */ } as const;
   export type <Name>ColorName = keyof typeof <name>Colors;
   export const <name> = {
     name: '<name>',
     colors: <name>Colors,
     normalize: standardNormalize,
     defaultMetric: 'deltaE76',  // pick a sensible default per palette density
   } as const satisfies Palette<<Name>ColorName>;
   ```
2. Re-export the palette and its name type from `src/index.ts`; there is no palettes barrel.
3. Add a subpath export in `package.json`, mirroring `./web`; a camelCase file gets a kebab-case subpath (`./iscc-nbs` for `isccNbs.ts`).
4. Add a row to the table in `test/palettes.test.ts`, and the subpath to both checks in `test/subpathExports.test.ts` (the `dist/` import test and the Node ESM script with its expected output).
5. Register it in the demo: `PALETTES`, `PALETTE_LABELS`, `PALETTE_DESCRIPTIONS`, and `PALETTE_KEYS` in `demo/src/components/PaletteGrid.tsx`, and a tone plus an `ORDER` entry in `demo/src/components/PaletteTiles.tsx`.
6. Document it: a row in the README palette table, the palette count and list in the README introduction, the table heading, and the `package.json` description, and a `NOTICE.md` section (see Palette data provenance).
7. No registry to update; `identify` and `resolve` accept the object directly.

## BYO palette (user-facing)

Users can ship their own `Palette<Name>` objects without touching the library — document this in the README "BYO palette" section when relevant. A custom normalizer is any `(s: string) => string`; the simplest is `(s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')`.

## Adding a new distance metric (when implemented)

1. Add the function to `src/math/distances.ts` or `src/math/deltaE.ts`.
2. Extend the `DistanceMetric` type union in `src/types.ts`.
3. Wire into `nearest()` in `src/indexing.ts` (may need a new cached index type if the metric operates in a non-RGB space).
4. If metric operates in Lab/XYZ/linear, add the corresponding conversion to `src/math/colorSpace.ts` and the cached index to `indexing.ts`.
5. Update per-palette `defaultMetric` in the relevant `src/palettes/<name>.ts` if appropriate.
6. Add comprehensive tests with known reference values (e.g. from CIE test vectors for ΔE2000).
7. Document in the README "Distance metrics" section.

## Things that will trip you up

- **`Array.isArray` does not narrow readonly tuples.** After `if (Array.isArray(x))` guards, the remaining object branch still appears to include tuple types; cast explicitly. See `src/conversions/rgb.ts`.
- **`Object.hasOwn` vs `in`**: use `hasOwn` for type-shape detection on untrusted input; `in` walks the prototype chain.
- **`JSON.stringify(undefined) === undefined`**: use `safeStringify` in `convert.ts` for user-facing errors.
- **`RegExp.exec` with `noUncheckedIndexedAccess`**: capture groups are typed `string | undefined`.
- **Palette data imports**: `identify` / `resolve` only pull the built-in `web` palette by default (it's their default palette). Passing `{ palette: pantone }` adds pantone to the bundle; `x11` is never included unless imported. Users wanting strict minimal bundles can import a palette via its subpath (`chromonym/pantone`) to skip the root barrel entirely.
