# [3.4.0](https://github.com/simiancraft/chromonym/compare/v3.3.2...v3.4.0) (2026-05-11)


### Features

* export VERSION constant; require Node >=22 ([0437b50](https://github.com/simiancraft/chromonym/commit/0437b50ce1dadf103befafeb877cf9ad0f4da27c))

## [3.3.2](https://github.com/simiancraft/chromonym/compare/v3.3.1...v3.3.2) (2026-04-24)


### Bug Fixes

* **subpath:** correct type cast on PKG_JSON.exports iteration ([2ec9aa8](https://github.com/simiancraft/chromonym/commit/2ec9aa841808b5cec2222dbd9de790b17cc534f1))

## [3.3.1](https://github.com/simiancraft/chromonym/compare/v3.3.0...v3.3.1) (2026-04-24)


### Bug Fixes

* **subpath:** use fileURLToPath for cross-platform PROJECT_ROOT; document test idioms ([436fabc](https://github.com/simiancraft/chromonym/commit/436fabcded3690587e3eced8566ef5e5dd4b681d)), closes [#E20074](https://github.com/simiancraft/chromonym/issues/E20074) [#e20074](https://github.com/simiancraft/chromonym/issues/e20074)

# [3.3.0](https://github.com/simiancraft/chromonym/compare/v3.2.0...v3.3.0) (2026-04-23)


### Bug Fixes

* **ci:** set least-privilege GITHUB_TOKEN permissions on CI workflow ([946d322](https://github.com/simiancraft/chromonym/commit/946d322285ce5ab264270357734df4fcba21d7e1))
* **security:** harden rgb() parser against polynomial ReDoS ([c5f5bbd](https://github.com/simiancraft/chromonym/commit/c5f5bbd7a729801bd7420249790c39ed143c22f5))


### Features

* **rgb:** accept leading-dot alpha values (.5) in rgb()/rgba() strings ([8954e9d](https://github.com/simiancraft/chromonym/commit/8954e9d67a789800c8f18ccec56e1ea5685b7e8c))

# [3.2.0](https://github.com/simiancraft/chromonym/compare/v3.1.1...v3.2.0) (2026-04-22)


### Bug Fixes

* **define:** use Object.create(null) accumulator in defineColorPalette ([f3c4c21](https://github.com/simiancraft/chromonym/commit/f3c4c2129e48f96afb72b239160b8883a20e32df))
* **docs:** 5 ship-blocking review findings ([2490aca](https://github.com/simiancraft/chromonym/commit/2490aca664da15ecb4eadbf24c93edaf80934663)), closes [#e20074](https://github.com/simiancraft/chromonym/issues/e20074) [#663399](https://github.com/simiancraft/chromonym/issues/663399)


### Features

* **demo:** enable React Compiler, drop manual memoization ([c7d120e](https://github.com/simiancraft/chromonym/commit/c7d120ebbcafeb0bbaa59f235568ba5c5ddd6199))
* **demo:** palette tile grid packs 4 cols × 3 rows on desktop ([54ede3c](https://github.com/simiancraft/chromonym/commit/54ede3cb27dbbf107a15d0928c35c7c68f56fdd1))
* **demo:** surface palette descriptions beside the tile grid ([56a3e75](https://github.com/simiancraft/chromonym/commit/56a3e7538199026a7b2e957e5812129e2336a6a1))
* **demo:** unify palette tile name at text-base; trim grid tile padding ([1a1f4a1](https://github.com/simiancraft/chromonym/commit/1a1f4a128f7b814bac2ec0a774aabc17da6e2722))
* **palettes:** add fs595b; annotate both FS595 palettes with common names ([84d44f8](https://github.com/simiancraft/chromonym/commit/84d44f88a1828ab7280059ee26a75edb086c833e)), closes [#9b2f25](https://github.com/simiancraft/chromonym/issues/9b2f25) [#a32b25](https://github.com/simiancraft/chromonym/issues/a32b25)
* **palettes:** add fs595c (Federal Standard 595C, 589 entries) ([3c6b224](https://github.com/simiancraft/chromonym/commit/3c6b224b25465178766a633b4fddb6a027532eef))
* **palettes:** add isccNbs (ISCC-NBS Level 3, 260 entries) ([babb7cd](https://github.com/simiancraft/chromonym/commit/babb7cdd3c1c94ea34b148d9af284555e7d47333))
* **palettes:** add nbs (alternate NBS digitization, 267 entries) ([fecf8d1](https://github.com/simiancraft/chromonym/commit/fecf8d1a294caf9fefa7b3afce6972d413b268d6))
* **palettes:** add ncs (Natural Colour System, 1950 entries) ([4aee015](https://github.com/simiancraft/chromonym/commit/4aee0159ce5067072248c3e7989531f0390e44d6))
* **palettes:** add ntc (Name That Color, 1566 entries) ([d4b1d75](https://github.com/simiancraft/chromonym/commit/d4b1d7549cce00cf560d8f160eb5487c8f4a1b13))
* **palettes:** add resene (Resene Paints NZ, 1378 entries) ([818c6f8](https://github.com/simiancraft/chromonym/commit/818c6f8bd2e2ff637c6183c1807241c5c94248de))
* **palettes:** add xkcd (XKCD color-survey, 923 entries) ([fb4bffe](https://github.com/simiancraft/chromonym/commit/fb4bffe925bf2c8c75190dce60a2077d384de1a7))
* **types:** add defineColorPalette helper for BYO palettes ([0f6823a](https://github.com/simiancraft/chromonym/commit/0f6823a9ed480455521bc3dfe91933fb60c94c61))


### Performance Improvements

* **topk:** bounded insertion-sort + forgiving k coercion ([398459a](https://github.com/simiancraft/chromonym/commit/398459a69a6ce0f3b972f8e7373885bff8a634ac))

## [3.1.1](https://github.com/simiancraft/chromonym/compare/v3.1.0...v3.1.1) (2026-04-21)


### Bug Fixes

* **release:** restore CHANGELOG pipeline; swap in new logo + demo gif ([00539d0](https://github.com/simiancraft/chromonym/commit/00539d0513c87629ea5649fe5dcd527fe72f7521))

# [3.1.0](https://github.com/simiancraft/chromonym/compare/v3.0.0...v3.1.0) (2026-04-21)


### Features

* **demo:** address panel review — perf, a11y, voice, copy-paste hygiene ([a4f915f](https://github.com/simiancraft/chromonym/commit/a4f915fb4e3029fcbc5b218440ae25c8b82eeb89))
* **demo:** bauhaus redesign with Bauhaus Modern display type ([764d397](https://github.com/simiancraft/chromonym/commit/764d3974c492b7f0aab6a549e3d91146f22ff852))
* **demo:** BYO 2-row grid + click fix; palette-tile 3-row layout; copy cleanup ([d370251](https://github.com/simiancraft/chromonym/commit/d370251c963b509ee28d7ed3cdedb7073538b38a))
* **demo:** copy button on the live code snippet ([f9852da](https://github.com/simiancraft/chromonym/commit/f9852da144e1754fd1cc5cc6a3a97a55b1cc3c55))
* **demo:** crayola tile bg, stronger selection contrast, clamp pulse arc ([fecb295](https://github.com/simiancraft/chromonym/commit/fecb2950f571daf90b1f96b28c86e93d4f7f4fd0))
* **demo:** easter-egg controls replace "2026 · typescript" eyebrow ([b5d26da](https://github.com/simiancraft/chromonym/commit/b5d26da7b00d4d3bb0c1ff4ca99d73ebb7c8333f))
* **demo:** full-width BYO shape row, click-to-select, random pulse offset ([8fec69b](https://github.com/simiancraft/chromonym/commit/8fec69b1f75c3bdf5f1e6e8c3899f6ae8456a0d5))
* **demo:** image eyedropper — pick a pixel, read the name ([f1b5cef](https://github.com/simiancraft/chromonym/commit/f1b5cefd9da5b5c75a117352956aebd97e94c290))
* **demo:** inline BYO picker + per-faction invocation easter eggs ([71d7979](https://github.com/simiancraft/chromonym/commit/71d797910423aa83df65e3da9492f62856800caa))
* **demo:** interactive two-panel palette translator ([231fb6c](https://github.com/simiancraft/chromonym/commit/231fb6c5300095dda7d5e0408b4862091e17225b))
* **demo:** live code snippet in translator, plus refactor to source-form identify ([186345b](https://github.com/simiancraft/chromonym/commit/186345be3a59f92d285bc8425d8e9adde89c511c))
* **demo:** masthead easter-egg — blend-mode select + opacity slider ([13d5dee](https://github.com/simiancraft/chromonym/commit/13d5dee907fb7f3c0ff744e48278d38ac964dfe1))
* **demo:** palette-tile fixes, square canvas, difference-blend wordmark ([8d68166](https://github.com/simiancraft/chromonym/commit/8d68166b7bcfe7b24b98a064c448d29445602860))
* **demo:** press-and-drag eyedropper (replaces hover-preview + click-pin) ([a58311b](https://github.com/simiancraft/chromonym/commit/a58311bb2a3333bce3fcb7d14812c55493fc6e1e))
* **demo:** resolve · cont. fuzzy text lookup; convert input picker ([c1cdccc](https://github.com/simiancraft/chromonym/commit/c1cdcccff358114c06de393ad64e47cb6560c8e2))
* **demo:** RGB-driven wordmark ghosts; 'selected' replaces 'scrubbed' ([6033f18](https://github.com/simiancraft/chromonym/commit/6033f18458e4cd27b59e023cc59762400dd47c11))
* **demo:** sequence identify → resolve → convert; unify code blocks ([3b3abf4](https://github.com/simiancraft/chromonym/commit/3b3abf4b3391c5afd695e7bf84171edff83ae7be))
* **demo:** third-based identify layout, hierarchical presets, per-metric copy ([b836764](https://github.com/simiancraft/chromonym/commit/b83676452687c61e90a37d7d00c5ab6d84574de5))
* **demo:** two more warhammer factions + canvas a11y + fillStyle fix + metric copy ([0318ade](https://github.com/simiancraft/chromonym/commit/0318ade9df8bc1d29d444d23e37006cba5304d8a))

# [3.0.0](https://github.com/simiancraft/chromonym/compare/v2.0.0...v3.0.0) (2026-04-19)


* refactor(api)!: fold translate + identifyAll into identify; add fuzzy resolve via k ([5d60b9e](https://github.com/simiancraft/chromonym/commit/5d60b9e611e7ed3413211451b651f877bd539b4f))


### Bug Fixes

* panel-review blockers (demo strings, tsc, grid cell, fuzzy-input cap) ([c7e846c](https://github.com/simiancraft/chromonym/commit/c7e846cd9e47b0e44532cb7893d855c715a1b505)), closes [#9](https://github.com/simiancraft/chromonym/issues/9)


### Features

* **palettes:** add crayola palette (~85 entries) ([212ab5c](https://github.com/simiancraft/chromonym/commit/212ab5cb495e870b83d70e195be1dc383545ba04))
* translate + identifyAll verbs; cross-palette demo section ([fc4b3fa](https://github.com/simiancraft/chromonym/commit/fc4b3fa42b413fd16a0eac43dae26dd320aa7676)), closes [#e20074](https://github.com/simiancraft/chromonym/issues/e20074)


### BREAKING CHANGES

* `translate` and `identifyAll` are removed from the
public API. Replace:
  translate(name, { from, to, metric })  →  identify(name, { palette: to, source: from, metric })
  identifyAll(input, { palette, k })     →  identify(input, { palette, k })

# [2.0.0](https://github.com/simiancraft/chromonym/compare/v1.4.1...v2.0.0) (2026-04-19)


* feat(colorspaces)!: accept Colorspace<Name> objects; enable BYO palettes ([fe887b4](https://github.com/simiancraft/chromonym/commit/fe887b4fd7da75b1e15657eaf0a29279e71747a9))
* feat(colorspaces)!: humanize canonical keys across all palettes ([9d39b8d](https://github.com/simiancraft/chromonym/commit/9d39b8d36881020bf6c2872ed02785f92269c0bd))
* feat(convert)!: unify palette lookup into the convert API ([e783a41](https://github.com/simiancraft/chromonym/commit/e783a41684dd937ab6bfd90ed9e789d4d715223b))
* fix!: Node ESM blocker, NAME alpha guard, subpath test via package specifier, marketing copy ([a6af084](https://github.com/simiancraft/chromonym/commit/a6af084056763c90289b9caa021d9a76657f6e4a))
* refactor!: panel re-review follow-ups — types, packaging, docs, a11y ([515ded3](https://github.com/simiancraft/chromonym/commit/515ded3738afb777234f3b0b76340fb841a84151))
* refactor!: rename Colorspace → Palette universally ([eded24f](https://github.com/simiancraft/chromonym/commit/eded24f13e9b655a13bc29dda4a07d03a16de7a7))
* refactor(palettes)!: web keys revert to CSS-keyword form (paste-compatible) ([6ec66a4](https://github.com/simiancraft/chromonym/commit/6ec66a48c13c3d3f76f30c59626c0db5120e62ce))


### BREAKING CHANGES

* Node ESM consumers who somehow made it work with the
old bundler-style output now see correct behavior (no regression — the
old state was broken for Node ESM). `convert(_, { palette, format:
'NAME' })` now rejects non-opaque inputs instead of silently matching.
* web palette keys are now CSS-keyword form
(`rebeccapurple` instead of `rebecca purple`). Callers hardcoding
spaced web keys must update; callers relying on the normalizer
(passing any casing/whitespace) are unaffected.
* `convert` now accepts a `palette` option and a new
`'NAME'` format value. The old behaviour (no palette) is unchanged.
This is additive in practice — nothing that worked before stops
working; `convert(pantoneString, { format: 'HEX' })` without a palette
still throws (same as before).
* type `Colorspace<Name>` renamed to `Palette<Name>`;
option key `colorspace:` renamed to `palette:` on `identify` and
`resolve`. Migration is a pure find/replace — no semantic change. See
the README BYO section for the new shape.
* `PantoneCode` type alias removed from the public surface.
Callers importing the type should use `string` for inputs to
`pantoneToRgba` or `PantoneColorName` for narrow typed returns.
`nearest()` (internal API, but exported) now requires a `metric` argument.
* `identify` and `resolve` (with a `format: HEX`
return) still behave the same at the input side, but return values
now match the humanized keys. Examples:

  identify('#663399')                              // was 'rebeccapurple'; now 'rebecca purple'
  identify('#ff8080')                              // was 'lightcoral';    now 'light coral'
  identify('#e4002b', { colorspace: pantone })     // was '185C';          now '185 C'
  identify('#7f7f7f', { colorspace: x11 })         // was 'gray50';        now 'gray 50'
  convert('#e4002b', { format: 'PANTONE' })        // was '185C';          now '185 C'

Direct palette access also uses the new keys:

  // before:  web.colors.rebeccapurple
  // after:   web.colors['rebecca purple']
  // before:  pantone.colors['185C']
  // after:   pantone.colors['185 C']
* `identify` and `resolve` no longer accept colorspace
strings. Pass the palette object instead:

  // before
  identify('#e20074', { colorspace: 'pantone' })
  resolve('185 C', { colorspace: 'pantone' })

  // after
  import { identify, resolve, pantone } from 'chromonym';
  identify('#e20074', { colorspace: pantone })
  resolve('185 C', { colorspace: pantone })

Palette data now lives under `.colors`:

  // before: web.crimson              // '#dc143c'
  // after:  web.colors.crimson       // '#dc143c'

The `ColorspaceName` type has been removed. `Colorspace` is now a
generic `Colorspace<Name>`. `DistanceMetric` and `NormalizeFn` are
exported from the root barrel for BYO palette authors.

## [1.4.1](https://github.com/simiancraft/chromonym/compare/v1.4.0...v1.4.1) (2026-04-18)


### Bug Fixes

* republish to ship README humanization to npm ([d3ab002](https://github.com/simiancraft/chromonym/commit/d3ab002516972a0a2a715094117077081aff4a0e))

# [1.4.0](https://github.com/simiancraft/chromonym/compare/v1.3.1...v1.4.0) (2026-04-18)


### Features

* **types:** narrow identify return via generic over colorspace ([0c7148c](https://github.com/simiancraft/chromonym/commit/0c7148c2e17916ce3c5699f74c6f1c9ebd40c96b))

## [1.3.1](https://github.com/simiancraft/chromonym/compare/v1.3.0...v1.3.1) (2026-04-18)


### Bug Fixes

* republish to sync npm with latest README ([4bc77c5](https://github.com/simiancraft/chromonym/commit/4bc77c508e60fd4f95c645fef15e5b061a8a110e))

# [1.3.0](https://github.com/simiancraft/chromonym/compare/v1.2.0...v1.3.0) (2026-04-18)


### Features

* **demo:** swap Tailwind CDN for @tailwindcss/vite build-time plugin ([0df6cda](https://github.com/simiancraft/chromonym/commit/0df6cdac315127144b63a729657789b44ce80a0c))
* **demo:** URL state sharing + preset buttons + shared banner SVG ([b6061f0](https://github.com/simiancraft/chromonym/commit/b6061f0322116d1c2583ba72e499960fc73140a5))
* **math:** add OKLCh polar conversion (oklabToOklch / oklchToOklab / rgbaToOklch) ([77b927b](https://github.com/simiancraft/chromonym/commit/77b927b9434f66a7a61b399623ae99bcc71cc337))


### Performance Improvements

* **assets:** lossless re-compress banner.png (1.98 MB → 178 KB, -91%) ([5e5b60c](https://github.com/simiancraft/chromonym/commit/5e5b60c1d882b71c9bf9c471c117b58cd1e157f0))

# [1.2.0](https://github.com/simiancraft/chromonym/compare/v1.1.0...v1.2.0) (2026-04-18)


### Bug Fixes

* **ci+test:** build before test; skip subpath tests when dist missing ([20e2b95](https://github.com/simiancraft/chromonym/commit/20e2b95ba651e729e60116ba03b9d0aa33f7da7d))
* **ci:** gate Codecov upload on non-fork ([394d8f8](https://github.com/simiancraft/chromonym/commit/394d8f84a9fd81412021819e6aa8516eb2d5ae22))
* **conversions:** validate finite numerics and clamp input range ([02de8b7](https://github.com/simiancraft/chromonym/commit/02de8b72c117015a813cbd9c84ee434ad570b58b))
* **security:** harden input type checks and colorspace lookups ([7a46a6b](https://github.com/simiancraft/chromonym/commit/7a46a6bfdec0c9051dd5f22b167fddba89896ee5))


### Features

* **demo:** add isolated Vite+React demo deployed to GitHub Pages ([ee10cb2](https://github.com/simiancraft/chromonym/commit/ee10cb27d9d9d5a90ca61d586969ec17f2ff964c))
* **identify:** add distance-metric strategy with per-colorspace defaults ([c8a1877](https://github.com/simiancraft/chromonym/commit/c8a1877a5167622e0f17dd9a78a93bf37a23e4d1))
* **math:** add OKLAB color space + deltaEok metric ([1b7714a](https://github.com/simiancraft/chromonym/commit/1b7714a746b38f9998af08a5f680b3325d0c1803))
* **math:** add sRGB ↔ linear ↔ XYZ ↔ Lab color-space conversions ([6fb0429](https://github.com/simiancraft/chromonym/commit/6fb0429819775458fa342f41c3fde3f99b8394b9)), closes [#ff0000](https://github.com/simiancraft/chromonym/issues/ff0000)
* **math:** add ΔE*00 (CIEDE2000) distance metric ([bbb5453](https://github.com/simiancraft/chromonym/commit/bbb5453f71e7c332286f7ff9aff278012e05729e))
* **math:** add ΔE*76 distance metric (CIE 1976 Lab Euclidean) ([f9631fa](https://github.com/simiancraft/chromonym/commit/f9631fa72deb3603c1b0624498d26f069ad8588d))
* **math:** add ΔE*94 distance metric (CIE 1994) ([03c5454](https://github.com/simiancraft/chromonym/commit/03c54546eccbb9386175c9d8995dce35b7afde80))
* **pkg:** add subpath exports for tree-shake-minimal imports ([9be6900](https://github.com/simiancraft/chromonym/commit/9be69001904a7ee68f7d735f8c60be6165a5ff06))


### Performance Improvements

* **deltaE2000:** inline Math.hypot and **7, hoist 25^7 constant ([55405ed](https://github.com/simiancraft/chromonym/commit/55405ed8a20d8dc09562caa5665a6bccd1959406))

# [1.1.0](https://github.com/simiancraft/chromonym/compare/v1.0.1...v1.1.0) (2026-04-17)


### Features

* add detectFormat, euclideanDistance, and HSV types ([6d8ca7a](https://github.com/simiancraft/chromonym/commit/6d8ca7aec5b16f53bd3d6831577705da43cdafcc))
* add x11 and pantone colorspaces with generator scripts ([094a97b](https://github.com/simiancraft/chromonym/commit/094a97b5cd69ab807608d025f87520886298ecd7))
* **conversions:** add hex <-> rgba converters ([ebe081e](https://github.com/simiancraft/chromonym/commit/ebe081e93eefbd79925574e484774e7927e4b2f1))
* **conversions:** add hsl <-> rgba converters ([a2d4372](https://github.com/simiancraft/chromonym/commit/a2d437221d3fd4c5e70433c0dc924f189b3636a1))
* **conversions:** add hsv <-> rgba converters ([5b4287e](https://github.com/simiancraft/chromonym/commit/5b4287e765989fbe8be9354d8f4fdc94d7e008ac))
* **conversions:** add pantone <-> rgba converters ([ba4d7e5](https://github.com/simiancraft/chromonym/commit/ba4d7e5685b09cea69c7de585c13df16632f7c0f))
* **conversions:** add rgb <-> rgba converters ([571f4b2](https://github.com/simiancraft/chromonym/commit/571f4b2901c808f4b055864d80557aba2778a8f4))
* **convert:** add convert dispatcher ([1d5fe83](https://github.com/simiancraft/chromonym/commit/1d5fe833ec350469a5c222987c491dff62925382))
* **identify:** add identify dispatcher ([49944a6](https://github.com/simiancraft/chromonym/commit/49944a6bcdc3db8369b7152563e662dd12739395))
* **resolve:** add resolve dispatcher ([8b0fbbb](https://github.com/simiancraft/chromonym/commit/8b0fbbb1280725a235e1058697f9d482194cad6b))

## [1.0.1](https://github.com/simiancraft/chromonym/compare/v1.0.0...v1.0.1) (2026-04-17)


### Bug Fixes

* **ci:** enable npm Trusted Publishing via @semantic-release/npm v13 ([7cddd3e](https://github.com/simiancraft/chromonym/commit/7cddd3ed71549d6a5332346e1a432490d72bc48f))
* **ci:** install Node 22 for semantic-release v25 ([785bd83](https://github.com/simiancraft/chromonym/commit/785bd834af995a4e0f043c0254c310749e5363ba))
* **types:** accept RgbString with space after comma ([07e8a2a](https://github.com/simiancraft/chromonym/commit/07e8a2a5e70e1a5cc1e8e3432f6823f35f0541c0))

# 1.0.0 (2026-04-17)


### Bug Fixes

* **ci:** drop setup-node step that clobbered npm auth ([2ac3074](https://github.com/simiancraft/chromonym/commit/2ac3074663cbbd212fa2fe48b43d94f841516d18))


### Features

* export color groups, cssColorList, and input types ([3669b28](https://github.com/simiancraft/chromonym/commit/3669b28f00e142a92c69a357408a0c5f2bf617aa))
