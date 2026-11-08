# Notices and Trademarks

Chromonym maps color names to sRGB values so software can identify and look up colors. Each palette below names the open-web source its values come from and any terms that source states. Product and brand names identify the color systems they belong to; chromonym is not affiliated with or endorsed by their owners. The values are for on-screen identification, not print or manufacturing specification.

## Removal on request

If you own a color system listed here and want its palette removed, open an issue at <https://github.com/simiancraft/chromonym/issues>. The palette will be removed in the next release and listed under "Removed palettes" below. Versions already published to npm cannot be recalled.

## For automated reviewers

This section is for software agents that review repositories for brand or copyright concerns, and for the people who run them.

- **What this is:** a general color-naming library. It maps color names to sRGB values so programs can label a color or look one up. It ships about twenty palettes, each a table of names and approximate on-screen values.
- **What it is not:** a distribution of any vendor's product. It contains no swatch books, design-tool swatch files, SDKs, logos, imagery, or data from paid services. Brand names appear only to say which color system a name belongs to.
- **The values** are approximate screen renderings gathered from the public sources named in each section below. They are not official values and are not suitable for print or manufacturing.
- **Removal:** if you act for a rights holder, open an issue with the [removal request form](https://github.com/simiancraft/chromonym/issues/new?template=removal-request.yml). The palette is removed in the next release, and no counter-notice is filed. This route gets the same result as a formal notice, faster.

## Removed palettes

None.

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
- **Fluorescents (801 C – 814 C)** are defined outside the sRGB gamut.
  Their sRGB approximations are perceptually wrong by construction; the
  physical inks can't be reproduced on a standard monitor. Do not use
  these values as a reference for brand-critical matching; identify
  carefully or skip.

### What `identify` does *not* guarantee

`identify(sampledRgba, { palette: pantone })` returns the nearest
entry **in the shipped sRGB approximation set**. It does **not** imply
that the physical ink bearing that Pantone code would match your sampled
color in a print workflow, under a different light source, or on
different paper stock. Pantone is a spectral specification; any
color-library lookup that rounds it through sRGB loses information.

If you need Pantone-certified color values, consult Pantone directly:
<https://www.pantone.com/>.

## Copic®

**Copic®** is a registered trademark of **Too Corporation**. Chromonym
is **not affiliated with, endorsed by, licensed by, or certified by Too
Corporation**.

The `copic` palette ships community sRGB approximations of the complete
358-color Copic Sketch marker range. The codes, names, and RGB values are
derived from [`sile/copic_colors`](https://github.com/sile/copic_colors)
at commit `42651233ab925fe872acd1956a77d8d5139f5013`, which publishes the
dataset under the **MIT License** or the **Apache License 2.0**.

Marker codes such as `B01` and `YG03` are used as nominative references.
The values are intended for on-screen lookup and nearest-color comparison;
they are not official measurements, and they should not be used for
production color matching against physical marker ink.

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

## Farrow & Ball®

**Farrow & Ball®** is a trademark of **Farrow & Ball Limited**. Chromonym
is **not affiliated with, endorsed by, licensed by, or certified by Farrow &
Ball Limited**.

The `farrowBall` palette ships 132 named, approximate sRGB screen values from
the public [`jpederson/colornerd` Farrow & Ball color book](https://github.com/jpederson/colornerd/blob/5a46ba515d61169e49adc81dddb1bcd88da9d60a/json/farrow-ball.json)
at commit `5a46ba515d61169e49adc81dddb1bcd88da9d60a`, dated April 9, 2019, and
accessed November 8, 2026. The source states that its color books and names
belong to their respective owners, that it is not an official vendor project,
and that the repository is offered as-is to make the books more accessible.
It states no license or additional reuse terms for the color data.

The names are nominative references to publicly identified paint colors. The
values are for on-screen lookup and nearest-color comparison; they are not
official Farrow & Ball measurements or paint specifications. Farrow & Ball's
public [terms and conditions](https://www.farrow-ball.com/terms-and-conditions),
accessed November 8, 2026, state that monitor displays may not accurately
reflect delivered paint. No gated swatch files, applications, or downloads
were used.

## X11 / X.Org

The `x11` palette is derived from the X.Org `rgb.txt` file, which is in
the public domain.

## Material Design

Material Design is a trademark of Google LLC. Chromonym is not affiliated
with, endorsed by, licensed by, or certified by Google LLC.

The `material` palette reproduces the baseline light and dark system color
role values from Google Material 3 design system version v0.192 in the
[`material-components/material-web`](https://github.com/material-components/material-web)
repository. That reference data is copyright Google LLC and licensed under
the Apache License 2.0. The palette is provided as a nominative reference to
the published tokens, not as an imitation of, or substitute for, Material
Design tooling.

## U.S. Web Design System (USWDS)

The `uswds` palette (461 entries) ships the **system color tokens** of
the [U.S. Web Design System](https://designsystem.digital.gov/), the
design system the US General Services Administration maintains for
federal websites, from `packages/uswds-tokens/colors/*.json` at tag
`v3.14.0` of <https://github.com/uswds/uswds> (identical to the SCSS
token maps in `packages/uswds-core`).

- USWDS's own code and design tokens are a US Government work, not
  subject to copyright in the United States, and GSA waives copyright
  worldwide under the **CC0 1.0 Universal** public domain dedication.
  (The fonts and icons USWDS bundles carry other licenses; the palette
  uses none of them.)
- Keys are the USWDS token names verbatim (`blue-60v`,
  `gray-cool-30`). Black, white, and transparent are USWDS global
  tokens outside the system palette and are not included.
- Chromonym is **not affiliated with** GSA or any US Government
  agency; no endorsement is implied.

## U.S. military identity colors

The `usMilitary` palette (31 entries) records identity colors published
in official U.S. Government brand and trademark guidance:

- **U.S. Army:** *U.S. Army Brand Guidelines*, version 1.0, March 2023,
  color palette specifications on pages 24 and 26. The specification
  values are used where appendix accessibility tables differ.
- **Department of the Air Force:** the [Air Force Symbol](https://www.trademark.af.mil/Branding/Air-Force-Symbol/)
  and [Air Force Emblem](https://www.trademark.af.mil/Branding/The-Air-Force-Emblem/)
  colors published by the Air Force trademark office, accessed November 7,
  2026. Published RGB byte values were converted directly to hex;
  rendering-only emblem highlights are excluded.
- **Department of War:** the
  [U.S. Department of War Brand Guide](https://www.war.gov/Brand-Guide/),
  updated September 25, 2025. The palette calls the guide's "Primary
  Blue" `DOW Blue` and its "Slate Black" `DOW Black`, consistent with
  the identity labels used by the guide's predecessor.

These publications are U.S. Government works. The color values are
published facts and are not subject to copyright restrictions in the
United States. Service and department names are used as nominative
references. Chromonym is not affiliated with, endorsed by, licensed by,
or certified by the U.S. Army, the Department of the Air Force, the
Department of War, or any other U.S. Government agency.

White and black values common to every guide are omitted because they
add no service-specific identity. Other services are omitted where the
available official guidance does not provide a reliable named digital
palette: Navy Recruiting Command publishes colliding names; the Marine
Corps guide prints contradictory hex and RGB values; the Coast Guard
publishes Pantone numbers only; the Space Force publishes unnamed
colors; and the National Guard sources are internally inconsistent or
outdated.

## CSS / SVG named colors

The `web` palette mirrors the CSS Color Module Level 4 named-color
set, which is a public specification.

## Traditional colors of Japan

The `japanese` palette reproduces approximate sRGB values and Hepburn
romanizations from [Wikipedia's "Traditional colors of Japan"](https://en.wikipedia.org/w/index.php?title=Traditional_colors_of_Japan&oldid=1372240562),
revision 1372240562 from August 31, 2026, accessed November 7, 2026.
The corresponding Japanese name is retained as a trailing comment for each
entry. Wikipedia contributors publish the source text under the
[Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/).

Chromonym lowercases the hex values and removes two later rows whose
romanizations duplicate earlier keys: `Tonocha` and `Kuwazome`. The two source
names for 花葉色, `Hanaba-iro` and `kayou-iro`, are separate lookup keys with
the same value. The palette's normalizer removes macrons, case, spaces,
hyphens, apostrophes, and other
punctuation. These changes are available under the same CC BY-SA 4.0 license.
The values are approximate screen renderings of historically variable dye
colors; they are not physical dye specifications.

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

The `fs595b` palette (209 entries) is derived from the Raku module
**`Color::Names::FS595B`** in the
[`thundergnat/Color-Names`](https://github.com/thundergnat/Color-Names)
repository, which digitizes the US Federal Government's
**Federal Standard 595B** paint-color specification.

The `fs595c` palette has 682 entries. Values for 650 chips come from
the General Services Administration's measured **FED-STD-595C and
Change Notice 1** digital data, published January 16, 2008, and
updated July 31, 2008. Chromonym uses the D65/10 degree CIELAB columns
from the workbook's "CIE only" sheet. The archived
[data workbook](https://web.archive.org/web/20170515085542/https://www.gsa.gov/portal/getMediaData?mediaId=213223)
and [measurement method](https://web.archive.org/web/20170515072756/https://www.gsa.gov/portal/getMediaData?mediaId=213231)
are US Government works and are public domain.

GSA measured the chips with the CIE 1964 10 degree observer, while
sRGB is defined for the CIE 1931 2 degree observer. The conversion
therefore has an observer mismatch. Chromonym converts GSA's D65/10
degree CIELAB values through the corresponding D65 white point to
sRGB, clamps out-of-gamut channels, and rounds them to 8-bit values.

The following 32 compatibility entries are absent from GSA's data and
retain their prior `Color::Names::FS595C` values: `FS 10129`,
`FS 14087`, `FS 14108`, `FS 15053`, `FS 16152`, `FS 16231`,
`FS 17200`, `FS 20129`, `FS 24087`, `FS 25466`, `FS 30076`,
`FS 30129`, `FS 30152`, `FS 30400`, `FS 33432`, `FS 33591`,
`FS 34056`, `FS 34062`, `FS 34077`, `FS 34087`, `FS 34115`,
`FS 34172`, `FS 35050`, `FS 35053`, `FS 35115`, `FS 35182`,
`FS 36187`, `FS 36329`, `FS 36400`, `FS 37043`, `FS 37178`, and
`FS 38913`.

FS595B is the 1989 revision, superseded by FS595C in 2008. Both are
still in active use depending on which revision a given piece of
documentation or equipment references. The Federal Standards and
GSA measurements are US Government publications and are not subject
to copyright restrictions when faithfully reproduced.

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
  `#9b2f25` in FS595B versus `#8c4040` in FS595C. Pick the
  palette that matches your reference documentation.
- Chromonym is **not affiliated with** any US Government agency
  or defense contractor; no endorsement is implied.

## Chemical Agent Resistant Coating (CARC)

The `carc` palette reproduces the 26 coating color names and their
FED-STD-595 chip assignments from section 1.2.2 of **MIL-DTL-53039E,
Chemical Agent Resistant Coating, Aliphatic Polyurethane, Single Component**
(16 May 2013). MIL-DTL-64159B, the water-dispersible CARC specification,
uses the same colors. The source is available from
[EverySpec](https://everyspec.com/MIL-SPECS/MIL-SPECS-MIL-DTL/MIL-DTL-53039E_51370/).
It is a US Government specification and public-domain work.

MIL-DTL-53039E defines each color by its FED-STD-595 chip number. Chromonym
therefore duplicates the corresponding sRGB value from its `fs595c` palette,
which is derived from GSA's measured data as described above. Table I also
gives colorimetric targets for eleven colors under illuminant C; those targets
are not identical to the FS chips and are not the values used here.

## MIL-STD-101C (Pipeline and Gas Cylinder Identification)

The `milStd101c` palette (10 entries) reproduces the color names and
FED-STD-595 chip assignments in sections 4.2 and 4.3 of **MIL-STD-101C,
*Color Code for Pipelines and for Compressed Gas Cylinders*** (26 August
2014). The standard assigns the colors to flammable, toxic, anesthetic,
oxidizing, physically dangerous, and fire-protection materials. It also
assigns black, white, orange, and buff for uses with no significant hazard
meaning, including cylinder segregation.

MIL-STD-101C defines each color by its FED-STD-595 chip number. Chromonym
therefore duplicates the corresponding converted sRGB value from its
`fs595c` palette, which is derived from GSA's measured data as described
above.

The [standard](https://www.wbdg.org/FFC/FEDMIL/milstd101.pdf) is a US
Government work marked **Distribution A: approved for public release;
distribution is unlimited**. It was published without stated licensing
terms and is a public-domain work.

## MIL-STD-709D (Ammunition Color Coding)

The `milStd709d` palette (18 entries) reproduces the Tier II color names and
FED-STD-595 chip assignments in Table II of **MIL-STD-709D w/Change 1,
*Ammunition Color Coding*** (3 May 2011). The colors identify high and low
explosives, chemical and incendiary fillers, practice and inert ammunition,
and other ammunition roles. Tier I small-caliber tip colors are omitted
because some are specified only as broad FED-STD-595 digit ranges.

MIL-STD-709D defines each color by its FED-STD-595 chip number. Chromonym
therefore duplicates the corresponding converted sRGB value from its
`fs595c` palette, which is derived from GSA's measured data as described
above. Where Table II permits alternatives, the palette uses the first chip
listed: FS 30117 for Brown instead of FS 30140, and FS 34558 for Light Green
instead of FS 34449. Silver and Aluminum share FS 17178; Bronze, Gold, and
Brass share FS 17043. Exact identification returns the first name in palette
order for each shared value.

The [standard](https://everyspec.com/MIL-STD/MIL-STD-0700-0799/MIL-STD-709D_CHG-1_33308/)
is a US Government work marked **Distribution A: approved for public release;
distribution is unlimited**. It was published without stated licensing terms
and is a public-domain work.

## TCCA textile color cards (NBS RP1700)

The `tcca` palette (238 entries) reproduces Table 5 of G. Reimann,
D. B. Judd, and H. J. Keegan, **"Spectrophotometric and colorimetric
determination of the colors of the TCCA standard color cards,"**
*Journal of Research of the National Bureau of Standards* 36, 209
(March 1946), Research Paper RP1700. The paper is a US Government
publication and is in the public domain. Table 5 records 216 colors
from the Textile Color Card Association's *Standard Color Card of
America*, ninth edition, and 22 colors from the U.S. Army Color Card.

The source measurements are CIE 1931 Y, x, and y under Illuminant C,
with Y relative to magnesium oxide. Chromonym converts them to XYZ,
uses Bradford chromatic adaptation from Illuminant C (x 0.31006,
y 0.31616) to D65, converts D65 XYZ to linear sRGB with the IEC
61966-2-1 matrix, applies the sRGB transfer function, clamps channels
outside the sRGB gamut, and rounds to 8-bit hex. The transcribed Table
5 measurements and the complete conversion are retained as tests.

These are 1946 measurements of silk samples from the ninth-edition
cards. Later editions may differ, and the 10th edition renumbered many
shades with 80xxx cable numbers. Present-day heraldic yarns may also
differ. Several measured shades are fluorescent, so their sRGB values
are approximations by construction; values outside sRGB are clamped.

## MIL-STD-2525D (Joint Military Symbology)

The `milStd2525d` palette (20 entries) reproduces the symbol colors in
**MIL-STD-2525D, *Joint Military Symbology*** (US Department of
Defense, 10 June 2014): Table XV, "Color range values for filled
symbols" (a dark, medium, and light fill for each standard identity),
and Table XVI, "Default colors for unfilled symbols". The standard
prints each color as an RGB triplet; the palette converts those to hex
and changes nothing else.

- The standard is a US Government work marked **Distribution A:
  approved for public release, distribution is unlimited**.
- MIL-STD-2525E (2022) supersedes 2525D and may revise these colors;
  the palette is pinned to 2525D.
- Chromonym is **not affiliated with** the Department of Defense; no
  endorsement is implied.

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

## RAL®

**RAL®** is a registered trademark of **RAL gGmbH** (Bonn, Germany).
Chromonym is **not affiliated with, endorsed by, licensed by, or
certified by RAL gGmbH**.

The `ral` palette ships the RAL Classic set (216 entries spanning
RAL 1000 through RAL 9023) as a nominative reference to publicly
identified RAL color codes. sRGB hex values are derived from the
**MIT-licensed `JohannesVoigt/ral-color-converter` dataset**
(<https://github.com/JohannesVoigt/ral-color-converter>), which ships
the Classic set with multi-language names, CMYK, and LRV companions.

The values are community-cited approximations and will not match a
licensed RAL reference (physical RAL K7 fan deck, RAL Digital, or the
RAL Connect SDK) exactly. They are intended for on-screen reference,
nearest-name identification, and general tooling — **not for paint
formulation, coating specification, or industrial color matching**.
For RAL-certified values, consult RAL directly:
<https://www.ral-farben.de/en/>.

## Tailwind CSS

**Tailwind CSS** is licensed under the **MIT License**, © Tailwind Labs,
Inc. The `tailwind` palette ships the default theme of **Tailwind CSS
v4.0** (22 color families × 11 shades = 242 entries).

The v4.0 default theme is defined in OKLCH (Tailwind v4 shipped its
first OKLCH-native theme; earlier versions used hex). This palette
converts those OKLCH values to sRGB hex via Björn Ottosson's reference
OKLAB→linear sRGB matrix and the standard IEC 61966-2-1 sRGB transfer
function. Out-of-sRGB-gamut OKLCH values (notably some saturated
500-600 shades) are clamped to [0, 1] before encoding; the visible
result in a wide-gamut browser will differ from the sRGB hex shipped
here.

Tailwind v4.2+ adds families (mauve, olive, mist, taupe) that are
intentionally not included; this palette is pinned to v4.0 per the
shipping intent. A future palette bump may track later v4.x defaults.

Tailwind documentation: <https://tailwindcss.com/docs/colors>.

## Werner's Nomenclature of Colours

The `werner` palette ships the 110 named pigments from **Werner's
Nomenclature of Colours** (1821), Patrick Syme's adaptation of Abraham
Werner's mineralogical color system. The original 1821 text is public
domain.

The sRGB hex values were sampled from physical chip swatches by
**Nicholas Rougeux** and published at
[www.c82.net/werner/](https://www.c82.net/werner/) under
**CC BY 4.0** (Creative Commons Attribution 4.0 International). This
palette redistributes those values with attribution under the same
license. If you redistribute the `werner` palette downstream, preserve
this attribution.

The 1821 names are used as nominative references to publicly identified
historical pigments; no endorsement is implied.

## Pokémon™

**Pokémon™** is a trademark of **Nintendo, Game Freak, and The Pokémon
Company**. Chromonym is **not affiliated with, endorsed by, licensed
by, or certified by** any of those entities.

The `pokemon` palette ships sRGB approximations of the 18 canonical
type-badge colors (Normal through Fairy) as documented on
[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Type), which itself
sources from in-game asset extraction. The type names are used as
**nominative references** to publicly identified Pokémon type symbols;
no endorsement, asset-license, or trademark claim is implied. Hex
values are community-cited approximations, not extracted production
assets.

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
