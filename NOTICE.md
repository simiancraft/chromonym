# Notices and Trademarks

## Pantone®

**Pantone®** is a registered trademark of **Pantone LLC**. Chromonym is
**not affiliated with, endorsed by, licensed by, or certified by Pantone
LLC**.

The `pantone` palette in this library ships **community-derived sRGB
approximations** of the Pantone Coated (C) color set, sourced from
[`color_library`](https://github.com/draganradu/color_library) (MIT © Radu
Dragan). These values:

- Are **not official Pantone measurements** and will not match a licensed
  Pantone reference (physical chips, Pantone Connect, or the Pantone SDK)
  exactly.
- Are intended for on-screen reference, nearest-name identification, and
  general tooling — **not for print color specification**.
- Use standard color codes (e.g. `185 C`) as **nominative references** to
  publicly identified Pantone colors. No endorsement or claim of accuracy
  is implied.

### Accuracy envelope

The approximations are closest for mid-chroma colors under a D65 / 2°
observer. As a rough guide:

- **Mid-chroma Pantones**: ΔE*00 ≲ 5 versus Pantone's own sRGB previews.
  Usable for nearest-name identification and comparative swatch UI.
- **Saturated edges**: ΔE*00 commonly 5–10, higher in the deep-blue and
  blue-violet region (~2736 C through ~2746 C). `identify` will still
  converge on a plausible neighbor, but the *which* can depend on metric
  choice — see the "Distance metrics" section of the README.
- **Fluorescents (801 C – 814 C)** and the **metallic series (8xxx C)**
  are defined outside the sRGB gamut. Their sRGB approximations are
  perceptually wrong by construction — the physical inks can't be
  reproduced on a standard monitor. Do not use these values as a
  reference for brand-critical matching; identify carefully or skip.
- **Neons / warm reds** clipping against the sRGB gamut boundary (Pantone
  Red 032 / Warm Red / Red 021 area) are approximated via hard clip.

### What `identify` does *not* guarantee

`identify(sampledRgba, { palette: pantone })` returns the nearest
entry **in the shipped sRGB approximation set**. It does **not** imply
that the physical ink bearing that Pantone code would match your sampled
color in a print workflow, under a different light source, or on
different paper stock. Pantone is a spectral specification; any
color-library lookup that rounds it through sRGB loses information.

If you need Pantone-certified color values, consult Pantone directly:
<https://www.pantone.com/>.

## Crayola®

**Crayola®** is a registered trademark of **Crayola LLC**. Chromonym is
**not affiliated with, endorsed by, licensed by, or certified by Crayola
LLC**.

The `crayola` palette in this library ships a **community-curated
subset** of Crayola crayon-color names with sRGB approximations of their
wrappers. The names are used as **nominative references** to publicly
identified Crayola colors — there is no trademark claim, and no
endorsement is implied. Hex values are derived from the widely-cited
Wikipedia list of Crayola crayon colors (CC BY-SA), which itself cites
Crayola's published approximations.

### Scope

The shipped set is 84 entries: the current 64-standard box, the
iconic fluorescent "Neon" range, and widely-recognized modern
additions. It is not exhaustive: historical, retired, specialty-box
(Gem Tones, Heads 'N Tails, Multicultural, etc.), and regional-variant
colors are not included. If you need a specific Crayola color that
isn't present, open an issue or define a BYO palette.

### Accuracy

- Fluorescents and neons saturate outside sRGB by design; on-screen
  sRGB approximations are necessarily softer than the physical crayons.
- Metallics (Silver, Gold, Copper) are flat sRGB approximations; the
  physical crayons' reflective behavior is lost.
- Classic hues are close enough for comparative UI / identification
  work but should not be used as a reference for print color matching.

## X11 / X.Org

The `x11` palette is derived from the X.Org `rgb.txt` file, which is in
the public domain.

## CSS / SVG named colors

The `web` palette mirrors the CSS Color Module Level 4 named-color
set, which is a public specification.

## Name That Color (NTC)

The `ntc` palette (1566 entries) is derived from Chirag Mehta's
**"Name That Color"** dataset, first published at
<https://chir.ag/projects/ntc/>. Chromonym consumes the dataset via
the MIT-licensed **`colorjs/color-namer`** npm package
(<https://github.com/colorjs/color-namer>), which redistributes the
list in a machine-readable form. Chromonym pins to a specific
upstream commit SHA (see `scripts/generate-ntc.ts`) so the entry set
is deterministic across regenerations.

- Names are used as **nominative references** to the publicly
  distributed NTC dataset; no endorsement or trademark claim is
  implied.
- sRGB hex values are taken verbatim from the upstream list.
- No modifications are made beyond casing normalization of the hex
  string and sorting by display name.

The NTC dataset has been widely redistributed since 2006 under
terms allowing free reuse with attribution. If the upstream author
objects to Chromonym's inclusion of the list, open an issue and we
will revisit.

## Bauhaus Modern (demo site typeface)

The demo site at <https://simiancraft.github.io/chromonym/> embeds
**Bauhaus Modern**, a display typeface designed by **Nils Kähler**
(2016). The font file is hosted under
[`demo/public/fonts/`](./demo/public/fonts/) and is used only as
display type for the demo wordmark.

- Source: <https://www.dafont.com/bauhaus-modern.font>
- License terms: "Free for personal use" (per the dafont listing)
- Use for this demo was arranged with the designer's knowledge via
  email; a donation was made, and the use case (MIT-licensed library
  demo, display-type only, with visible attribution) was described.
  See [`demo/public/fonts/README.txt`](./demo/public/fonts/README.txt)
  for the full note.

The font is not part of the published npm package (`files` allowlist
ships only the library, not the demo site). Downstream users of the
`chromonym` package do not redistribute Bauhaus Modern by installing
the library. Please do not repackage or redistribute the font file
outside this demo without following up with the designer directly.

## Upstream dependencies

See `package.json` for runtime and development dependencies. All are MIT
or ISC licensed.
