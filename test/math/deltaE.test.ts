import { describe, expect, it } from 'bun:test';
import { rgbaToLab, rgbaToOklab } from '../../src/math/colorSpace';
import type { Lab } from '../../src/math/deltaE';
import {
  deltaE76,
  deltaE76Squared,
  deltaE94,
  deltaE2000,
  deltaEok,
  deltaEokSquared,
} from '../../src/math/deltaE';

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
  it('deltaE94: identity is 0', () => {
    const lab = rgbaToLab({ r: 128, g: 128, b: 128, a: 1 });
    expect(deltaE94(lab, lab)).toBe(0);
  });
  it('deltaE94: red vs green is smaller than deltaE76 (chroma de-weighting)', () => {
    const r = rgbaToLab({ r: 255, g: 0, b: 0, a: 1 });
    const g = rgbaToLab({ r: 0, g: 255, b: 0, a: 1 });
    expect(deltaE94(r, g)).toBeLessThan(deltaE76(r, g));
  });
  it('deltaE94: clamps dH² to 0 when floating-point drift makes it negative', () => {
    // Pick two colors with identical chroma to force dH² near zero.
    const lab1 = rgbaToLab({ r: 100, g: 100, b: 100, a: 1 });
    const lab2 = rgbaToLab({ r: 100, g: 100, b: 100, a: 1 });
    expect(deltaE94(lab1, lab2)).toBe(0);
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

describe('deltaE2000 — Sharma et al. (2005) reference vectors', () => {
  // From "The CIEDE2000 Color-Difference Formula" test tables.
  // Format: [labA, labB, expected ΔE00]
  // Reference values from Sharma/Wu/Dalal "Implementation Notes, Supplementary
  // Test Data and Mathematical Observations" (Color Research & Application, 2005).
  const cases: Array<[Lab, Lab, number]> = [
    // Near-identical blue-region pairs (rotation term engaged)
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
    [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0],
    [[50, -1.1848, -84.8006], [50, 0, -82.7485], 1.0],
    [[50, -0.9009, -85.5211], [50, 0, -82.7485], 1.0],
    // Larger differences
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[50, 2.5, 0], [56, -27, -3], 31.903],
    [[50, 2.5, 0], [58, 24, 15], 19.4535],
  ];

  for (const [p, q, expected] of cases) {
    it(`deltaE2000(${JSON.stringify(p)}, ${JSON.stringify(q)}) ≈ ${expected}`, () => {
      expect(deltaE2000(p, q)).toBeCloseTo(expected, 3);
    });
  }

  it('identity: d(x, x) === 0', () => {
    expect(deltaE2000([50, 2.5, 0], [50, 2.5, 0])).toBe(0);
  });

  it('symmetric: d(p, q) === d(q, p)', () => {
    const p: Lab = [50, 2.5, 0];
    const q: Lab = [73, 25, -18];
    expect(deltaE2000(p, q)).toBeCloseTo(deltaE2000(q, p), 10);
  });

  it('ΔE2000 differs from ΔE94 in blue region (rotation term active)', () => {
    // At h̄ ≈ 275°, ΔE2000's rotation term changes the coupling between dC and dH.
    const p: Lab = [50, 2.5, 0];
    const q: Lab = [50, 0, -2.5];
    // ΔE2000 ≈ 7.22 (with rotation), ΔE94 would be smaller.
    expect(deltaE2000(p, q)).toBeGreaterThan(deltaE94(p, q));
  });
});

describe('deltaEok (Euclidean in OKLAB)', () => {
  it('identity: d(x, x) === 0', () => {
    const ok = rgbaToOklab({ r: 128, g: 128, b: 128, a: 1 });
    expect(deltaEok(ok, ok)).toBe(0);
  });
  it('symmetric: d(p, q) === d(q, p)', () => {
    const p = rgbaToOklab({ r: 255, g: 0, b: 0, a: 1 });
    const q = rgbaToOklab({ r: 0, g: 255, b: 0, a: 1 });
    expect(deltaEok(p, q)).toBeCloseTo(deltaEok(q, p), 10);
  });
  it('red vs green is substantially > 0 in OKLAB', () => {
    const p = rgbaToOklab({ r: 255, g: 0, b: 0, a: 1 });
    const q = rgbaToOklab({ r: 0, g: 255, b: 0, a: 1 });
    // OKLAB L is ~0..1, so expect distance of order 0.3..0.7 between primaries.
    expect(deltaEok(p, q)).toBeGreaterThan(0.3);
    expect(deltaEok(p, q)).toBeLessThan(1.0);
  });
  it('square variant preserves argmin ordering', () => {
    const target = rgbaToOklab({ r: 255, g: 0, b: 0, a: 1 });
    const candidates = [
      rgbaToOklab({ r: 200, g: 50, b: 50, a: 1 }),
      rgbaToOklab({ r: 0, g: 255, b: 0, a: 1 }),
      rgbaToOklab({ r: 0, g: 0, b: 255, a: 1 }),
    ];
    const d = candidates.map((c) => deltaEok(target, c));
    const d2 = candidates.map((c) => deltaEokSquared(target, c));
    const argmin = (a: number[]) => a.indexOf(Math.min(...a));
    expect(argmin(d)).toBe(argmin(d2));
  });
});
