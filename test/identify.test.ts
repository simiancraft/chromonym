import { describe, expect, it } from 'bun:test';
import { identify } from '../src/identify';

describe('identify', () => {
  describe('web colorspace (default)', () => {
    it('returns exact name for pure red via hex', () => {
      expect(identify('#ff0000')).toBe('red');
    });
    it('returns exact name for pure red via rgb tuple', () => {
      expect(identify([255, 0, 0])).toBe('red');
    });
    it("returns 'crimson' for its canonical rgb", () => {
      expect(identify({ r: 220, g: 20, b: 60 })).toBe('crimson');
    });
    it("returns nearest 'crimson' for a slightly offset rgb", () => {
      expect(identify({ r: 250, g: 20, b: 60 })).toBe('crimson');
    });
    it("returns 'lime' for #00ff00", () => {
      expect(identify('#00ff00')).toBe('lime');
    });
    it("returns 'white' for #ffffff", () => {
      expect(identify('#ffffff')).toBe('white');
    });
    it("returns 'black' for #000000", () => {
      expect(identify('#000000')).toBe('black');
    });
    it("returns 'red' for one-unit-off hex (#fe0001)", () => {
      expect(identify('#fe0001')).toBe('red');
    });
    it('accepts hsl input', () => {
      expect(identify({ h: 0, s: 100, l: 50 })).toBe('red');
    });
    it('accepts hsv input', () => {
      expect(identify({ h: 0, s: 100, v: 100 })).toBe('red');
    });
    it('accepts rgba input (alpha ignored in distance)', () => {
      expect(identify({ r: 0, g: 255, b: 0, a: 0.3 })).toBe('lime');
    });
    it('is explicit when colorspace: web is passed', () => {
      expect(identify('#ff0000', { colorspace: 'web' })).toBe('red');
    });
  });

  describe('x11 colorspace', () => {
    it("returns 'red' for #ff0000 (alphabetically first among red/red1/…)", () => {
      expect(identify('#ff0000', { colorspace: 'x11' })).toBe('red');
    });
    it("returns 'gray50' for #7f7f7f (x11-only entry)", () => {
      expect(identify('#7f7f7f', { colorspace: 'x11' })).toBe('gray50');
    });
    it("returns 'lightgoldenrod' for #eedd82 (x11-only)", () => {
      expect(identify('#eedd82', { colorspace: 'x11' })).toBe('lightgoldenrod');
    });
    it("returns 'seagreen' for #2e8b57 (shared name, same rgb)", () => {
      expect(identify('#2e8b57', { colorspace: 'x11' })).toBe('seagreen');
    });
    it('accepts tuple input', () => {
      expect(identify([0, 0, 0], { colorspace: 'x11' })).toMatch(/^(black|gray0|grey0)$/);
    });
    it('returns a string for any recognized input', () => {
      const result = identify({ r: 123, g: 45, b: 67 }, { colorspace: 'x11' });
      expect(typeof result).toBe('string');
    });
  });

  describe('pantone colorspace', () => {
    it("returns '100C' exactly for its canonical rgb", () => {
      expect(identify({ r: 246, g: 235, b: 97 }, { colorspace: 'pantone' })).toBe('100C');
    });
    it("returns '185C' for #e4002b (exact)", () => {
      expect(identify('#e4002b', { colorspace: 'pantone' })).toBe('185C');
    });
    it('returns a Pantone code for pure red (nearest match)', () => {
      const result = identify('#ff0000', { colorspace: 'pantone' });
      expect(result).toMatch(/^\d+C$/);
    });
    it('accepts hsl input', () => {
      const result = identify({ h: 0, s: 100, l: 50 }, { colorspace: 'pantone' });
      expect(result).toMatch(/^\d+C$/);
    });
    it('ignores alpha in distance', () => {
      const r1 = identify({ r: 246, g: 235, b: 97, a: 1 }, { colorspace: 'pantone' });
      const r2 = identify({ r: 246, g: 235, b: 97, a: 0.1 }, { colorspace: 'pantone' });
      expect(r1).toBe(r2);
    });
  });

  describe('error / null cases', () => {
    it('returns null for garbage string input', () => {
      expect(identify('not a color' as never)).toBeNull();
    });
    it('returns null for empty string', () => {
      expect(identify('' as never)).toBeNull();
    });
    it('returns null regardless of colorspace when input is unrecognized', () => {
      expect(identify('garbage' as never, { colorspace: 'pantone' })).toBeNull();
    });
    it("returns null for '__proto__' colorspace (prototype-chain key)", () => {
      expect(identify('#ff0000', { colorspace: '__proto__' as never })).toBeNull();
    });
    it('returns null for unknown colorspace name', () => {
      expect(identify('#ff0000', { colorspace: 'cmyk' as never })).toBeNull();
    });
  });
});
