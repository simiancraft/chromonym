import { describe, expect, it } from 'bun:test';
import { hslToRgba, rgbaToHsl } from '../../src/conversions/hsl';

describe('hslToRgba', () => {
  it('converts pure red { h:0, s:100, l:50 }', () => {
    expect(hslToRgba({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('converts pure green via string "hsl(120, 100%, 50%)"', () => {
    expect(hslToRgba('hsl(120, 100%, 50%)')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });
  it('converts pure blue { h:240, s:100, l:50 }', () => {
    expect(hslToRgba({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });
  it('converts achromatic gray { h:0, s:0, l:50 }', () => {
    expect(hslToRgba({ h: 0, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128, a: 1 });
  });
  it('converts white { h:0, s:0, l:100 }', () => {
    expect(hslToRgba({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });
  it('wraps hue modulo 360 (h=360 == h=0)', () => {
    expect(hslToRgba({ h: 360, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('handles magenta { h:300, s:100, l:50 }', () => {
    expect(hslToRgba({ h: 300, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 255, a: 1 });
  });
  it('handles yellow { h:60, s:100, l:50 } (hue in [1, 2) sector)', () => {
    expect(hslToRgba({ h: 60, s: 100, l: 50 })).toEqual({ r: 255, g: 255, b: 0, a: 1 });
  });
  it('handles cyan { h:180, s:100, l:50 } (hue in [3, 4) sector)', () => {
    expect(hslToRgba({ h: 180, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 255, a: 1 });
  });
  it('throws on malformed string', () => {
    // @ts-expect-error runtime guard for invalid input
    expect(() => hslToRgba('not hsl')).toThrow();
  });
});

describe('rgbaToHsl', () => {
  it('emits "hsl(0, 100%, 50%)" for pure red', () => {
    expect(rgbaToHsl({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsl(0, 100%, 50%)');
  });
  it('emits "hsl(120, 100%, 50%)" for pure green', () => {
    expect(rgbaToHsl({ r: 0, g: 255, b: 0, a: 1 })).toBe('hsl(120, 100%, 50%)');
  });
  it('emits "hsl(0, 0%, 50%)" for mid-gray (achromatic)', () => {
    expect(rgbaToHsl({ r: 128, g: 128, b: 128, a: 1 })).toBe('hsl(0, 0%, 50%)');
  });
  it('emits "hsl(0, 0%, 0%)" for black', () => {
    expect(rgbaToHsl({ r: 0, g: 0, b: 0, a: 1 })).toBe('hsl(0, 0%, 0%)');
  });
});

describe('round-trip hsl ↔ rgba (primary colors)', () => {
  it('preserves pure red through rgba → hsl → rgba', () => {
    const rgba = { r: 255, g: 0, b: 0, a: 1 };
    expect(hslToRgba(rgbaToHsl(rgba))).toEqual(rgba);
  });
  it('preserves pure blue through rgba → hsl → rgba', () => {
    const rgba = { r: 0, g: 0, b: 255, a: 1 };
    expect(hslToRgba(rgbaToHsl(rgba))).toEqual(rgba);
  });
});
