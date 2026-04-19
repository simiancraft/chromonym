import { describe, expect, it } from 'bun:test';
import { rgbaToRgb, rgbToRgba } from '../../src/conversions/rgb.js';

describe('rgbToRgba', () => {
  describe('object form', () => {
    it('adds a=1 to plain RgbObject', () => {
      expect(rgbToRgba({ r: 255, g: 0, b: 0 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });
    it('preserves alpha on Rgba object', () => {
      expect(rgbToRgba({ r: 255, g: 0, b: 0, a: 0.5 })).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      });
    });
  });

  describe('tuple form', () => {
    it('parses 3-tuple as rgb', () => {
      expect(rgbToRgba([0, 128, 255] as const)).toEqual({ r: 0, g: 128, b: 255, a: 1 });
    });
    it('parses 4-tuple as rgba', () => {
      expect(rgbToRgba([255, 0, 0, 0.25] as const)).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.25,
      });
    });
  });

  describe('string form', () => {
    it('parses "rgb(r, g, b)" with spaces', () => {
      expect(rgbToRgba('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });
    it('parses "rgb(r,g,b)" without spaces', () => {
      expect(rgbToRgba('rgb(10,20,30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    });
    it('parses "rgba(r, g, b, a)"', () => {
      expect(rgbToRgba('rgba(255, 0, 0, 0.75)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.75,
      });
    });
    it('throws on malformed string', () => {
      // @ts-expect-error runtime guard for invalid input
      expect(() => rgbToRgba('rgb(abc)')).toThrow();
    });
    it('throws on wrong function name', () => {
      // @ts-expect-error runtime guard for invalid input
      expect(() => rgbToRgba('hsl(0, 100%, 50%)')).toThrow();
    });
  });
});

describe('rgbaToRgb', () => {
  it('emits "rgb(r, g, b)" string', () => {
    expect(rgbaToRgb({ r: 255, g: 0, b: 0, a: 1 })).toBe('rgb(255, 0, 0)');
  });
  it('drops alpha', () => {
    expect(rgbaToRgb({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('rgb(255, 0, 0)');
  });
  it('rounds fractional values', () => {
    expect(rgbaToRgb({ r: 255.4, g: 0.6, b: 100.5, a: 1 })).toBe('rgb(255, 1, 101)');
  });
  it('clamps out-of-range values', () => {
    expect(rgbaToRgb({ r: 300, g: -50, b: 128, a: 1 })).toBe('rgb(255, 0, 128)');
  });
});

describe('rgbToRgba input validation', () => {
  it('throws on NaN channel', () => {
    expect(() => rgbToRgba({ r: Number.NaN, g: 0, b: 0 })).toThrow();
  });
  it('throws on Infinity channel', () => {
    expect(() => rgbToRgba({ r: Number.POSITIVE_INFINITY, g: 0, b: 0 })).toThrow();
  });
  it('throws on non-numeric channel (tuple)', () => {
    // @ts-expect-error runtime guard for non-number
    expect(() => rgbToRgba([{}, 0, 0])).toThrow();
  });
  it('clamps out-of-range high channel to 255', () => {
    expect(rgbToRgba({ r: 300, g: 0, b: 0 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('clamps out-of-range low channel to 0', () => {
    expect(rgbToRgba({ r: -50, g: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
  it('clamps alpha to [0, 1]', () => {
    expect(rgbToRgba({ r: 0, g: 0, b: 0, a: 5 })).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(rgbToRgba({ r: 0, g: 0, b: 0, a: -0.5 })).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });
});

describe('round-trip rgb ↔ rgba', () => {
  it('preserves rgba object through rgb string', () => {
    const original = { r: 100, g: 150, b: 200, a: 1 };
    expect(rgbToRgba(rgbaToRgb(original))).toEqual(original);
  });
});
