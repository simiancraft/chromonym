import { describe, expect, it } from 'bun:test';
import { hexToRgba, rgbaToHex } from '../../src/conversions/hex.js';

describe('hexToRgba', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgba('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('parses 3-digit shorthand hex', () => {
    expect(hexToRgba('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('parses 8-digit hex with alpha', () => {
    const result = hexToRgba('#ff0000cc');
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
    expect(result.a).toBeCloseTo(0.8, 2);
  });
  it('is case-insensitive', () => {
    expect(hexToRgba('#FF00AA')).toEqual({ r: 255, g: 0, b: 170, a: 1 });
  });
  it('throws on invalid hex (non-hex chars)', () => {
    expect(() => hexToRgba('#gg0000')).toThrow();
  });
  it('throws on invalid hex (wrong length)', () => {
    expect(() => hexToRgba('#12')).toThrow();
  });
  it('throws on missing hash prefix', () => {
    // @ts-expect-error runtime guard for invalid input
    expect(() => hexToRgba('ff0000')).toThrow();
  });
});

describe('rgbaToHex', () => {
  it('emits 6-digit lowercase hex', () => {
    expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
  });
  it('zero-pads single-digit channels', () => {
    expect(rgbaToHex({ r: 0, g: 5, b: 10, a: 1 })).toBe('#00050a');
  });
  it('drops alpha (emits 6-digit, not 8-digit)', () => {
    expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff0000');
  });
  it('rounds fractional channel values', () => {
    expect(rgbaToHex({ r: 255.4, g: 0.6, b: 100.5, a: 1 })).toBe('#ff0165');
  });
  it('clamps out-of-range values', () => {
    expect(rgbaToHex({ r: 300, g: -50, b: 255, a: 1 })).toBe('#ff00ff');
  });
});

describe('round-trip hex ↔ rgba', () => {
  it('preserves value through hex → rgba → hex', () => {
    const original = '#dc143c' as const;
    expect(rgbaToHex(hexToRgba(original))).toBe(original);
  });
  it('preserves through rgba → hex → rgba (alpha dropped)', () => {
    const rgba = { r: 100, g: 150, b: 200, a: 1 };
    expect(hexToRgba(rgbaToHex(rgba))).toEqual(rgba);
  });
});
