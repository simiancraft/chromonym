import { describe, expect, it } from 'bun:test';
import {
  linearRgbToOklab,
  linearRgbToXyz,
  linearToSrgb,
  rgbaToLab,
  rgbaToLinearRgb,
  rgbaToOklab,
  srgbToLinear,
  xyzToLab,
} from '../../src/math/colorSpace';

describe('srgbToLinear / linearToSrgb', () => {
  it('maps 0 → 0', () => {
    expect(srgbToLinear(0)).toBeCloseTo(0, 10);
  });
  it('maps 255 → 1', () => {
    expect(srgbToLinear(255)).toBeCloseTo(1, 10);
  });
  it('maps 128 → ~0.2159 (known gamma curve value)', () => {
    // sRGB mid-gray is darker than 0.5 in linear space because of gamma encoding.
    expect(srgbToLinear(128)).toBeCloseTo(0.2159, 3);
  });
  it('uses linear segment near black (below 0.04045 threshold)', () => {
    // s = 10 / 255 ≈ 0.0392 → linear segment: s / 12.92.
    expect(srgbToLinear(10)).toBeCloseTo(10 / 255 / 12.92, 6);
  });
  it('round-trips sRGB → linear → sRGB within sub-channel tolerance', () => {
    for (const v of [0, 10, 64, 128, 200, 255]) {
      const roundtrip = linearToSrgb(srgbToLinear(v)) * 255;
      expect(roundtrip).toBeCloseTo(v, 3);
    }
  });
});

describe('rgbaToLinearRgb', () => {
  it('drops alpha', () => {
    const result = rgbaToLinearRgb({ r: 255, g: 0, b: 0, a: 0.5 });
    expect(result.length).toBe(3);
    expect(result[0]).toBeCloseTo(1, 10);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);
  });
});

describe('linearRgbToXyz', () => {
  it('white (1,1,1) → Y ≈ 1 (maps to D65 luminance)', () => {
    const [x, y, z] = linearRgbToXyz(1, 1, 1);
    expect(y).toBeCloseTo(1, 3);
    expect(x).toBeCloseTo(0.9505, 3);
    expect(z).toBeCloseTo(1.0891, 3);
  });
  it('black → (0, 0, 0)', () => {
    expect(linearRgbToXyz(0, 0, 0)).toEqual([0, 0, 0]);
  });
});

describe('xyzToLab', () => {
  it('D65 white → L=100, a=0, b=0', () => {
    const [l, a, b] = xyzToLab(0.95047, 1.0, 1.08883);
    expect(l).toBeCloseTo(100, 3);
    expect(a).toBeCloseTo(0, 3);
    expect(b).toBeCloseTo(0, 3);
  });
  it('black (0,0,0) → L=0', () => {
    const [l] = xyzToLab(0, 0, 0);
    expect(l).toBeCloseTo(0, 3);
  });
});

describe('rgbaToLab (end-to-end pipeline)', () => {
  // Reference Lab values for sRGB primaries, computed via Bruce Lindbloom's
  // online converter (http://brucelindbloom.com/) with D65 illuminant.
  it('pure white → L≈100, a≈0, b≈0', () => {
    const [l, a, b] = rgbaToLab({ r: 255, g: 255, b: 255, a: 1 });
    expect(l).toBeCloseTo(100, 2);
    expect(a).toBeCloseTo(0, 2);
    expect(b).toBeCloseTo(0, 2);
  });
  it('pure black → L≈0', () => {
    const [l] = rgbaToLab({ r: 0, g: 0, b: 0, a: 1 });
    expect(l).toBeCloseTo(0, 2);
  });
  it('pure red → L≈53.24, a≈80.09, b≈67.20', () => {
    const [l, a, b] = rgbaToLab({ r: 255, g: 0, b: 0, a: 1 });
    expect(l).toBeCloseTo(53.24, 1);
    expect(a).toBeCloseTo(80.09, 1);
    expect(b).toBeCloseTo(67.2, 1);
  });
  it('pure green (sRGB #00ff00) → L≈87.73, a≈-86.18, b≈83.18', () => {
    const [l, a, b] = rgbaToLab({ r: 0, g: 255, b: 0, a: 1 });
    expect(l).toBeCloseTo(87.73, 1);
    expect(a).toBeCloseTo(-86.18, 1);
    expect(b).toBeCloseTo(83.18, 1);
  });
  it('pure blue → L≈32.3, a≈79.19, b≈-107.86', () => {
    const [l, a, b] = rgbaToLab({ r: 0, g: 0, b: 255, a: 1 });
    expect(l).toBeCloseTo(32.3, 1);
    expect(a).toBeCloseTo(79.19, 1);
    expect(b).toBeCloseTo(-107.86, 1);
  });
  it('mid-gray sRGB #808080 → L≈53.58 (gamma correction matters here)', () => {
    const [l, a, b] = rgbaToLab({ r: 128, g: 128, b: 128, a: 1 });
    expect(l).toBeCloseTo(53.58, 1);
    expect(a).toBeCloseTo(0, 1);
    expect(b).toBeCloseTo(0, 1);
  });
});

describe('rgbaToOklab (Björn Ottosson, 2020)', () => {
  // Reference values from Ottosson's blog post. OKLAB L is in [0, 1].
  it('white → L≈1, a≈0, b≈0', () => {
    const [L, a, b] = rgbaToOklab({ r: 255, g: 255, b: 255, a: 1 });
    expect(L).toBeCloseTo(1.0, 2);
    expect(a).toBeCloseTo(0, 3);
    expect(b).toBeCloseTo(0, 3);
  });
  it('black → (0, 0, 0)', () => {
    const [L, a, b] = rgbaToOklab({ r: 0, g: 0, b: 0, a: 1 });
    expect(L).toBe(0);
    expect(a).toBe(0);
    expect(b).toBe(0);
  });
  it('pure red → L≈0.628, a≈0.225, b≈0.126 (Ottosson reference)', () => {
    const [L, a, b] = rgbaToOklab({ r: 255, g: 0, b: 0, a: 1 });
    expect(L).toBeCloseTo(0.628, 2);
    expect(a).toBeCloseTo(0.225, 2);
    expect(b).toBeCloseTo(0.126, 2);
  });
  it('pure green → L≈0.866, a≈-0.234, b≈0.179', () => {
    const [L, a, b] = rgbaToOklab({ r: 0, g: 255, b: 0, a: 1 });
    expect(L).toBeCloseTo(0.866, 2);
    expect(a).toBeCloseTo(-0.234, 2);
    expect(b).toBeCloseTo(0.179, 2);
  });
  it('pure blue → L≈0.452, a≈-0.032, b≈-0.312', () => {
    const [L, a, b] = rgbaToOklab({ r: 0, g: 0, b: 255, a: 1 });
    expect(L).toBeCloseTo(0.452, 2);
    expect(a).toBeCloseTo(-0.032, 2);
    expect(b).toBeCloseTo(-0.312, 2);
  });
  it('linearRgbToOklab takes already-linearized channels', () => {
    // White: linear RGB (1, 1, 1) → OKLAB (~1, 0, 0)
    const [L, a, b] = linearRgbToOklab(1, 1, 1);
    expect(L).toBeCloseTo(1.0, 2);
    expect(a).toBeCloseTo(0, 3);
    expect(b).toBeCloseTo(0, 3);
  });
});
