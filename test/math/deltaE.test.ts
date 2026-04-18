import { describe, expect, it } from 'bun:test';
import { rgbaToLab } from '../../src/math/colorSpace';
import { deltaE76, deltaE76Squared } from '../../src/math/deltaE';

describe('deltaE76', () => {
  it('identity: d(x, x) === 0', () => {
    const lab = rgbaToLab({ r: 128, g: 128, b: 128, a: 1 });
    expect(deltaE76(lab, lab)).toBe(0);
  });
  it('symmetry: d(p, q) === d(q, p)', () => {
    const p = rgbaToLab({ r: 255, g: 0, b: 0, a: 1 });
    const q = rgbaToLab({ r: 0, g: 255, b: 0, a: 1 });
    expect(deltaE76(p, q)).toBeCloseTo(deltaE76(q, p), 10);
  });
  it('known value: pure red vs pure green', () => {
    // Red Lab ≈ (53.24, 80.09, 67.2); Green Lab ≈ (87.73, -86.18, 83.18)
    // ΔE76 = √(34.49² + 166.27² + 15.98²) ≈ 170.29
    const r = rgbaToLab({ r: 255, g: 0, b: 0, a: 1 });
    const g = rgbaToLab({ r: 0, g: 255, b: 0, a: 1 });
    expect(deltaE76(r, g)).toBeCloseTo(170.29, 0);
  });
  it('just-noticeable difference: ΔE ≈ 1 for a minimally-different pair', () => {
    // A 1-unit sRGB shift in the mid-gray region produces a ΔE near 1.
    const a = rgbaToLab({ r: 128, g: 128, b: 128, a: 1 });
    const b = rgbaToLab({ r: 129, g: 128, b: 128, a: 1 });
    const d = deltaE76(a, b);
    expect(d).toBeGreaterThan(0.1);
    expect(d).toBeLessThan(2.0);
  });
  it('square variant is monotonic with unsquared (argmin preserved)', () => {
    const target = rgbaToLab({ r: 255, g: 0, b: 0, a: 1 });
    const candidates = [
      rgbaToLab({ r: 200, g: 50, b: 50, a: 1 }),
      rgbaToLab({ r: 0, g: 255, b: 0, a: 1 }),
      rgbaToLab({ r: 0, g: 0, b: 255, a: 1 }),
    ];
    const distances = candidates.map((c) => deltaE76(target, c));
    const squared = candidates.map((c) => deltaE76Squared(target, c));
    // argmin must match
    const argmin = (arr: number[]) => arr.indexOf(Math.min(...arr));
    expect(argmin(distances)).toBe(argmin(squared));
  });
});
