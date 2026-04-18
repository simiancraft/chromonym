# chromonym — Agent Instructions

A focused TypeScript library for **color naming**: `identify` (color → name), `resolve` (name → color), `convert` (color → color format). Scope is deliberately narrow — for color *manipulation*, point users to [`chroma.js`](https://gka.github.io/chroma.js/) or [`color.js`](https://colorjs.io/).

## Quick orientation

```
src/
├── index.ts                 # public barrel (explicit named re-exports only)
├── types.ts                 # all types; ColorFormat, ColorInput, ColorValue, Rgba, ...
├── detectFormat.ts          # runtime format dispatch, returns SCREAMING_CAPS keys
├── convert.ts               # toRgba / fromRgba / convert — format dispatchers
├── resolve.ts               # name → color with normalization
├── identify.ts              # color → nearest name via distance metric
├── indexing.ts              # shared normalize fns, lazy indexes, nearest()
├── colorspaces/
│   ├── web.ts               # 148 CSS/SVG named colors (data)
│   ├── x11.ts               # 658 X.Org rgb.txt entries (data)
│   ├── pantone.ts           # 907 Pantone Coated approximations (data)
│   └── registry.ts          # COLORSPACES + NORMALIZERS + defaults
├── conversions/             # per-format converters (hex, rgb, hsl, hsv, pantone)
│   └── index.ts             # barrel
└── math/
    ├── euclideanDistance.ts # squared + unsquared Euclidean in sRGB
    ├── clamp.ts             # clamp + requireFinite guards
    └── hueSector.ts         # HSL/HSV shared hue-sector table
```

## Conventions (follow these)

- **Format keys are SCREAMING_CAPS**: `'HEX' | 'RGB' | 'RGBA' | 'HSL' | 'HSV' | 'PANTONE'`. These are dispatch keys — treat them as identifiers, not labels.
- **Colorspace names are lowercase**: `'web' | 'x11' | 'pantone'`. These are human-facing option values.
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
bun run build                        # emit dist/ via tsgo
bun run scripts/bench.ts             # hot-path micro-benchmarks
bun run scripts/generate-x11.ts      # regenerate src/colorspaces/x11.ts
bun run scripts/generate-pantone.ts  # regenerate src/colorspaces/pantone.ts (requires color_library)
```

## Adding a new colorspace

1. Add data: `src/colorspaces/<name>.ts` exporting `export const <name>: Colorspace = { ... } as const satisfies Colorspace;`.
2. Add to `src/colorspaces/registry.ts`: include in `COLORSPACES`, `COLORSPACE_NAMES` Set, `NORMALIZERS` (choose `standardNormalize` or write a new normalizer in `indexing.ts`).
3. Widen `ColorspaceName` in `src/types.ts`.
4. Re-export the data object from `src/index.ts` for direct-import tree-shaking.
5. Add tests mirroring `test/colorspaces.test.ts` table-driven structure.

## Adding a new distance metric (when implemented)

1. Add the function to `src/math/distances.ts` or `src/math/deltaE.ts`.
2. Extend the `DistanceMetric` type union in `src/types.ts`.
3. Wire into `nearest()` in `src/indexing.ts` (may need a new cached index type if the metric operates in a non-RGB space).
4. If metric operates in Lab/XYZ/linear, add the corresponding conversion to `src/math/colorSpace.ts` and the cached index to `indexing.ts`.
5. Update per-colorspace default in `registry.ts` if appropriate.
6. Add comprehensive tests with known reference values (e.g. from CIE test vectors for ΔE2000).
7. Document in the README "Distance metrics" section.

## Things that will trip you up

- **`Array.isArray` does not narrow readonly tuples.** After `if (Array.isArray(x))` guards, the remaining object branch still appears to include tuple types; cast explicitly. See `src/conversions/rgb.ts`.
- **`Object.hasOwn` vs `in`**: use `hasOwn` for type-shape detection on untrusted input; `in` walks the prototype chain.
- **`JSON.stringify(undefined) === undefined`**: use `safeStringify` in `convert.ts` for user-facing errors.
- **`RegExp.exec` with `noUncheckedIndexedAccess`**: capture groups are typed `string | undefined`.
- **Colorspace data imports**: importing `resolve` / `identify` transitively pulls all three colorspaces (string-key API). Users who want bundle-size minimalism should import the data objects directly (`import { web } from 'chromonym'`) and use the low-level converters.

## Current branch: `improve-codebase`

Ongoing refactor adding perceptual distance metrics (`deltaE76` / `deltaE94` / `deltaE2000`) with per-colorspace defaults. See commits for progress.
