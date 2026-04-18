import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

/**
 * Smoke tests proving each package.json "exports" subpath resolves
 * against the emitted dist/ tree (what npm consumers actually see).
 *
 * These tests require `bun run build` to have run first — if dist/ is
 * missing, the suite is skipped cleanly rather than false-failing. CI
 * builds before running tests; local devs should run `bun run build`
 * before `bun test` if they want the subpath assertions to execute.
 */
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

  it('chromonym/web exports the web colorspace object', async () => {
    const m = await import('../dist/colorspaces/web');
    expect(m.web.name).toBe('web');
    expect(m.web.colors.red).toBe('#ff0000');
    expect(typeof m.web.normalize).toBe('function');
    expect(m.web.defaultMetric).toBe('deltaE76');
  });

  it('chromonym/x11 exports the x11 colorspace object', async () => {
    const m = await import('../dist/colorspaces/x11');
    expect(m.x11.name).toBe('x11');
    expect(Object.keys(m.x11.colors).length).toBeGreaterThan(600);
  });

  it('chromonym/pantone exports the pantone colorspace object', async () => {
    const m = await import('../dist/colorspaces/pantone');
    expect(m.pantone.name).toBe('pantone');
    expect(m.pantone.colors['185 C']).toBe('#e4002b');
    expect(m.pantone.defaultMetric).toBe('deltaE2000');
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
    // src/colorspaces/registry.ts was deleted in this branch; a dirty dist/
    // would still carry compiled output. This test fails if the build
    // pipeline forgot to clean dist/ first.
    expect(existsSync(new URL('colorspaces/registry.js', DIST_URL))).toBe(false);
    expect(existsSync(new URL('colorspaces/registry.d.ts', DIST_URL))).toBe(false);
  });
});
