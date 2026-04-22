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

## Resene

The `resene` palette (1378 entries) is derived from the Raku
module **`Color::Names::Resene`** in the
[`thundergnat/Color-Names`](https://github.com/thundergnat/Color-Names)
repository, which digitizes the named-color catalog published by
**Resene Paints Ltd.** (New Zealand). Resene's naming system has
distinctly local flavor, including te reo Māori and New Zealand
place names ("Pohutukawa," "Acapulco," "Afghan Tan").

- Chromonym uses **nominative references** to Resene's published
  color names; no trademark claim or endorsement is implied.
- Canonical keys are the lowercase single-word form the source
  module uses (`treepoppy` for "Tree Poppy"); the display form
  and Resene's own Munsell-style code (e.g. `BR32-011-076`) are
  captured as trailing comments on each palette entry for human
  readers.
- sRGB hex values are taken verbatim from the upstream module's
  RGB byte triplets. Resene's physical paint samples under
  their own published lighting conditions are the authoritative
  reference; this digital approximation is provided for
  comparative / tooling use, not for paint specification.
- If Resene Paints Ltd. objects to this palette's inclusion,
  open an issue and we will revisit.

## Natural Colour System (NCS)

The `ncs` palette (1950 entries) is derived from the Raku module
**`Color::Names::NCS`** in the
[`thundergnat/Color-Names`](https://github.com/thundergnat/Color-Names)
repository, which digitizes the **Natural Colour System®** Atlas.
NCS is a Swedish perceptual color system based on Hering's
opponent-process theory; its notation (e.g. `S 2030-R80B`)
describes each color by its blackness, chromaticness, and hue
position between the four elementary chromatics.

- **NCS® is a registered trademark of NCS Colour AB** (Stockholm).
  Chromonym is **not affiliated with, endorsed by, licensed by,
  or certified by NCS Colour AB**. The shipped palette is a
  community approximation intended for on-screen reference and
  nearest-name identification; it is **not suitable for paint
  specification or color matching** against the official NCS
  Atlas.
- NCS is **device-independent by design**. Any sRGB approximation
  is lossy by construction. The values shipped here come from
  thundergnat's Raku module's own digitization; different NCS
  publications give slightly different sRGB values for the same
  code.
- Canonical keys are the NCS codes themselves (e.g. `2030-R80B`).
  The palette's custom normalizer accepts optional `NCS ` and
  `S ` prefixes, so `NCS S 2030-R80B`, `S 2030-R80B`,
  `2030-R80B`, and `2030r80b` all resolve identically. `S` is
  only treated as a prefix when followed by a digit, so inputs
  that don't match an NCS code aren't silently rewritten.

### Accuracy envelope

NCS specifies colors by percentages on an opponent-process model;
those percentages must be translated to sRGB through a calibration
that differs between publications. As a rough guide for the
digitization chromonym ships:

- **Mid-chroma / mid-value codes** (blackness and chromaticness
  both between ~20 and ~60) are the best-behaved; the upstream
  digitization is usually within a few ΔE2000 of any reasonable
  alternate rendering.
- **High chromaticness, low blackness** codes (e.g. `S 1080-Y90R`,
  `S 0580-G`) sit at or outside the sRGB gamut boundary. The hex
  shipped here is gamut-clipped; a different digitization may
  clip differently, producing visibly different hex values for
  the same NCS code.
- **Very low-blackness neutrals** (e.g. the `0300-N` / `0500-N`
  range) are close to sRGB white; fine-grained differences between
  digitizations are largely imperceptible.

If brand-critical or specification-critical NCS matching is needed,
consult NCS Colour AB directly: <https://ncscolour.com/>.

## NBS (thundergnat digitization)

The `nbs` palette (267 entries) is a **second digitization of the
same 1955 NBS Method of Designating Colors** covered by the
`isccNbs` palette above; it is sourced from the Raku module
**`Color::Names::NBS`** in
[`thundergnat/Color-Names`](https://github.com/thundergnat/Color-Names).
Ships alongside `isccNbs` (not as a replacement) because the two
digitizations produce materially different sRGB values for the
same named blocks: average ΔE2000 of ~4.6 across the 260 shared
names, max ΔE2000 of 31 for the most saturated blocks like
"Vivid bluish green."

The two palettes serve different reference workflows:

- **`isccNbs`** (Paul Centore) computes Munsell-centroid CIELAB
  then maps to sRGB. "Vivid" blocks land near the sRGB saturation
  edge; seven blocks are left as gaps because their centroids
  fall outside the sRGB gamut.
- **`nbs`** (thundergnat) appears to use the sample chip RGBs
  from the original NBS publication, which were already gamut-
  compressed by the physical chip material. "Vivid" blocks read
  as more muted, and all 267 entries are covered — including
  the seven blocks whose Munsell centroids fall outside the sRGB
  gamut and are therefore omitted from `isccNbs`. `nbs` does not
  "recover" the out-of-gamut centroids; it ships the already-
  compressed physical chip approximation instead, which is a
  different kind of lossy.

Pick `nbs` for historical / swatch-book matching; pick `isccNbs`
for modern digital design work. The name vocabulary (the 1955
NBS publication itself) is a US-government document not subject
to copyright restrictions when faithfully reproduced; the
specific sRGB values in each palette are credited to their
respective digitizers.

## ISCC-NBS Colour System

The `isccNbs` palette (260 entries) is the **ISCC-NBS Method of
Designating Colors**, a 1955 joint publication of the
**Inter-Society Color Council** and the US **National Bureau of
Standards** (now NIST). The system partitions the Munsell color
solid into 267 named blocks at Level 3 resolution with canonical
names like "Vivid pink," "Strong purplish red," and "Dark
yellowish brown."

sRGB centroids for each named block are scraped from **Paul
Centore's** digitization at
<https://www.munsellcolorscienceforpainters.com/ISCCNBS/ISCCNBSSystem.html>,
part of his *Munsell Colour Science for Painters* site.

**Why 260 and not 267:** Seven ISCC-NBS blocks sit outside the
sRGB gamut (notably the most-saturated greens, blues, and
orange-yellows): `Deep green`, `Deep bluish green`, `Vivid
greenish blue`, `Deep greenish blue`, `Brilliant orange`, `Deep
olive green`, and `Vivid orange yellow`. Centore's source marks
these as `rgb(NaN,NaN,NaN)`; chromonym skips them rather than
ship a fabricated sRGB approximation.

The ISCC-NBS name system itself is a US-government publication
and is not subject to copyright restrictions when faithfully
reproduced. Paul Centore's specific sRGB-centroid computations
are credited here; if the author objects to Chromonym's use of
his digitization, open an issue and we will revisit or redo the
centroids from the primary Munsell data.

## Federal Standard 595 (FS595B and FS595C)

The `fs595b` (209 entries) and `fs595c` (589 entries) palettes
are derived from the Raku modules **`Color::Names::FS595B`** and
**`Color::Names::FS595C`** in the
[`thundergnat/Color-Names`](https://github.com/thundergnat/Color-Names)
repository, which digitize the US Federal Government's
**Federal Standard 595** paint-color specification (used for
military, aviation, and government-equipment coatings). FS595B
is the 1989 revision, superseded by FS595C in 2008. Both are
still in active use depending on which revision a given piece of
documentation or equipment references. The Federal Standard
itself is a US-government-published specification and is not
subject to copyright restrictions when faithfully reproduced.

- Canonical keys in both palettes are the 5-digit FS codes
  prefixed with `FS ` (e.g. `FS 11136`). Common names attached
  to many chips in the source (e.g. "Insignia Red") are captured
  as trailing code comments on each palette entry for human
  readers but are **not** used as lookup keys because the spec
  reuses many across multiple chips with different hex values
  (18–20 different "Green"s, 11 "Tan"s, etc., depending on
  revision).
- Same-coded chips can differ in hex between the B and C
  revisions; for example `FS 11136` ("Insignia Red") is
  `#9b2f25` in FS595B versus `#a32b25` in FS595C. Pick the
  palette that matches your reference documentation.
- sRGB hex values are taken verbatim from the upstream modules'
  RGB byte triplets; the published standard specifies color
  chips under controlled lighting, and all digital sRGB
  approximations including these are necessarily simplified.
- Chromonym is **not affiliated with** any US Government agency
  or defense contractor; no endorsement is implied.

## XKCD color survey

The `xkcd` palette (923 entries after normalization-collision
dedupe) is derived from **Randall Munroe's 2010 XKCD color
survey results**, published at <https://xkcd.com/color/rgb.txt>
and released to the **public domain under CC0 1.0 Universal**.
Chromonym reproduces the dataset verbatim apart from:

- Hex casing normalized to lowercase.
- Entries whose names collapse to the same canonical key under
  `standardNormalize` are deduped first-seen wins (e.g. the
  survey's `darkblue` and `dark blue` entries both normalize to
  `darkblue`; only the first is retained).

The XKCD color-survey names are crowd-sourced and include
colorful non-standard descriptors. Chromonym takes no editorial
stance on the names and ships them as-is.

## Name That Color (NTC)

The `ntc` palette (1566 entries) is derived from Chirag Mehta's
**"Name That Color"** dataset, first published at
<https://chir.ag/projects/ntc/>. Chromonym consumes the dataset via
the MIT-licensed **`colorjs/color-namer`** npm package
(<https://github.com/colorjs/color-namer>), which redistributes the
list in a machine-readable form. The shipped palette was generated
against commit `abb3d184ab63db9327908319cc45b55c91493bb7` of the
upstream repository, so the entry set is deterministic and
reproducible.

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
