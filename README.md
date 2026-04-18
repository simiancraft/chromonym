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
[![bundle size](https://img.shields.io/bundlephobia/minzip/chromonym?label=gzip&color=44cc11)](https://bundlephobia.com/package/chromonym)
[![Types: included](https://img.shields.io/npm/types/chromonym?color=3178c6&logo=typescript)](https://www.npmjs.com/package/chromonym)
[![CI](https://github.com/simiancraft/chromonym/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/chromonym/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/simiancraft/chromonym/branch/main/graph/badge.svg)](https://codecov.io/gh/simiancraft/chromonym)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![semantic-release: conventional](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

**Tree-shakeable color naming for TypeScript.** Identify, resolve, and convert colors across CSS, X11, and Pantone — with 5 perceptual distance metrics. Add your own colorspaces and metrics as you need them.

<p align="center">
  <a href="https://simiancraft.github.io/chromonym/">
    <img src=".github/assets/chromonym-demo.gif" alt="chromonym demo — scrub a color, see the nearest name update live" width="800" />
  </a>
</p>

Built as a *color-strategy machine*: the identification and resolution mechanism is the same across every colorspace, so plugging in a new set (RAL, HKS, NCS, or a custom brand palette) is one file. For color *manipulation* (mixing, scales, gamut mapping), reach for [`chroma-js`](https://gka.github.io/chroma.js/) or [`color.js`](https://colorjs.io/) — chromonym is the tool for *naming*.

```ts
import { identify, resolve, convert } from 'chromonym';

// What Pantone is this brand color closest to? (perceptually, via CIEDE2000)
identify('#E20074', { colorspace: 'pantone' })     // '213C'

// Resolve any Pantone code back to RGB — prefix, spacing, case all fine
resolve('Pantone 185 C', { colorspace: 'pantone' })// '#e4002b'

// Format conversion, format-detecting input
convert('#ff0000', { format: 'HSL' })              // 'hsl(0, 100%, 50%)'
convert({ h: 120, s: 100, l: 50 }, { format: 'HEX' })  // '#00ff00'

// The classic: nearest CSS name
identify('#ff8080')                                // 'lightcoral'
```

## Install

```sh
bun add chromonym
npm install chromonym
```

## API

Three primary functions. All accept an optional `opts` object; defaults fire when omitted.

### `identify(input, opts?)`

**Color → name.** Finds the nearest-match name in the chosen colorspace using the selected perceptual distance metric.

```ts
function identify(
  input: ColorInput,
  opts?: { colorspace?: ColorspaceName; metric?: DistanceMetric },
): string | null
```

- **Default colorspace**: `'web'`.
- **Default metric**: picked per colorspace — `'deltaE76'` for web and x11 (well-separated palettes), `'deltaE2000'` for pantone (dense, perceptually-packed). Override freely via `metric`.
- Returns the matched name, or `null` if input is unrecognized (`detectFormat` returns `'UNKNOWN'`).
- Ties are broken by the first entry encountered in the colorspace data.

```ts
identify('#ff0000')                                // 'red'
identify([255, 0, 0])                              // 'red'
identify({ r: 250, g: 20, b: 60 })                 // 'crimson' (nearest)
identify('#ff0000', { colorspace: 'x11' })         // 'red' (or 'red1', X11 has numbered variants)
identify('#ff0000', { colorspace: 'pantone' })     // nearest Pantone C code, e.g. '185C'
identify('#ff0080', { metric: 'deltaE2000' })      // force perceptual-accurate match
identify('#ff0000', { metric: 'euclidean-srgb' })  // force fastest (non-perceptual) match
```

### `resolve(name, opts?)`

**Name → color.** Normalizes the input (lowercases it, strips all non-alphanumeric characters), looks up the canonical key in the chosen colorspace, and returns the value in the chosen format.

```ts
function resolve(
  name: string,
  opts?: { colorspace?: ColorspaceName; format?: ColorFormat },
): ColorValue | null
```

- **Default colorspace**: `'web'`.
- **Default format**: `'HEX'`.
- Returns `null` if the normalized name isn't in the colorspace.
- Normalization lets users pass `'Alice Blue'`, `'alice-blue'`, `'ALICEBLUE'`, `'Pantone 185 C'` etc. — all resolved identically.

```ts
resolve('crimson')                                 // '#dc143c'
resolve('Alice Blue')                              // '#f0f8ff'
resolve('alice-blue!')                             // '#f0f8ff'
resolve('185 C', { colorspace: 'pantone' })        // '#e4002b'
resolve('Pantone 185 C', { colorspace: 'pantone' })// '#e4002b' (same, normalized)
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
| `'web'` (default) | 148 | CSS Color Module Level 4 named colors |
| `'x11'` | 658 | X.Org `rgb.txt` (public domain) |
| `'pantone'` | 907 | Pantone Coated (C) — community approximations (not Pantone-licensed) |

Each colorspace is a pure data object: `Record<string, HexColor>`. Importable directly:

```ts
import { web, x11, pantone } from 'chromonym';
web.crimson                      // '#dc143c'
```

## Distance metrics

`identify` picks the nearest-named color by comparing your input to every entry in the chosen colorspace. *How* it measures "nearest" is controlled by `metric`. Five options, roughly ordered from fast-and-approximate to slow-and-correct:

| Metric | What it does | When to use |
|---|---|---|
| `'euclidean-srgb'` | Raw `sqrt(Δr² + Δg² + Δb²)` in sRGB. Fastest. Not perceptually uniform — a unit of distance doesn't mean a unit of "visual difference." | Tight perf budgets; well-separated palettes where you just need the obvious answer. |
| `'euclidean-linear'` | Same math, but on linearized (gamma-removed) RGB. Somewhat better in dark regions. Still not perceptual. | Physical-light mixing contexts; incremental upgrade from sRGB Euclidean. |
| `'deltaE76'` | Euclidean in CIELAB (CIE 1976). Simple perceptual metric. 1 ΔE ≈ "just noticeable difference" for most of the gamut. | **Default for web and x11.** Sweet spot: meaningful perceptual accuracy, low cost. |
| `'deltaE94'` | ΔE76 + chroma/hue weighting (CIE 1994). Fixes "saturated colors feel too far apart." | When ΔE76 is over-penalizing saturated matches in your use case. |
| `'deltaE2000'` | Full CIEDE2000 formula with blue/purple rotation correction. Industry standard for print, design tools, Pantone workflows. | **Default for pantone.** Use whenever accuracy matters, especially in the blue region where ΔE76/94 break down. |
| `'deltaEok'` | Euclidean distance in OKLAB (Björn Ottosson, 2020). OKLAB is perceptually uniform by construction — no weighting formula needed. Strictly more uniform than CIELAB; often a better nearest-match than ΔE2000 in saturated-blue regions, and cheaper to compute. | Modern default if you want perceptual accuracy without the CIEDE2000 rotation-term complexity. |

Each metric trades cost for accuracy — the full scan over 907 Pantone entries is well under 1 ms even with ΔE2000, so for interactive UIs there's no practical reason not to use the most accurate metric. Batch-processing millions of colors is where you'd drop down.

```ts
// Defaults: deltaE76 for web/x11, deltaE2000 for pantone.
identify('#ff8080')                                // deltaE76 (web default)
identify('#ff8080', { colorspace: 'pantone' })     // deltaE2000 (pantone default)

// Override per-call:
identify('#ff8080', { metric: 'euclidean-srgb' })  // fastest
identify('#ff8080', { metric: 'deltaE2000' })      // most accurate
identify('#ff8080', { colorspace: 'pantone', metric: 'euclidean-srgb' })  // force fast for Pantone
```

The low-level `rgbaToPantone` always uses `'deltaE2000'` — appropriate for Pantone matching, where this is what the industry tools use.

## Formats

Format keys are SCREAMING_CAPS — they are used as dispatch keys internally.

| Key | Input accepted | Output shape |
|---|---|---|
| `'HEX'` | `'#rgb'`, `'#rrggbb'`, `'#rrggbbaa'` | `'#rrggbb'` string |
| `'RGB'` | `'rgb(r, g, b)'`, `[r, g, b]`, `{ r, g, b }` | `'rgb(r, g, b)'` string |
| `'RGBA'` | `'rgba(r, g, b, a)'`, `[r, g, b, a]`, `{ r, g, b, a }` | `{ r, g, b, a }` object |
| `'HSL'` | `'hsl(h, s%, l%)'`, `{ h, s, l }` | `'hsl(h, s%, l%)'` string |
| `'HSV'` | `'hsv(h, s%, v%)'`, `{ h, s, v }` | `'hsv(h, s%, v%)'` string |
| `'PANTONE'` | `'185 C'`, `'185C'`, `'Pantone 185 C'`, etc. | `'185C'`-style string |

The runtime set `COLOR_FORMATS` is exported for enumeration / membership checks.

## Error handling

The three dispatchers are asymmetric — chosen deliberately, but worth knowing:

| Function | Unrecognized / unknown input | Rationale |
|---|---|---|
| `identify(input)` | returns `null` | lookup-flavored; "no match" is a normal outcome |
| `resolve(name)` | returns `null` | lookup-flavored; name may legitimately not exist |
| `convert(input)` | **throws** | parser-flavored; malformed color is a caller error |

Low-level converters (`hexToRgba`, `rgbToRgba`, `hslToRgba`, `hsvToRgba`, `pantoneToRgba`) all **throw** on malformed input. The `rgbaTo*` direction never throws. The nearest-match returner `rgbaToPantone` always returns *some* Pantone code.

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
- Importing `{ resolve }` or `{ identify }` pulls in all three colorspaces (necessary for the string-keyed `colorspace` option). For strict tree-shaking of colorspace data, use the low-level converters and colorspace objects directly.

## Types

All types are re-exported from the root:

```ts
import type {
  ColorInput, ColorValue, ColorFormat, ColorspaceName,
  HexColor, Rgba, RgbInput, RgbaInput, HslInput, HsvInput, PantoneCode,
  Colorspace,
  WebColorName, X11ColorName, PantoneColorName,
} from 'chromonym';
```

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
bun run scripts/generate-pantone.ts    # reads color_library (MIT dependency)
```

## Coverage

[![Coverage sunburst](https://codecov.io/github/simiancraft/chromonym/graphs/sunburst.svg?token=HYWM6G66YE)](https://codecov.io/github/simiancraft/chromonym)

Each ring is a directory; each leaf is a file. Green is covered, red is gaps.

## See also

chromonym deliberately limits its scope to color *naming*. For other color-related work, reach for tools that do those things well:

- **[color.js](https://colorjs.io/)** — modern, spec-first color library by the CSS Color WG authors. CSS Color 4/5, OKLAB, P3, gamut mapping, interpolation, ΔE.
- **[chroma.js](https://gka.github.io/chroma.js/)** — color mixing, scales, interpolation, contrast ratios, luminance.
- **[tinycolor2](https://github.com/bgrins/TinyColor)** — lightweight manipulation (lighten / darken / mix) with CSS-string I/O.

## License

MIT © [the-simian](https://github.com/the-simian)

---

> ### Pantone® trademark notice
>
> **Pantone®** is a registered trademark of **Pantone LLC**. Chromonym is **not affiliated with, endorsed by, or certified by Pantone LLC**. The `pantone` colorspace ships **community-derived sRGB approximations** of the Pantone Coated (C) set. Values will **not** match a licensed Pantone reference exactly and are unsuitable for print color specification. See [`NOTICE.md`](./NOTICE.md) for full text.
