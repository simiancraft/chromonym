# chromonym

Identify, resolve, and convert colors across CSS, X11, and Pantone colorspaces.

```ts
import { identify, resolve, convert } from 'chromonym';

identify('#ff0000')                               // 'red'
resolve('crimson')                                // '#dc143c'
resolve('185 C', { colorspace: 'pantone' })       // '#e4002b'
convert('#ff0000', { format: 'RGB' })             // 'rgb(255, 0, 0)'
convert({ r: 255, g: 0, b: 0 }, { format: 'HSL' })// 'hsl(0, 100%, 50%)'
```

## Install

```sh
bun add chromonym
npm install chromonym
```

## API

Three primary functions. All accept an optional `opts` object; defaults fire when omitted.

### `identify(input, opts?)`

**Color → name.** Finds the nearest-match name in the chosen colorspace using Euclidean distance in RGB.

```ts
function identify(
  input: ColorInput,
  opts?: { colorspace?: ColorspaceName },
): string | null
```

- **Default colorspace**: `'web'`.
- Returns the matched name, or `null` if input is unrecognized (`detectFormat` returns `'UNKNOWN'`).
- Ties are broken by the first entry encountered in the colorspace data.

```ts
identify('#ff0000')                                // 'red'
identify([255, 0, 0])                              // 'red'
identify({ r: 250, g: 20, b: 60 })                 // 'crimson' (nearest)
identify('#ff0000', { colorspace: 'x11' })         // 'red' (or 'red1', X11 has numbered variants)
identify('#ff0000', { colorspace: 'pantone' })     // nearest Pantone C code, e.g. '185C'
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

## License

MIT © [the-simian](https://github.com/the-simian)
