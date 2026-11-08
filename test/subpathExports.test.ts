import { describe, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Smoke tests proving each package.json "exports" subpath resolves
 * against the emitted dist/ tree (what npm consumers actually see).
 *
 * Two layers:
 *   1. Fast dist-path imports (`../dist/…`) — confirms the emitted files
 *      exist and re-export what's expected. Doesn't exercise the exports
 *      map or Node's ESM extension rules.
 *   2. A real Node ESM subprocess that imports every subpath via the
 *      package specifier (`chromonym/web`, etc.). This IS what an npm
 *      consumer does, and it's the only check that catches regressions
 *      like bundler-style extensionless relative imports in emitted
 *      output. Uses Node self-referencing (the repo's package.json
 *      declares `name: "chromonym"`, so Node resolves `chromonym/…`
 *      through our own exports map).
 *
 * These tests require `bun run build` to have run first — if dist/ is
 * missing, the suite is skipped cleanly rather than false-failing. CI
 * builds before running tests; local devs should run `bun run build`
 * before `bun test` if they want the subpath assertions to execute.
 */
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST_URL = new URL('../dist/', import.meta.url);
const DIST_READY = existsSync(new URL('index.js', DIST_URL));
const PKG_JSON = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const maybe = DIST_READY ? describe : describe.skip;

maybe('subpath exports resolve', () => {
  it('chromonym (root barrel) exposes the primary API', async () => {
    const m = await import('../dist/index.js');
    expect(typeof m.identify).toBe('function');
    expect(typeof m.resolve).toBe('function');
    expect(typeof m.convert).toBe('function');
    expect(typeof m.detectFormat).toBe('function');
    expect(typeof m.isColor).toBe('function');
    expect(typeof m.web).toBe('object');
    expect(m.web.name).toBe('web');
  });

  it('chromonym/web exports the web palette object', async () => {
    const m = await import('../dist/palettes/web.js');
    expect(m.web.name).toBe('web');
    expect(m.web.colors.red).toBe('#ff0000');
    expect(typeof m.web.normalize).toBe('function');
    expect(m.web.defaultMetric).toBe('deltaE76');
  });

  it('chromonym/x11 exports the x11 palette object', async () => {
    const m = await import('../dist/palettes/x11.js');
    expect(m.x11.name).toBe('x11');
    expect(Object.keys(m.x11.colors).length).toBeGreaterThan(600);
  });

  it('chromonym/pantone exports the pantone palette object', async () => {
    const m = await import('../dist/palettes/pantone.js');
    expect(m.pantone.name).toBe('pantone');
    expect(m.pantone.colors['185 C']).toBe('#e4002b');
    expect(m.pantone.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/copic exports the Copic palette object', async () => {
    const m = await import('../dist/palettes/copic.js');
    expect(m.copic.name).toBe('copic');
    expect(m.copic.colors.B01).toBe('#e1f1f3');
    expect(Object.keys(m.copic.colors).length).toBe(358);
    expect(m.copic.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/crayola exports the crayola palette object', async () => {
    const m = await import('../dist/palettes/crayola.js');
    expect(m.crayola.name).toBe('crayola');
    expect(m.crayola.colors.Razzmatazz).toBe('#e3256b');
    expect(m.crayola.defaultMetric).toBe('deltaEok');
  });

  it('chromonym/farrow-ball exports the Farrow & Ball palette object', async () => {
    const m = await import('../dist/palettes/farrowBall.js');
    expect(m.farrowBall.name).toBe('farrowBall');
    expect(m.farrowBall.colors["Elephant's Breath"]).toBe('#ccbfb3');
    expect(Object.keys(m.farrowBall.colors)).toHaveLength(132);
    expect(m.farrowBall.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/ntc exports the ntc palette object', async () => {
    const m = await import('../dist/palettes/ntc.js');
    expect(m.ntc.name).toBe('ntc');
    expect(m.ntc.colors.Stratos).toBe('#000741');
    expect(m.ntc.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/xkcd exports the xkcd palette object', async () => {
    const m = await import('../dist/palettes/xkcd.js');
    expect(m.xkcd.name).toBe('xkcd');
    expect(m.xkcd.colors['cloudy blue']).toBe('#acc2d9');
    expect(m.xkcd.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/carc exports the CARC palette object', async () => {
    const m = await import('../dist/palettes/carc.js');
    expect(m.carc.name).toBe('carc');
    expect(m.carc.colors['Green 383']).toBe('#4f5443');
    expect(Object.keys(m.carc.colors).length).toBe(26);
    expect(m.carc.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/mil-std-101c exports the milStd101c palette object', async () => {
    const m = await import('../dist/palettes/milStd101c.js');
    expect(m.milStd101c.name).toBe('milStd101c');
    expect(m.milStd101c.colors.Yellow).toBe('#fcb217');
    expect(Object.keys(m.milStd101c.colors).length).toBe(10);
    expect(m.milStd101c.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/mil-std-709d exports the milStd709d palette object', async () => {
    const m = await import('../dist/palettes/milStd709d.js');
    expect(m.milStd709d.name).toBe('milStd709d');
    expect(m.milStd709d.colors.Yellow).toBe('#f5a01c');
    expect(Object.keys(m.milStd709d.colors).length).toBe(18);
    expect(m.milStd709d.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/fs595c exports the fs595c palette object', async () => {
    const m = await import('../dist/palettes/fs595c.js');
    expect(m.fs595c.name).toBe('fs595c');
    expect(m.fs595c.colors['FS 11136']).toBe('#8c4040');
    expect(m.fs595c.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/fs595b exports the fs595b palette object', async () => {
    const m = await import('../dist/palettes/fs595b.js');
    expect(m.fs595b.name).toBe('fs595b');
    // Same code, different hex vs FS595C: verifies the two revisions
    // are distinct palettes and not cross-linked.
    expect(m.fs595b.colors['FS 11136']).toBe('#9b2f25');
    expect(m.fs595b.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/tcca exports the TCCA palette object', async () => {
    const m = await import('../dist/palettes/tcca.js');
    expect(m.tcca.name).toBe('tcca');
    expect(m.tcca.colors['Old Glory Red 70180']).toBe('#9c1c2d');
    expect(m.tcca.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/iscc-nbs exports the isccNbs palette object', async () => {
    const m = await import('../dist/palettes/isccNbs.js');
    expect(m.isccNbs.name).toBe('isccNbs');
    expect(m.isccNbs.colors['Vivid pink']).toBe('#fd7992');
    expect(m.isccNbs.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/japanese exports the japanese palette object', async () => {
    const m = await import('../dist/palettes/japanese.js');
    expect(m.japanese.name).toBe('japanese');
    expect(m.japanese.colors['Sakura-iro']).toBe('#fcc9b9');
    expect(Object.keys(m.japanese.colors)).toHaveLength(227);
    expect(m.japanese.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/nbs exports the nbs palette object', async () => {
    const m = await import('../dist/palettes/nbs.js');
    expect(m.nbs.name).toBe('nbs');
    // Different hex from isccNbs's 'Vivid pink' — proves the two
    // digitizations ship as distinct palettes.
    expect(m.nbs.colors.vividpink).toBe('#ffb5ba');
    expect(m.nbs.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/resene exports the resene palette object', async () => {
    const m = await import('../dist/palettes/resene.js');
    expect(m.resene.name).toBe('resene');
    expect(m.resene.colors.treepoppy).toBe('#e2813b');
    expect(m.resene.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/ncs exports the ncs palette object', async () => {
    const m = await import('../dist/palettes/ncs.js');
    expect(m.ncs.name).toBe('ncs');
    expect(m.ncs.colors['0500-N']).toBe('#f2f2f2');
    expect(m.ncs.defaultMetric).toBe('deltaE2000');
    // Custom normalizer strips optional 'NCS' and 'S ' prefixes.
    expect(m.ncs.normalize('NCS S 0500-N')).toBe('0500n');
    expect(m.ncs.normalize('S 0500-N')).toBe('0500n');
    expect(m.ncs.normalize('0500-N')).toBe('0500n');
  });

  it('chromonym/uswds exports the uswds palette object', async () => {
    const m = await import('../dist/palettes/uswds.js');
    expect(m.uswds.name).toBe('uswds');
    expect(m.uswds.colors['blue-60v']).toBe('#005ea2');
    expect(m.uswds.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/mil-std-2525d exports the milStd2525d palette object', async () => {
    const m = await import('../dist/palettes/milStd2525d.js');
    expect(m.milStd2525d.name).toBe('milStd2525d');
    expect(m.milStd2525d.colors['Friend Medium']).toBe('#00a8dc');
    expect(m.milStd2525d.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/us-military exports the usMilitary palette object', async () => {
    const m = await import('../dist/palettes/usMilitary.js');
    expect(m.usMilitary.name).toBe('usMilitary');
    expect(m.usMilitary.colors['Air Force Blue']).toBe('#00308f');
    expect(Object.keys(m.usMilitary.colors).length).toBe(31);
    expect(m.usMilitary.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/pokemon exports the pokemon palette object', async () => {
    const m = await import('../dist/palettes/pokemon.js');
    expect(m.pokemon.name).toBe('pokemon');
    expect(m.pokemon.colors.Fire).toBe('#ee8130');
    expect(m.pokemon.defaultMetric).toBe('deltaE76');
  });

  it('chromonym/werner exports the werner palette object', async () => {
    const m = await import('../dist/palettes/werner.js');
    expect(m.werner.name).toBe('werner');
    expect(m.werner.colors['Prussian Blue']).toBe('#1c1949');
    expect(m.werner.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/tailwind exports the tailwind palette object', async () => {
    const m = await import('../dist/palettes/tailwind.js');
    expect(m.tailwind.name).toBe('tailwind');
    expect(m.tailwind.colors['slate-500']).toBe('#62748e');
    expect(Object.keys(m.tailwind.colors).length).toBe(242);
    expect(m.tailwind.defaultMetric).toBe('deltaEok');
  });

  it('chromonym/material exports the Material palette object', async () => {
    const m = await import('../dist/palettes/material.js');
    expect(m.material.name).toBe('material');
    expect(m.material.colors['light-primary']).toBe('#6750a4');
    expect(m.material.colors['dark-primary']).toBe('#d0bcff');
    expect(Object.keys(m.material.colors).length).toBe(98);
    expect(m.material.defaultMetric).toBe('deltaEok');
  });

  it('chromonym/ral exports the ral palette object', async () => {
    const m = await import('../dist/palettes/ral.js');
    expect(m.ral.name).toBe('ral');
    expect(m.ral.colors['RAL 1003']).toBe('#f9a900');
    expect(m.ral.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/conversions/hex exports hexToRgba / rgbaToHex', async () => {
    const m = await import('../dist/conversions/hex.js');
    expect(m.hexToRgba('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
  });

  it('chromonym/conversions/rgb exports rgb[a]ToRgba / rgbaToRgb', async () => {
    const m = await import('../dist/conversions/rgb.js');
    expect(m.rgbToRgba([255, 0, 0])).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToRgb({ r: 255, g: 0, b: 0, a: 1 })).toBe('rgb(255, 0, 0)');
  });

  it('chromonym/conversions/hsl exports hslToRgba / rgbaToHsl', async () => {
    const m = await import('../dist/conversions/hsl.js');
    expect(m.hslToRgba({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHsl({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsl(0, 100%, 50%)');
  });

  it('chromonym/conversions/hsv exports hsvToRgba / rgbaToHsv', async () => {
    const m = await import('../dist/conversions/hsv.js');
    expect(m.hsvToRgba({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHsv({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsv(0, 100%, 100%)');
  });

  it('chromonym/conversions/pantone exports pantoneToRgba / rgbaToPantone', async () => {
    const m = await import('../dist/conversions/pantone.js');
    expect(m.pantoneToRgba('185 C')).toEqual({ r: 228, g: 0, b: 43, a: 1 });
    expect(m.rgbaToPantone({ r: 228, g: 0, b: 43, a: 1 })).toBe('185 C');
  });

  it('chromonym/math/deltaE exports the distance functions', async () => {
    const m = await import('../dist/math/deltaE.js');
    expect(m.deltaE76([50, 0, 0], [50, 0, 0])).toBe(0);
    expect(typeof m.deltaE2000).toBe('function');
  });

  it('chromonym/math/colorSpace exports conversions', async () => {
    const m = await import('../dist/math/colorSpace.js');
    expect(m.srgbToLinear(0)).toBe(0);
    expect(typeof m.rgbaToLab).toBe('function');
  });

  it('chromonym/types is resolvable (type-only module)', async () => {
    const m = await import('../dist/types.js');
    expect(m.COLOR_FORMATS).toBeInstanceOf(Set);
    expect(m.COLOR_FORMATS.has('HEX')).toBe(true);
    // `as never` is intentional: asserts 'PANTONE' is both runtime-absent AND
    // compile-time-unassignable to the narrow ColorFormat union. Removing the
    // cast would weaken this to a runtime-only check.
    expect(m.COLOR_FORMATS.has('PANTONE' as never)).toBe(false);
  });

  it('every package.json exports entry points to an emitted file', () => {
    for (const [subpath, conditions] of Object.entries<{ import: string; types: string }>(
      PKG_JSON.exports,
    )) {
      if (subpath === './package.json') continue;
      const importPath = conditions.import;
      const typesPath = conditions.types;
      expect(existsSync(new URL(`../${importPath}`, import.meta.url))).toBe(true);
      expect(existsSync(new URL(`../${typesPath}`, import.meta.url))).toBe(true);
    }
  });

  it('stale v1 registry artifacts are not shipped', () => {
    // src/colorspaces/registry.ts was deleted in this branch (v1 artifact);
    // src/colorspaces/ itself was later renamed to src/palettes/. A dirty
    // dist/ without a clean step would carry either. This test fails if the
    // build pipeline forgot to clean dist/ first.
    expect(existsSync(new URL('colorspaces/registry.js', DIST_URL))).toBe(false);
    expect(existsSync(new URL('colorspaces/registry.d.ts', DIST_URL))).toBe(false);
    expect(existsSync(new URL('colorspaces/web.js', DIST_URL))).toBe(false);
  });

  it('real Node ESM resolves every subpath via the package specifier', () => {
    // Catches regressions that dist-path imports mask: bundler-style
    // extensionless relative imports in emitted files, missing "default"
    // conditions, mis-mapped exports. This spawns Node with `cwd` at the
    // project root so that `import('chromonym/…')` self-resolves through
    // our own package.json exports map.
    const script = [
      "const { pantone } = await import('chromonym/pantone');",
      "const { copic } = await import('chromonym/copic');",
      "const { web } = await import('chromonym/web');",
      "const { x11 } = await import('chromonym/x11');",
      "const { crayola } = await import('chromonym/crayola');",
      "const { farrowBall } = await import('chromonym/farrow-ball');",
      "const { ntc } = await import('chromonym/ntc');",
      "const { xkcd } = await import('chromonym/xkcd');",
      "const { carc } = await import('chromonym/carc');",
      "const { milStd101c } = await import('chromonym/mil-std-101c');",
      "const { milStd709d } = await import('chromonym/mil-std-709d');",
      "const { fs595c } = await import('chromonym/fs595c');",
      "const { fs595b } = await import('chromonym/fs595b');",
      "const { tcca } = await import('chromonym/tcca');",
      "const { isccNbs } = await import('chromonym/iscc-nbs');",
      "const { japanese } = await import('chromonym/japanese');",
      "const { resene } = await import('chromonym/resene');",
      "const { ncs } = await import('chromonym/ncs');",
      "const { nbs } = await import('chromonym/nbs');",
      "const { pokemon } = await import('chromonym/pokemon');",
      "const { werner } = await import('chromonym/werner');",
      "const { tailwind } = await import('chromonym/tailwind');",
      "const { material } = await import('chromonym/material');",
      "const { ral } = await import('chromonym/ral');",
      "const { milStd2525d } = await import('chromonym/mil-std-2525d');",
      "const { usMilitary } = await import('chromonym/us-military');",
      "const { uswds } = await import('chromonym/uswds');",
      "const { hexToRgba } = await import('chromonym/conversions/hex');",
      "const { rgbToRgba } = await import('chromonym/conversions/rgb');",
      "const { hslToRgba } = await import('chromonym/conversions/hsl');",
      "const { hsvToRgba } = await import('chromonym/conversions/hsv');",
      "const p2 = await import('chromonym/conversions/pantone');",
      "const deltaE = await import('chromonym/math/deltaE');",
      "const colorSpace = await import('chromonym/math/colorSpace');",
      "const types = await import('chromonym/types');",
      "const root = await import('chromonym');",
      'const out = {',
      '  pantoneName: pantone.name,',
      '  copicBlue: copic.colors.B01 === "#e1f1f3",',
      '  webRed: web.colors.red,',
      '  x11Count: Object.keys(x11.colors).length > 600,',
      '  crayolaRazz: crayola.colors.Razzmatazz === "#e3256b",',
      '  farrowBallElephant: farrowBall.colors["Elephant\'s Breath"] === "#ccbfb3",',
      '  ntcStratos: ntc.colors.Stratos === "#000741",',
      '  xkcdCloudyBlue: xkcd.colors["cloudy blue"] === "#acc2d9",',
      '  carcGreen383: carc.colors["Green 383"] === "#4f5443",',
      '  milStd101cYellow: milStd101c.colors.Yellow === "#fcb217",',
      '  milStd709dYellow: milStd709d.colors.Yellow === "#f5a01c",',
      '  fs595cInsignia: fs595c.colors["FS 11136"] === "#8c4040",',
      '  fs595bInsignia: fs595b.colors["FS 11136"] === "#9b2f25",',
      '  tccaOldGloryRed: tcca.colors["Old Glory Red 70180"] === "#9c1c2d",',
      '  isccNbsVividPink: isccNbs.colors["Vivid pink"] === "#fd7992",',
      '  japaneseSakura: japanese.colors["Sakura-iro"] === "#fcc9b9",',
      '  reseneTreepoppy: resene.colors.treepoppy === "#e2813b",',
      '  ncsNeutral: ncs.colors["0500-N"] === "#f2f2f2",',
      '  nbsVividPink: nbs.colors.vividpink === "#ffb5ba",',
      '  pokemonFire: pokemon.colors.Fire === "#ee8130",',
      '  wernerPrussian: werner.colors["Prussian Blue"] === "#1c1949",',
      '  tailwindSlate: tailwind.colors["slate-500"] === "#62748e",',
      '  materialPrimary: material.colors["light-primary"] === "#6750a4",',
      '  ralSignalYellow: ral.colors["RAL 1003"] === "#f9a900",',
      '  milStd2525dFriend: milStd2525d.colors["Friend Medium"] === "#00a8dc",',
      '  usMilitaryBlue: usMilitary.colors["Air Force Blue"] === "#00308f",',
      '  uswdsBlue: uswds.colors["blue-60v"] === "#005ea2",',
      "  hexToRgba: hexToRgba('#ff0000').r === 255,",
      '  rgb: rgbToRgba([1,2,3]).r === 1,',
      '  hsl: hslToRgba({ h: 0, s: 100, l: 50 }).r === 255,',
      '  hsv: hsvToRgba({ h: 0, s: 100, v: 100 }).r === 255,',
      "  pantoneConv: typeof p2.pantoneToRgba === 'function',",
      '  dE: deltaE.deltaE76([50,0,0],[50,0,0]) === 0,',
      '  cs: colorSpace.srgbToLinear(0) === 0,',
      "  types: types.COLOR_FORMATS.has('HEX'),",
      "  root: typeof root.identify === 'function',",
      '};',
      'process.stdout.write(JSON.stringify(out));',
    ].join(' ');
    // No try/catch wrapper: if execFileSync fails (broken exports map OR
    // subprocess/script error), Node attaches .stdout and .stderr to the
    // thrown error, and Bun's test runner surfaces them in the failure
    // report. That distinguishes the two failure modes without extra code.
    const output = execFileSync('node', ['--input-type=module', '-e', script], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const result = JSON.parse(output);
    expect(result).toEqual({
      pantoneName: 'pantone',
      copicBlue: true,
      webRed: '#ff0000',
      x11Count: true,
      crayolaRazz: true,
      farrowBallElephant: true,
      ntcStratos: true,
      xkcdCloudyBlue: true,
      carcGreen383: true,
      milStd101cYellow: true,
      milStd709dYellow: true,
      fs595cInsignia: true,
      fs595bInsignia: true,
      tccaOldGloryRed: true,
      isccNbsVividPink: true,
      japaneseSakura: true,
      reseneTreepoppy: true,
      ncsNeutral: true,
      nbsVividPink: true,
      pokemonFire: true,
      wernerPrussian: true,
      tailwindSlate: true,
      materialPrimary: true,
      ralSignalYellow: true,
      milStd2525dFriend: true,
      usMilitaryBlue: true,
      uswdsBlue: true,
      hexToRgba: true,
      rgb: true,
      hsl: true,
      hsv: true,
      pantoneConv: true,
      dE: true,
      cs: true,
      types: true,
      root: true,
    });
  });
});
