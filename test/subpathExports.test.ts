import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';

/**
 * Smoke tests proving each package.json "exports" subpath resolves
 * against the emitted dist/ tree (what npm consumers actually see).
 *
 * These tests require `bun run build` to have run first — if dist/ is
 * missing, the suite is skipped cleanly rather than false-failing. CI
 * builds before running tests; local devs should run `bun run build`
 * before `bun test` if they want the subpath assertions to execute.
 */
const DIST_READY = existsSync(new URL('../dist/index.js', import.meta.url));
const maybe = DIST_READY ? describe : describe.skip;

maybe('subpath exports resolve', () => {
  it('chromonym/web exports the web colorspace object', async () => {
    const m = await import('../dist/colorspaces/web');
    expect(m.web.red).toBe('#ff0000');
  });

  it('chromonym/x11 exports the x11 colorspace object', async () => {
    const m = await import('../dist/colorspaces/x11');
    expect(typeof m.x11).toBe('object');
    expect(Object.keys(m.x11).length).toBeGreaterThan(600);
  });

  it('chromonym/pantone exports the pantone colorspace object', async () => {
    const m = await import('../dist/colorspaces/pantone');
    expect(m.pantone['185C']).toBe('#e4002b');
  });

  it('chromonym/conversions/hex exports hexToRgba / rgbaToHex', async () => {
    const m = await import('../dist/conversions/hex');
    expect(m.hexToRgba('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(m.rgbaToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
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
});
