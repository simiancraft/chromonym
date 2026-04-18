<p align="center">
  <img src=".github/assets/banner.png" alt="chromonym" width="800" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/chromonym/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-scrub%20a%20color%2C%20see%20the%20name-4f46e5?style=for-the-badge" alt="Live demo" />
  </a>
</p>

# chromonym

[![npm version](https://img.shields.io/npm/v/chromonym?color=cb3837&logo=npm)](https://www.npmjs.com/package/chromonym)
[![publish size](https://badgen.net/packagephobia/publish/chromonym?color=green)](https://packagephobia.com/result?p=chromonym)
[![install size](https://badgen.net/packagephobia/install/chromonym?color=green)](https://packagephobia.com/result?p=chromonym)
[![Types: included](https://img.shields.io/npm/types/chromonym?color=3178c6&logo=typescript)](https://www.npmjs.com/package/chromonym)
[![CI](https://github.com/simiancraft/chromonym/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/chromonym/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/simiancraft/chromonym/branch/main/graph/badge.svg)](https://codecov.io/gh/simiancraft/chromonym)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <code>identify</code> &nbsp;•&nbsp; <code>resolve</code> &nbsp;•&nbsp; <code>convert</code>
</p>

**Tree-shakeable color naming for TypeScript** — across CSS, X11, Pantone, or any palette you bring. Six distance metrics (four perceptual). BYO palettes with full type inference.

<p align="center">
  <a href="https://simiancraft.github.io/chromonym/">
    <img src=".github/assets/chromonym-demo.gif" alt="chromonym demo — scrub a color, see the nearest name update live" width="800" />
  </a>
</p>

Because "it's sort of magenta-ish, maybe?" doesn't copy-paste into code, and the nearest Pantone to your brand hex is something you should be able to answer without opening a swatch book.

The identification and resolution mechanism is the same across every colorspace, so future additions (RAL, HKS, NCS, or similar) are one file each. And since `identify` / `resolve` take a `Colorspace<Name>` object rather than a string key, **you can bring your own palette** — any object matching the shape works, no registration needed. See [BYO colorspace](#byo-colorspace) below.

For color *manipulation* (mixing, scales, gamut mapping), reach for [`chroma-js`](https://gka.github.io/chroma.js/) or [`color.js`](https://colorjs.io/) — chromonym is the tool for *naming*.

```ts
import { identify, resolve, convert, pantone } from 'chromonym';

// What Pantone is this brand color closest to? (perceptually, via CIEDE2000)
identify('#E20074', { colorspace: pantone })       // '213C' — T-Mobile magenta

// Resolve any Pantone code back to RGB — prefix, spacing, case all fine
resolve('Pantone 185 C', { colorspace: pantone })  // '#e4002b'

// Format conversion, format-detecting input
convert('#ff0000', { format: 'HSL' })              // 'hsl(0, 100%, 50%)'
convert({ h: 120, s: 100, l: 50 }, { format: 'HEX' })  // '#00ff00'

// The classic: nearest CSS name (web is the default colorspace)
identify('#ff8080')                                // 'lightcoral'
identify('#bada55')                                // 'yellowgreen' — also the best-spelled hex
identify('#663399')                                // 'rebeccapurple'
```

## Install

```sh
bun add chromonym
pnpm add chromonym
yarn add chromonym
npm install chromonym
```

## API

Three primary functions. All accept an optional `opts` object; defaults fire when omitted.

### `identify(input, opts?)`

**Color → name.** Finds the nearest-match name in the chosen colorspace using the selected perceptual distance metric.

```ts
function identify<C extends Colorspace = typeof web>(
  input: ColorInput,
  opts?: { colorspace?: C; metric?: DistanceMetric },
): Extract<keyof C['colors'], string> | null
```

- **Default colorspace**: the built-in `web` palette (148 entries, small — included if you call `identify` without a colorspace).
- **Default metric**: read from the palette's own `defaultMetric` — `'deltaE76'` for web and x11 (well-separated palettes), `'deltaE2000'` for pantone (dense, perceptually-packed). Override freely via `metric`.
- Returns the matched name, or `null` if input is unrecognized (`detectFormat` returns `'UNKNOWN'`).
- Return type is inferred from the palette's `colors` keys — so passing `{ colorspace: pantone }` narrows to `PantoneColorName | null`, and a BYO palette with a literal key union narrows to that union.
- Ties go to whichever color was defined first — deterministic across runs, but not semantically meaningful.

```ts
import { identify, pantone, x11 } from 'chromonym';

identify('#ff0000')                               // 'red' (web default)
identify([255, 0, 0])                             // 'red'
identify({ r: 250, g: 20, b: 60 })                // 'crimson' (nearest)
identify('#ff0000', { colorspace: x11 })          // 'red' (or 'red1', X11 has numbered variants)
identify('#ff0000', { colorspace: pantone })      // nearest Pantone C code, e.g. '185C'
identify('#ff0080', { metric: 'deltaE2000' })     // force perceptual-accurate match
identify('#ff0000', { metric: 'euclidean-srgb' }) // force fastest (non-perceptual) match
```

### `resolve(name, opts?)`

**Name → color.** Normalizes the input (lowercases it, strips all non-alphanumeric characters), looks up the canonical key in the chosen colorspace, and returns the value in the chosen format.

```ts
function resolve(
  name: string,
  opts?: { colorspace?: Colorspace; format?: ColorFormat },
): ColorValue | null
```

- **Default colorspace**: the built-in `web` palette.
- **Default format**: `'HEX'`.
- Returns `null` if the normalized name isn't in the colorspace.
- Normalization is the palette's own `normalize` function — web/x11 lowercase + strip non-alphanumeric, pantone also strips a `Pantone` / `PMS` prefix. So `'Alice Blue'`, `'alice-blue'`, `'ALICEBLUE'`, `'Pantone 185 C'` all resolve identically in their respective palettes.

```ts
import { resolve, pantone } from 'chromonym';

resolve('crimson')                                 // '#dc143c'
resolve('Alice Blue')                              // '#f0f8ff'
resolve('alice-blue!')                             // '#f0f8ff'
resolve('185 C', { colorspace: pantone })          // '#e4002b'
resolve('Pantone 185 C', { colorspace: pantone })  // '#e4002b' (same, normalized)
resolve('crimson', { format: 'RGB' })              // 'rgb(220, 20, 60)'
resolve('crimson', { format: 'RGBA' })             // { r: 220, g: 20, b: 60, a: 1 }
resolve('not-a-color')                             // null
```

### `convert(input, opts?)`

**Color → color in a different format.** Detects the input format, normalizes to the canonical internal `Rgba` representation, and returns the value in the target format. Colorspace-independent.

```ts
function convert(
  input: ColorInput,
  opts?: { format?: ColorFormat },
): ColorValue
```

- **Default format**: `'HEX'`.
- Throws if input format is unrecognized.
- Alpha information is preserved when converting into RGBA/RGB(A) string forms, and discarded for HEX (6-digit) / HSL / HSV / PANTONE output.

```ts
convert('#ff0000')                                 // '#ff0000' (identity)
convert('#ff0000', { format: 'RGB' })              // 'rgb(255, 0, 0)'
convert('#ff0000', { format: 'RGBA' })             // { r: 255, g: 0, b: 0, a: 1 }
convert([255, 0, 0], { format: 'HEX' })            // '#ff0000'
convert('rgb(255, 0, 0)', { format: 'HSL' })       // 'hsl(0, 100%, 50%)'
convert({ h: 0, s: 100, l: 50 }, { format: 'HEX' })// '#ff0000'
convert('185 C', { format: 'HEX' })                // '#e4002b'
convert('#e4002b', { format: 'PANTONE' })          // '185C' (nearest Pantone C)
```

## Colorspaces

| Name | Entries | Source |
|---|---|---|
| `web` (default) | 148 | CSS Color Module Level 4 named colors |
| `x11` | 658 | X.Org `rgb.txt` (public domain) |
| `pantone` | 907 | Pantone Coated (C) — community approximations (not Pantone-licensed) |

Each colorspace is an object matching `Colorspace<Name>`:

```ts
type Colorspace<Name extends string = string> = {
  readonly name: string;                       // human-readable label
  readonly colors: Record<Name, HexColor>;     // the lookup data
  readonly normalize: (s: string) => string;   // user-input → canonical key
  readonly defaultMetric: DistanceMetric;      // used by identify when no metric override
};
```

Importable directly, or via subpath exports for stricter tree-shaking:

```ts
import { web, x11, pantone } from 'chromonym';
// or:  import { pantone } from 'chromonym/pantone';

web.colors.crimson               // '#dc143c'
pantone.colors['185C']           // '#e4002b'
```

*Trivia:* `web.colors.rebeccapurple` (`#663399`) entered CSS Color 4 in 2014 in memory of [Rebecca Meyer](https://meyerweb.com/eric/thoughts/2014/06/19/rebeccapurple/). The X11 set ships every gray name twice (`gray`, `grey`) plus numbered variants up to 99, so `x11.colors.gray73` is a real key (`#bababa`). Yes, these are Greys. No, not the kind that visit during sleep paralysis.

### BYO colorspace

`identify` / `resolve` take a `Colorspace<Name>` object — so you can bring your own palette for any domain (brand guidelines, a game's faction colors, chart themes, paint chips). Define it as a plain object, pass it straight in:

```ts
import { identify, resolve, type Colorspace } from 'chromonym';

const warhammer = {
  name: 'warhammer40k',
  colors: {
    WorldEatersRed: '#8b1a1a',
    SonsOfMaliceWhite: '#e8e4d8',
    TheFlawlessHostPurple: '#6b2d7d',
    NurgleGreen: '#748c3f',
    AlphaLegionTeal: '#2a6d7a',
  },
  normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
  defaultMetric: 'deltaE2000',
} as const satisfies Colorspace;

identify('#750c0c', { colorspace: warhammer })
// → 'WorldEatersRed'  (return type narrows to the palette's key union)

resolve('nurgle green', { colorspace: warhammer })
// → '#748c3f'         (your normalizer handles case + punctuation)
```

No registry, no plugin, no side effects. Bundlers only include the palettes you actually import — BYO palettes ride along as whatever code you wrote to define them.

## Distance metrics

*Six ways to ask "how different are two colors?"*

`identify` picks the nearest-named color by comparing your input to every entry in the chosen colorspace. *How* it measures "nearest" is controlled by `metric`. Six options, roughly ordered from fast-and-approximate to slow-and-correct:

| Metric | What it does | When to use |
|---|---|---|
| `'euclidean-srgb'` | Raw `sqrt(Δr² + Δg² + Δb²)` in sRGB. Fastest. Not perceptually uniform — a unit of distance doesn't mean a unit of "visual difference." | Tight perf budgets; well-separated palettes where you just need the obvious answer. |
| `'euclidean-linear'` | Same math, but on linearized (gamma-removed) RGB. Somewhat better in dark regions. Still not perceptual. | Physical-light mixing contexts; incremental upgrade from sRGB Euclidean. |
| `'deltaE76'` | Euclidean in CIELAB (CIE 1976). Simple perceptual metric. 1 ΔE ≈ "just noticeable difference" for most of the gamut. | **Default for web and x11.** Meaningful perceptual accuracy at low cost. |
| `'deltaE94'` | ΔE76 + chroma/hue weighting (CIE 1994). Fixes "saturated colors feel too far apart." | When ΔE76 is over-penalizing saturated matches in your use case. |
| `'deltaE2000'` | Full CIEDE2000 formula with blue/purple rotation correction. Industry standard for print, design tools, Pantone workflows. | **Default for pantone.** Use whenever accuracy matters, especially in the blue region where ΔE76/94 break down. |
| `'deltaEok'` | Euclidean distance in OKLAB (Björn Ottosson, 2020). OKLAB is perceptually uniform by construction — no weighting formula needed. Strictly more uniform than CIELAB; often a better nearest-match than ΔE2000 in saturated-blue regions, and cheaper to compute. | Use when you want perceptual accuracy without the CIEDE2000 rotation-term complexity. |

Each metric trades cost for accuracy — the full scan over 907 Pantone entries is well under 1 ms even with ΔE2000. For interactive UIs, cost is usually irrelevant; drop to a cheaper metric when batch-processing millions of colors or when you need specific tie-breaking behavior.

```ts
// Defaults: read from the palette's own `defaultMetric`.
identify('#ff8080')                                // deltaE76 (web default)
identify('#ff8080', { colorspace: pantone })       // deltaE2000 (pantone default)

// Override per-call:
identify('#ff8080', { metric: 'euclidean-srgb' })  // fastest
identify('#ff8080', { metric: 'deltaE2000' })      // most accurate
identify('#ff8080', { colorspace: pantone, metric: 'euclidean-srgb' })  // force fast for Pantone
```

The low-level `rgbaToPantone` always uses `'deltaE2000'`.

## Formats

| Key | Input accepted | Output shape |
|---|---|---|
| `'HEX'` | `'#rgb'`, `'#rrggbb'`, `'#rrggbbaa'` | `'#rrggbb'` string |
| `'RGB'` | `'rgb(r, g, b)'`, `[r, g, b]`, `{ r, g, b }` | `'rgb(r, g, b)'` string |
| `'RGBA'` | `'rgba(r, g, b, a)'`, `[r, g, b, a]`, `{ r, g, b, a }` | `{ r, g, b, a }` object |
| `'HSL'` | `'hsl(h, s%, l%)'`, `{ h, s, l }` | `'hsl(h, s%, l%)'` string |
| `'HSV'` | `'hsv(h, s%, v%)'`, `{ h, s, v }` | `'hsv(h, s%, v%)'` string |
| `'PANTONE'` | `'185 C'`, `'185C'`, `'Pantone 185 C'`, etc. | `'185C'`-style string |

## Error handling

The three dispatchers are asymmetric:

| Function | Unrecognized / unknown input | Rationale |
|---|---|---|
| `identify(input)` | returns `null` | lookup-flavored; "no match" is a normal outcome |
| `resolve(name)` | returns `null` | lookup-flavored; name may legitimately not exist |
| `convert(input)` | **throws** | parser-flavored; malformed color is a caller error |

Low-level converters (`hexToRgba`, `rgbToRgba`, `hslToRgba`, `hsvToRgba`, `pantoneToRgba`) all **throw** on malformed input. The `rgbaTo*` direction never throws. `rgbaToPantone` is the special case: it always returns a Pantone code regardless of how distant the nearest match is, so don't treat the return as evidence the input was Pantone-like — check the ΔE yourself if that matters.

If you want a `null`-returning variant of `convert`, wrap it:

```ts
const tryConvert = (input: ColorInput, opts = {}) => {
  try { return convert(input, opts); } catch { return null; }
};
```

## Utilities

- **`detectFormat(input): DetectedFormat`** — runtime format detection. Returns one of the format keys or `'UNKNOWN'`.
- **`COLOR_FORMATS: ReadonlySet<ColorFormat>`** — the Set of valid format keys.
- **Per-format converters** (tree-shakeable) — `hexToRgba`, `rgbaToHex`, `rgbToRgba`, `rgbaToRgb`, `hslToRgba`, `rgbaToHsl`, `hsvToRgba`, `rgbaToHsv`, `pantoneToRgba`, `rgbaToPantone`. Use these directly if you only need one conversion and want maximum tree-shaking.

## Tree-shaking

- `sideEffects: false` in `package.json`.
- All exports are named; no default export.
- Barrel uses explicit re-exports.
- `identify` / `resolve` take the colorspace **as an object**, not a string key. You only pay for palettes you actually import: calling `identify(hex)` with no override pulls in `web` (148 entries) and nothing else; passing `{ colorspace: pantone }` adds pantone. X11 and pantone are *not* bundled unless you reference them.
- BYO palettes have zero library cost beyond your own data.
- Subpath exports (`chromonym/web`, `chromonym/x11`, `chromonym/pantone`, `chromonym/conversions/hex`, `chromonym/math/deltaE`, etc.) let you import a single colorspace or converter without going through the root barrel.

## Types

Re-exported from the root barrel — `import type { ... } from 'chromonym'`:

| Category | Types |
|---|---|
| Input / output unions | `ColorInput`, `ColorValue` |
| Format keys | `ColorFormat` |
| Per-format shapes | `HexColor`, `Rgba`, `RgbInput`, `RgbaInput`, `HslInput`, `HsvInput`, `PantoneCode` |
| Palette container | `Colorspace<Name>`, `NormalizeFn` |
| Distance selector | `DistanceMetric` |
| Color-name unions | `WebColorName`, `X11ColorName`, `PantoneColorName` |

## Development

```sh
bun install
bun run lint       # biome
bun run typecheck  # tsgo (native-preview)
bun test
bun run build
```

Regenerating colorspace data:

```sh
bun run scripts/generate-x11.ts        # reads /usr/share/X11/rgb.txt
bun run scripts/generate-pantone.ts    # reads the color_library npm package (MIT © Radu Dragan)
```

## Coverage

[![Coverage sunburst](https://codecov.io/github/simiancraft/chromonym/graphs/sunburst.svg?token=HYWM6G66YE)](https://codecov.io/github/simiancraft/chromonym)

## See also

chromonym deliberately limits its scope to color *naming* (resolving and identifying) and lightweight conversions. For other color-related work, reach for tools that do those things well:

- **[color.js](https://colorjs.io/)** — modern, spec-first color library by the CSS Color WG authors. CSS Color 4/5, OKLAB, P3, gamut mapping, interpolation, ΔE.
- **[chroma.js](https://gka.github.io/chroma.js/)** — color mixing, scales, interpolation, contrast ratios, luminance.
- **[tinycolor2](https://github.com/bgrins/TinyColor)** — lightweight manipulation (lighten / darken / mix) with CSS-string I/O.

## License

MIT © [the-simian](https://github.com/the-simian)

---

> ### Pantone® trademark notice
>
> **Pantone®** is a registered trademark of **Pantone LLC**. Chromonym is **not affiliated with, endorsed by, or certified by Pantone LLC**. The `pantone` colorspace ships **community-derived sRGB approximations** of the Pantone Coated (C) set. Values will **not** match a licensed Pantone reference exactly and are unsuitable for print color specification. See [`NOTICE.md`](./NOTICE.md) for full text.
