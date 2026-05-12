# chromonym — Agent Instructions

A focused TypeScript library for **color naming**: `identify` (color → name), `resolve` (name → color), `convert` (color → color format). Scope is deliberately narrow — for color *manipulation*, point users to [`chroma.js`](https://gka.github.io/chroma.js/) or [`color.js`](https://colorjs.io/).

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
│   └── index.ts             # barrel
├── conversions/             # per-format converters (hex, rgb, hsl, hsv, pantone)
│   └── index.ts             # barrel
└── math/
    ├── euclideanDistance.ts # squared + unsquared Euclidean in sRGB
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
bun run typecheck                    # tsgo --noEmit
bun run lint                         # biome check
bun run lint:fix                     # biome check --write
bun run check:eslint                 # eslint-plugin-react-compiler on demo/src
bun run check                        # full pre-PR gate (lint, eslint, typechecks, build, tests, demo build, knip, packaging)
bun run build                        # emit dist/ via tsgo
bun run scripts/bench.ts             # hot-path micro-benchmarks
bun run scripts/generate-x11.ts      # regenerate src/palettes/x11.ts
bun run scripts/generate-pantone.ts  # regenerate src/palettes/pantone.ts (requires color_library)
```

The demo has its own deps; before the first `check`, `check:eslint`, or `demo` run, do `cd demo && bun install`.

## Adding a new built-in palette

1. Add data at `src/palettes/<name>.ts`:
   ```ts
   import type { Palette } from '../types';
   import { standardNormalize } from './normalize';  // or pantoneNormalize / custom

   const <name>Colors = { /* key: '#hex', ... */ } as const;
   export type <Name>ColorName = keyof typeof <name>Colors;
   export const <name> = {
     name: '<name>',
     colors: <name>Colors,
     normalize: standardNormalize,
     defaultMetric: 'deltaE76',  // pick a sensible default per palette density
   } as const satisfies Palette<<Name>ColorName>;
   ```
2. Re-export from `src/palettes/index.ts` and `src/index.ts`.
3. Add subpath export in `package.json` (mirror `./web`, `./x11`, `./pantone`).
4. Add tests mirroring `test/palettes.test.ts` table-driven structure.
5. No registry to update — `identify` / `resolve` accept the object directly.

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
