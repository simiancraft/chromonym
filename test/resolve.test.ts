import { describe, expect, it } from 'bun:test';
import { pantone } from '../src/palettes/pantone';
import { web } from '../src/palettes/web';
import { x11 } from '../src/palettes/x11';
import { resolve } from '../src/resolve';

describe('resolve', () => {
  describe('README examples', () => {
    it("resolve('crimson') → '#dc143c'", () => {
      expect(resolve('crimson')).toBe('#dc143c');
    });
    it("resolve('Alice Blue') → '#f0f8ff'", () => {
      expect(resolve('Alice Blue')).toBe('#f0f8ff');
    });
    it("resolve('alice-blue!') → '#f0f8ff'", () => {
      expect(resolve('alice-blue!')).toBe('#f0f8ff');
    });
    it("resolve('185 C', { palette: pantone }) → '#e4002b'", () => {
      expect(resolve('185 C', { palette: pantone })).toBe('#e4002b');
    });
    it("resolve('Pantone 185 C', { palette: pantone }) → '#e4002b'", () => {
      expect(resolve('Pantone 185 C', { palette: pantone })).toBe('#e4002b');
    });
    it("resolve('crimson', { format: 'RGB' }) → 'rgb(220, 20, 60)'", () => {
      expect(resolve('crimson', { format: 'RGB' })).toBe('rgb(220, 20, 60)');
    });
    it("resolve('crimson', { format: 'RGBA' }) → { r: 220, g: 20, b: 60, a: 1 }", () => {
      expect(resolve('crimson', { format: 'RGBA' })).toEqual({ r: 220, g: 20, b: 60, a: 1 });
    });
    it("resolve('not-a-color') → null", () => {
      expect(resolve('not-a-color')).toBeNull();
    });
  });

  describe('output format', () => {
    it("resolve('red', { format: 'HSL' }) → 'hsl(0, 100%, 50%)'", () => {
      expect(resolve('red', { format: 'HSL' })).toBe('hsl(0, 100%, 50%)');
    });
    it("resolve('red', { format: 'HSV' }) → 'hsv(0, 100%, 100%)'", () => {
      expect(resolve('red', { format: 'HSV' })).toBe('hsv(0, 100%, 100%)');
    });
    it("'PANTONE' output is off the core path — throws, route through rgbaToPantone instead", () => {
      // `resolve` → `fromRgba` no longer handles PANTONE. Users wanting a
      // Pantone code for a named color chain: `rgbaToPantone(hexToRgba(resolve('red') as HexColor))`.
      expect(() => resolve('red', { format: 'PANTONE' as never })).toThrow();
    });
    it("resolve('185 C', { palette: pantone, format: 'RGBA' }) returns the rgba object", () => {
      expect(resolve('185 C', { palette: pantone, format: 'RGBA' })).toEqual({
        r: 228,
        g: 0,
        b: 43,
        a: 1,
      });
    });
  });

  describe('normalization', () => {
    it('is case-insensitive', () => {
      expect(resolve('ALICEBLUE')).toBe('#f0f8ff');
      expect(resolve('AliceBlue')).toBe('#f0f8ff');
    });
    it('strips spaces', () => {
      expect(resolve('  alice   blue  ')).toBe('#f0f8ff');
    });
    it('strips punctuation', () => {
      expect(resolve('alice_blue')).toBe('#f0f8ff');
      expect(resolve('alice.blue')).toBe('#f0f8ff');
    });
    it('returns null for empty string', () => {
      expect(resolve('')).toBeNull();
    });
  });

  describe('x11 palette', () => {
    it('resolves x11-only name', () => {
      expect(resolve('antiquewhite1', { palette: x11 })).toBe('#ffefdb');
    });
    it('normalizes x11 spaced input', () => {
      expect(resolve('Antique White 1', { palette: x11 })).toBe('#ffefdb');
    });
    it('returns null for x11-only name under web palette', () => {
      expect(resolve('antiquewhite1', { palette: web })).toBeNull();
    });
  });

  describe('pantone palette', () => {
    it('resolves bare numeric code', () => {
      expect(resolve('100C', { palette: pantone })).toBe('#f6eb61');
    });
    it('resolves case-insensitively', () => {
      expect(resolve('100c', { palette: pantone })).toBe('#f6eb61');
    });
    it('resolves with PMS prefix', () => {
      expect(resolve('PMS 100C', { palette: pantone })).toBe('#f6eb61');
    });
    it('returns null for unknown pantone code', () => {
      expect(resolve('999999C', { palette: pantone })).toBeNull();
    });
  });

  describe('BYO palette', () => {
    const homebrew = {
      name: 'warhammer',
      colors: {
        'world eaters red': '#8b1a1a',
        'adeptus red': '#652022',
        'sons of malice white': '#e8e4d8',
        'the flawless host purple': '#6b2d7d',
        'nurgle green': '#748c3f',
        'alpha legion teal': '#2a6d7a',
      },
      normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
      defaultMetric: 'deltaE2000',
    } as const;

    it('resolves a BYO key to its hex', () => {
      expect(resolve('nurgle green', { palette: homebrew })).toBe('#748c3f');
    });
    it('applies the BYO normalizer (case + punctuation insensitive)', () => {
      expect(resolve('Nurgle-Green!', { palette: homebrew })).toBe('#748c3f');
    });
    it('returns null for an unknown key', () => {
      expect(resolve('Death Guard', { palette: homebrew })).toBeNull();
    });
  });
});
