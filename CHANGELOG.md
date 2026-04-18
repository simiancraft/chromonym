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
