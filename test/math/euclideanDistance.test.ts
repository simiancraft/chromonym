import { describe, expect, it } from 'bun:test';
import { euclideanDistance } from '../../src/math/euclideanDistance';

describe('euclideanDistance', () => {
  it('returns 0 for identical colors', () => {
    const c = { r: 100, g: 100, b: 100, a: 1 };
    expect(euclideanDistance(c, c)).toBe(0);
  });

  it('computes distance between black and white', () => {
    expect(
      euclideanDistance({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 }),
    ).toBeCloseTo(Math.sqrt(3 * 255 ** 2), 4);
  });

  it('computes distance between pure red and pure green', () => {
    expect(
      euclideanDistance({ r: 255, g: 0, b: 0, a: 1 }, { r: 0, g: 255, b: 0, a: 1 }),
    ).toBeCloseTo(Math.sqrt(2 * 255 ** 2), 4);
  });

  it('is symmetric: d(a,b) === d(b,a)', () => {
    const a = { r: 10, g: 20, b: 30, a: 1 };
    const b = { r: 40, g: 50, b: 60, a: 1 };
    expect(euclideanDistance(a, b)).toBe(euclideanDistance(b, a));
  });

  it('returns 1 for one-channel-one-unit difference', () => {
    expect(euclideanDistance({ r: 0, g: 0, b: 0, a: 1 }, { r: 1, g: 0, b: 0, a: 1 })).toBe(1);
  });

  it('ignores alpha channel (d=0 when only alpha differs)', () => {
    expect(
      euclideanDistance({ r: 100, g: 100, b: 100, a: 0 }, { r: 100, g: 100, b: 100, a: 1 }),
    ).toBe(0);
  });

  it('handles negative component deltas (squared, so always non-negative)', () => {
    expect(euclideanDistance({ r: 200, g: 0, b: 0, a: 1 }, { r: 100, g: 0, b: 0, a: 1 })).toBe(100);
  });
});
