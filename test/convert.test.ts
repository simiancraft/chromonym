import { describe, expect, it } from 'bun:test';
import { convert } from '../src/convert.js';
import { pantone } from '../src/palettes/pantone.js';
import { web } from '../src/palettes/web.js';

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

  describe('HSV output and input', () => {
    it('converts hex → hsv', () => {
      expect(convert('#ff0000', { format: 'HSV' })).toBe('hsv(0, 100%, 100%)');
    });
    it('converts rgb → hsv', () => {
      expect(convert({ r: 0, g: 128, b: 0 }, { format: 'HSV' })).toBe('hsv(120, 100%, 50%)');
    });
    it('accepts hsv object as input', () => {
      expect(convert({ h: 0, s: 100, v: 100 }, { format: 'HEX' })).toBe('#ff0000');
    });
    it('accepts hsv string as input', () => {
      expect(convert('hsv(120, 100%, 100%)', { format: 'RGB' })).toBe('rgb(0, 255, 0)');
    });
  });

  describe('structural-only (no palette) rejects palette-name inputs', () => {
    it('rejects a pantone-code string as input when no palette is supplied', () => {
      expect(() => convert('185 C' as never, { format: 'HEX' })).toThrow();
    });
    it("the 'PANTONE' format key is no longer accepted — supply a palette instead", () => {
      expect(() => convert({ r: 228, g: 0, b: 43 }, { format: 'PANTONE' as never })).toThrow();
    });
  });

  describe('unified palette option — palette name → color', () => {
    it('accepts a pantone name as input when a palette is supplied', () => {
      expect(convert('185 C', { palette: pantone })).toBe('#e4002b');
    });
    it('honors the palette normalizer (case / punctuation / prefix)', () => {
      expect(convert('Pantone 185 C', { palette: pantone })).toBe('#e4002b');
      expect(convert('pms185c', { palette: pantone })).toBe('#e4002b');
    });
    it('emits a non-HEX format from a palette-name input', () => {
      expect(convert('185 C', { palette: pantone, format: 'RGB' })).toBe('rgb(228, 0, 43)');
      expect(convert('185 C', { palette: pantone, format: 'RGBA' })).toEqual({
        r: 228,
        g: 0,
        b: 43,
        a: 1,
      });
    });
    it('accepts a web name with the web palette', () => {
      expect(convert('rebeccapurple', { palette: web })).toBe('#663399');
      expect(convert('Rebecca Purple', { palette: web })).toBe('#663399'); // normalizer strips spaces
      expect(convert('aliceblue', { palette: web, format: 'HSL' })).toMatch(/^hsl\(/);
    });
    it('works for BYO palettes inline', () => {
      const brand = {
        name: 'acme',
        colors: { 'acme red': '#ff2a3b', 'acme ink': '#0a0f2c' },
        normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
        defaultMetric: 'deltaEok',
      } as const;
      expect(convert('acme red', { palette: brand })).toBe('#ff2a3b');
      expect(convert('Acme Ink', { palette: brand, format: 'RGB' })).toBe('rgb(10, 15, 44)');
    });
    it('throws if the name is not in the palette', () => {
      expect(() => convert('not a pantone', { palette: pantone })).toThrow();
    });
    it('structural format wins over palette lookup (priority rule)', () => {
      // Even if a BYO palette had a weird key that could collide, a
      // structurally-valid input takes precedence. #ff0000 is always parsed as hex.
      expect(convert('#ff0000', { palette: web })).toBe('#ff0000');
    });
  });

  describe("unified palette option — format: 'NAME' emits the exact canonical key", () => {
    it("convert('#e4002b', { palette: pantone, format: 'NAME' }) → '185 C'", () => {
      expect(convert('#e4002b', { palette: pantone, format: 'NAME' })).toBe('185 C');
    });
    it('round-trips name → rgba → name through a palette', () => {
      const rgba = convert('100 C', { palette: pantone, format: 'RGBA' });
      expect(convert(rgba, { palette: pantone, format: 'NAME' })).toBe('100 C');
    });
    it('web name round-trip', () => {
      expect(convert('#663399', { palette: web, format: 'NAME' })).toBe('rebeccapurple');
    });
    it('throws when the input has no exact palette match (use identify for fuzzy)', () => {
      expect(() => convert('#ff0000', { palette: pantone, format: 'NAME' })).toThrow(
        /No exact match/,
      );
    });
    it("format: 'NAME' without a palette throws at runtime (type error at compile time)", () => {
      expect(() => convert({ r: 255, g: 0, b: 0, a: 1 }, { format: 'NAME' as never })).toThrow(
        /requires a 'palette' option/,
      );
    });
    it("format: 'NAME' rejects partially-transparent input (strict-convert contract)", () => {
      expect(() =>
        convert({ r: 255, g: 0, b: 0, a: 0.5 }, { palette: web, format: 'NAME' }),
      ).toThrow(/fully-opaque input/);
    });
    it("format: 'NAME' accepts alpha === 1 normally", () => {
      expect(convert({ r: 255, g: 0, b: 0, a: 1 }, { palette: web, format: 'NAME' })).toBe('red');
    });
  });

  describe('error handling', () => {
    it('throws on unrecognized input', () => {
      expect(() => convert('not a color' as never)).toThrow();
    });
    it('throws on empty string', () => {
      expect(() => convert('' as never)).toThrow();
    });
    it('error message JSON-stringifies objects (not [object Object])', () => {
      expect(() => convert({} as never)).toThrow(/\{\}/);
    });
    it('error message handles undefined', () => {
      expect(() => convert(undefined as never)).toThrow(/undefined/);
    });
    it('error message handles circular references safely', () => {
      const circ: Record<string, unknown> = {};
      circ.self = circ;
      expect(() => convert(circ as never)).toThrow();
    });
  });
});
