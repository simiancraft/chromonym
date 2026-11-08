import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { tcca } from '../src/palettes/tcca.js';
import { resolve } from '../src/resolve.js';
import {
  adaptIlluminantCToD65,
  linearSrgbToHex,
  linearToSrgb,
  parseTccaNbsFixture,
  xyYIlluminantCToSrgbHex,
  xyYToXyz,
  xyzToLinearSrgb,
} from './tccaNbsRp1700.js';

const fixture = readFileSync(new URL('./fixtures/tcca-nbs-rp1700.tsv', import.meta.url), 'utf8');
const rows = parseTccaNbsFixture(fixture);

describe('NBS RP1700 TCCA fixture', () => {
  it('contains all 238 card measurements and unique cable numbers', () => {
    expect(rows).toHaveLength(238);
    expect(rows.filter(({ card }) => card === 'standard')).toHaveLength(216);
    expect(rows.filter(({ card }) => card === 'army')).toHaveLength(22);
    expect(new Set(rows.map(({ cable }) => cable)).size).toBe(238);
  });

  it('contains only the requested source columns', () => {
    expect(fixture.split('\n', 1)[0]).toBe('card\tname\tcable\tY\tx\ty');
    expect(rows.every((row) => Object.keys(row).length === 6)).toBe(true);
  });

  it('rejects malformed fixture data', () => {
    expect(() => parseTccaNbsFixture('wrong\theader')).toThrow(
      'Unexpected TCCA NBS fixture header: wrong\theader',
    );
    expect(() => parseTccaNbsFixture('card\tname\tcable\tY\tx\ty\nstandard\tWhite\t70001')).toThrow(
      'Expected 6 fields on TCCA NBS fixture line 2',
    );
    expect(() =>
      parseTccaNbsFixture('card\tname\tcable\tY\tx\ty\nother\tWhite\tbad\tx\ty\tz'),
    ).toThrow('Invalid TCCA NBS fixture line 2');
  });
});

describe('NBS RP1700 Illuminant C xyY to sRGB conversion', () => {
  it('converts xyY to XYZ', () => {
    expect(xyYToXyz(0.31006, 0.31616, 1)).toEqual([0.980705971659919, 1, 1.1822494939271255]);
  });

  it('adapts the Illuminant C white point to D65', () => {
    const adapted = adaptIlluminantCToD65(xyYToXyz(0.31006, 0.31616, 1));
    expect(adapted[0]).toBeCloseTo(0.9504559, 6);
    expect(adapted[1]).toBeCloseTo(1, 6);
    expect(adapted[2]).toBeCloseTo(1.0890578, 6);
  });

  it('applies the IEC 61966-2-1 matrix and transfer function', () => {
    expect(xyzToLinearSrgb([0.9504559, 1, 1.0890578])).toEqual([
      0.9998431704600004, 1.0000991771899999, 1.00007448823,
    ]);
    expect(linearToSrgb(0.0031308)).toBeCloseTo(0.040449936, 10);
    expect(linearToSrgb(0.0031309)).toBeCloseTo(0.0404511778, 10);
  });

  it('clamps out-of-gamut channels before transfer and rounding', () => {
    expect(linearSrgbToHex([-0.25, 0.5, 1.25])).toBe('#00bcff');
  });

  it('derives every shipped palette value from its fixture row', () => {
    for (const { name, cable, Y, x, y } of rows) {
      expect(String(tcca.colors[`${name} ${cable}` as keyof typeof tcca.colors])).toBe(
        xyYIlluminantCToSrgbHex(Y, x, y),
      );
    }
  });
});

describe('TCCA palette', () => {
  it('contains the required converted spot checks', () => {
    expect(tcca.colors['Old Glory Red 70180']).toBe('#9c1c2d');
    expect(tcca.colors['Old Glory Blue 70075']).toBe('#343360');
    expect(tcca.colors['White 70001']).toBe('#e5e1d7');
    expect(tcca.colors['Scarlet 65006']).toBe('#a62c30');
    expect(tcca.colors['Ultramarine Blue 65010']).toBe('#22378c');
  });

  it('normalizes any lookup containing a cable number to that number', () => {
    expect(resolve('70180', { palette: tcca })).toBe('#9c1c2d');
    expect(resolve('cable 70180', { palette: tcca })).toBe('#9c1c2d');
    expect(resolve('Old Glory Red 70180', { palette: tcca })).toBe('#9c1c2d');
    expect(tcca.normalize('Old Glory Red')).toBe('oldgloryred');
  });
});
