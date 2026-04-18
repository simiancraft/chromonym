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

## X11 / X.Org

The `x11` palette is derived from the X.Org `rgb.txt` file, which is in
the public domain.

## CSS / SVG named colors

The `web` palette mirrors the CSS Color Module Level 4 named-color
set, which is a public specification.

## Upstream dependencies

See `package.json` for runtime and development dependencies. All are MIT
or ISC licensed.
