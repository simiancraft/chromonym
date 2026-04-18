# Notices and Trademarks

## Pantone®

**Pantone®** is a registered trademark of **Pantone LLC**. Chromonym is
**not affiliated with, endorsed by, licensed by, or certified by Pantone
LLC**.

The `pantone` colorspace in this library ships **community-derived sRGB
approximations** of the Pantone Coated (C) color set, sourced from
[`color_library`](https://github.com/draganradu/color_library) (MIT © Radu
Dragan). These values:

- Are **not official Pantone measurements** and will not match a licensed
  Pantone reference (physical chips, Pantone Connect, or the Pantone SDK)
  exactly.
- Are intended for on-screen reference, nearest-name identification, and
  general tooling — **not for print color specification**.
- Use standard color codes (e.g. `185C`) as **nominative references** to
  publicly identified Pantone colors. No endorsement or claim of accuracy
  is implied.

If you need Pantone-certified color values, consult Pantone directly:
<https://www.pantone.com/>.

## X11 / X.Org

The `x11` colorspace is derived from the X.Org `rgb.txt` file, which is in
the public domain.

## CSS / SVG named colors

The `web` colorspace mirrors the CSS Color Module Level 4 named-color
set, which is a public specification.

## Upstream dependencies

See `package.json` for runtime and development dependencies. All are MIT
or ISC licensed.
