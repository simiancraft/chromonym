import { describe, expect, it } from 'bun:test';
import { convert } from '../src/convert';

describe('convert', () => {
  describe('README examples', () => {
    it("convert('#ff0000') → '#ff0000' (identity, default HEX)", () => {
      expect(convert('#ff0000')).toBe('#ff0000');
    });
    it("convert('#ff0000', { format: 'RGB' }) → 'rgb(255, 0, 0)'", () => {
      expect(convert('#ff0000', { format: 'RGB' })).toBe('rgb(255, 0, 0)');
    });
    it("convert('#ff0000', { format: 'RGBA' }) → { r: 255, g: 0, b: 0, a: 1 }", () => {
      expect(convert('#ff0000', { format: 'RGBA' })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });
    it("convert([255, 0, 0], { format: 'HEX' }) → '#ff0000'", () => {
      expect(convert([255, 0, 0], { format: 'HEX' })).toBe('#ff0000');
    });
    it("convert('rgb(255, 0, 0)', { format: 'HSL' }) → 'hsl(0, 100%, 50%)'", () => {
      expect(convert('rgb(255, 0, 0)', { format: 'HSL' })).toBe('hsl(0, 100%, 50%)');
    });
    it("convert({ h: 0, s: 100, l: 50 }, { format: 'HEX' }) → '#ff0000'", () => {
      expect(convert({ h: 0, s: 100, l: 50 }, { format: 'HEX' })).toBe('#ff0000');
    });
  });

  describe('round-trips through RGBA', () => {
    it('hex → rgba → hex', () => {
      const rgba = convert('#dc143c', { format: 'RGBA' });
      expect(convert(rgba, { format: 'HEX' })).toBe('#dc143c');
    });
    it('rgb string → object → string', () => {
      const obj = convert('rgb(100, 200, 50)', { format: 'RGBA' });
      expect(convert(obj, { format: 'RGB' })).toBe('rgb(100, 200, 50)');
    });
  });

  describe('alpha handling', () => {
    it('preserves alpha in RGBA output', () => {
      expect(convert({ r: 255, g: 0, b: 0, a: 0.5 }, { format: 'RGBA' })).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      });
    });
    it('drops alpha for HEX output (6-digit)', () => {
      expect(convert({ r: 255, g: 0, b: 0, a: 0.5 }, { format: 'HEX' })).toBe('#ff0000');
    });
    it('drops alpha for RGB string output', () => {
      expect(convert({ r: 255, g: 0, b: 0, a: 0.5 }, { format: 'RGB' })).toBe('rgb(255, 0, 0)');
    });
  });

  describe('HSV output', () => {
    it('converts hex → hsv', () => {
      expect(convert('#ff0000', { format: 'HSV' })).toBe('hsv(0, 100%, 100%)');
    });
    it('converts rgb → hsv', () => {
      expect(convert({ r: 0, g: 128, b: 0 }, { format: 'HSV' })).toBe('hsv(120, 100%, 50%)');
    });
  });

  describe('error handling', () => {
    it('throws on unrecognized input', () => {
      expect(() => convert('not a color' as never)).toThrow();
    });
    it('throws on empty string', () => {
      expect(() => convert('' as never)).toThrow();
    });
  });
});
