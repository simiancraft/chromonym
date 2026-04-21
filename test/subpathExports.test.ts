import { describe, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

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
const PROJECT_ROOT = new URL('../', import.meta.url).pathname;
const DIST_URL = new URL('../dist/', import.meta.url);
const DIST_READY = existsSync(new URL('index.js', DIST_URL));
const PKG_JSON = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const maybe = DIST_READY ? describe : describe.skip;

maybe('subpath exports resolve', () => {
  it('chromonym (root barrel) exposes the primary API', async () => {
    const m = await import('../dist/index');
    expect(typeof m.identify).toBe('function');
    expect(typeof m.resolve).toBe('function');
    expect(typeof m.convert).toBe('function');
    expect(typeof m.detectFormat).toBe('function');
    expect(typeof m.isColor).toBe('function');
    expect(typeof m.web).toBe('object');
    expect(m.web.name).toBe('web');
  });

  it('chromonym/web exports the web palette object', async () => {
    const m = await import('../dist/palettes/web');
    expect(m.web.name).toBe('web');
    expect(m.web.colors.red).toBe('#ff0000');
    expect(typeof m.web.normalize).toBe('function');
    expect(m.web.defaultMetric).toBe('deltaE76');
  });

  it('chromonym/x11 exports the x11 palette object', async () => {
    const m = await import('../dist/palettes/x11');
    expect(m.x11.name).toBe('x11');
    expect(Object.keys(m.x11.colors).length).toBeGreaterThan(600);
  });

  it('chromonym/pantone exports the pantone palette object', async () => {
    const m = await import('../dist/palettes/pantone');
    expect(m.pantone.name).toBe('pantone');
    expect(m.pantone.colors['185 C']).toBe('#e4002b');
    expect(m.pantone.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/crayola exports the crayola palette object', async () => {
    const m = await import('../dist/palettes/crayola');
    expect(m.crayola.name).toBe('crayola');
    expect(m.crayola.colors.Razzmatazz).toBe('#e3256b');
    expect(m.crayola.defaultMetric).toBe('deltaEok');
  });

  it('chromonym/ntc exports the ntc palette object', async () => {
    const m = await import('../dist/palettes/ntc');
    expect(m.ntc.name).toBe('ntc');
    expect(m.ntc.colors.Stratos).toBe('#000741');
    expect(m.ntc.defaultMetric).toBe('deltaE2000');
  });

  it('chromonym/conversions/hex exports hexToRgba / rgbaToHex', async () => {
    const m = await import('../dist/conversions/hex');
    expect(m.hexToRgba('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
  });

  it('chromonym/conversions/rgb exports rgb[a]ToRgba / rgbaToRgb', async () => {
    const m = await import('../dist/conversions/rgb');
    expect(m.rgbToRgba([255, 0, 0])).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToRgb({ r: 255, g: 0, b: 0, a: 1 })).toBe('rgb(255, 0, 0)');
  });

  it('chromonym/conversions/hsl exports hslToRgba / rgbaToHsl', async () => {
    const m = await import('../dist/conversions/hsl');
    expect(m.hslToRgba({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHsl({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsl(0, 100%, 50%)');
  });

  it('chromonym/conversions/hsv exports hsvToRgba / rgbaToHsv', async () => {
    const m = await import('../dist/conversions/hsv');
    expect(m.hsvToRgba({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHsv({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsv(0, 100%, 100%)');
  });

  it('chromonym/conversions/pantone exports pantoneToRgba / rgbaToPantone', async () => {
    const m = await import('../dist/conversions/pantone');
    expect(m.pantoneToRgba('185 C')).toEqual({ r: 228, g: 0, b: 43, a: 1 });
    expect(m.rgbaToPantone({ r: 228, g: 0, b: 43, a: 1 })).toBe('185 C');
  });

  it('chromonym/math/deltaE exports the distance functions', async () => {
    const m = await import('../dist/math/deltaE');
    expect(m.deltaE76([50, 0, 0], [50, 0, 0])).toBe(0);
    expect(typeof m.deltaE2000).toBe('function');
  });

  it('chromonym/math/colorSpace exports conversions', async () => {
    const m = await import('../dist/math/colorSpace');
    expect(m.srgbToLinear(0)).toBe(0);
    expect(typeof m.rgbaToLab).toBe('function');
  });

  it('chromonym/types is resolvable (type-only module)', async () => {
    const m = await import('../dist/types');
    expect(m.COLOR_FORMATS).toBeInstanceOf(Set);
    expect(m.COLOR_FORMATS.has('HEX')).toBe(true);
    expect(m.COLOR_FORMATS.has('PANTONE' as never)).toBe(false);
  });

  it('every package.json exports entry points to an emitted file', () => {
    for (const [subpath, conditions] of Object.entries<Record<string, string>>(PKG_JSON.exports)) {
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
      "const { web } = await import('chromonym/web');",
      "const { x11 } = await import('chromonym/x11');",
      "const { crayola } = await import('chromonym/crayola');",
      "const { ntc } = await import('chromonym/ntc');",
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
      '  webRed: web.colors.red,',
      '  x11Count: Object.keys(x11.colors).length > 600,',
      '  crayolaRazz: crayola.colors.Razzmatazz === "#e3256b",',
      '  ntcStratos: ntc.colors.Stratos === "#000741",',
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
    const output = execFileSync('node', ['--input-type=module', '-e', script], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const result = JSON.parse(output);
    expect(result).toEqual({
      pantoneName: 'pantone',
      webRed: '#ff0000',
      x11Count: true,
      crayolaRazz: true,
      ntcStratos: true,
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
