import { describe, expect, it } from 'bun:test';
import { hsvToRgba, rgbaToHsv } from '../../src/conversions/hsv';

describe('hsvToRgba', () => {
  it('converts pure red { h:0, s:100, v:100 }', () => {
    expect(hsvToRgba({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('converts pure green via string "hsv(120, 100%, 100%)"', () => {
    expect(hsvToRgba('hsv(120, 100%, 100%)')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });
  it('converts half-brightness green { h:120, s:100, v:50 } → rgb(0, 128, 0)', () => {
    expect(hsvToRgba({ h: 120, s: 100, v: 50 })).toEqual({ r: 0, g: 128, b: 0, a: 1 });
  });
  it('converts black { h:0, s:0, v:0 }', () => {
    expect(hsvToRgba({ h: 0, s: 0, v: 0 })).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
  it('converts white { h:0, s:0, v:100 }', () => {
    expect(hsvToRgba({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });
  it('wraps hue modulo 360', () => {
    expect(hsvToRgba({ h: 360, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('handles yellow { h:60, s:100, v:100 } (hue in [1, 2) sector)', () => {
    expect(hsvToRgba({ h: 60, s: 100, v: 100 })).toEqual({ r: 255, g: 255, b: 0, a: 1 });
  });
  it('handles cyan { h:180, s:100, v:100 } (hue in [3, 4) sector)', () => {
    expect(hsvToRgba({ h: 180, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 255, a: 1 });
  });
  it('handles pure blue { h:240, s:100, v:100 } (hue in [4, 5) sector)', () => {
    expect(hsvToRgba({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });
  it('throws on malformed string', () => {
    // @ts-expect-error runtime guard for invalid input
    expect(() => hsvToRgba('not hsv')).toThrow();
  });
});

describe('rgbaToHsv', () => {
  it('emits "hsv(0, 100%, 100%)" for pure red', () => {
    expect(rgbaToHsv({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsv(0, 100%, 100%)');
  });
  it('emits "hsv(120, 100%, 50%)" for half-brightness green (README)', () => {
    expect(rgbaToHsv({ r: 0, g: 128, b: 0, a: 1 })).toBe('hsv(120, 100%, 50%)');
  });
  it('emits "hsv(0, 0%, 0%)" for black', () => {
    expect(rgbaToHsv({ r: 0, g: 0, b: 0, a: 1 })).toBe('hsv(0, 0%, 0%)');
  });
  it('emits "hsv(0, 0%, 100%)" for white', () => {
    expect(rgbaToHsv({ r: 255, g: 255, b: 255, a: 1 })).toBe('hsv(0, 0%, 100%)');
  });
  it('emits "hsv(240, 100%, 100%)" for pure blue (max === b branch)', () => {
    expect(rgbaToHsv({ r: 0, g: 0, b: 255, a: 1 })).toBe('hsv(240, 100%, 100%)');
  });
});

describe('hsvToRgba input validation', () => {
  it('throws on NaN h', () => {
    expect(() => hsvToRgba({ h: Number.NaN, s: 50, v: 50 })).toThrow();
  });
  it('throws on non-numeric v', () => {
    // @ts-expect-error runtime guard for non-number
    expect(() => hsvToRgba({ h: 0, s: 50, v: 'abc' })).toThrow();
  });
});

describe('round-trip hsv ↔ rgba', () => {
  it('preserves pure red', () => {
    const rgba = { r: 255, g: 0, b: 0, a: 1 };
    expect(hsvToRgba(rgbaToHsv(rgba))).toEqual(rgba);
  });
  it('preserves pure magenta', () => {
    const rgba = { r: 255, g: 0, b: 255, a: 1 };
    expect(hsvToRgba(rgbaToHsv(rgba))).toEqual(rgba);
  });
});
