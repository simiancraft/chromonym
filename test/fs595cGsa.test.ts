import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  lab10ToSrgbHex,
  lab10ToXyz,
  linearSrgbToHex,
  linearToSrgb,
  parseFs595cGsaFixture,
  xyzToLinearSrgb,
} from './fs595cGsa.js';

const fixture = readFileSync(new URL('./fixtures/fs595c-gsa.tsv', import.meta.url), 'utf8');
const rows = parseFs595cGsaFixture(fixture);

describe('GSA FS595C fixture', () => {
  it('contains exactly one complete row for each of 650 chips', () => {
    expect(rows).toHaveLength(650);
    expect(new Set(rows.map(({ chip }) => chip)).size).toBe(650);
    expect(rows.every(({ chip }) => /^\d{5}$/.test(chip))).toBe(true);
  });

  it('contains only the requested source columns', () => {
    expect(fixture.split('\n', 1)[0]).toBe('chip\tcolor_group\tgloss_level\td65_l\td65_a\td65_b');
    expect(rows.every((row) => Object.keys(row).length === 6)).toBe(true);
  });
});

describe('GSA FS595C CIELAB to sRGB conversion', () => {
  it('converts 10 degree D65 white and black through the Lab inverse', () => {
    const white = lab10ToXyz(100, 0, 0);
    expect(white[0]).toBeCloseTo(0.94811, 10);
    expect(white[1]).toBeCloseTo(1, 10);
    expect(white[2]).toBeCloseTo(1.07304, 10);
    expect(lab10ToXyz(0, 0, 0)).toEqual([0, 0, 0]);
  });

  it('applies the IEC 61966-2-1 XYZ to linear-sRGB matrix', () => {
    const [r, g, b] = xyzToLinearSrgb([0.6282492747, 0.6577203103, 0.5592516083]);
    expect(r).toBeCloseTo(0.7460140867, 9);
    expect(g).toBeCloseTo(0.6482499776, 9);
    expect(b).toBeCloseTo(0.4919474913, 9);
  });

  it('uses both branches of the sRGB transfer function at its boundary', () => {
    expect(linearToSrgb(0.0031308)).toBeCloseTo(0.040449936, 10);
    expect(linearToSrgb(0.0031309)).toBeCloseTo(0.0404511778, 10);
  });

  it('clamps out-of-gamut channels before transfer and rounding', () => {
    expect(linearSrgbToHex([-0.25, 0.5, 1.25])).toBe('#00bcff');
  });

  it('matches independently calculated GSA row vectors', () => {
    expect(lab10ToSrgbHex(84.88, 1.08, 12.98)).toBe('#e0d3ba');
    expect(lab10ToSrgbHex(31.76, -2.94, 1.03)).toBe('#474c48');
    expect(lab10ToSrgbHex(71.95, 85.14, 81.02)).toBe('#ff520b');
  });
});
