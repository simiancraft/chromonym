import { describe, expect, it } from 'bun:test';
import { crayola } from '../src/palettes/crayola.js';
import { pantone } from '../src/palettes/pantone.js';
import { web } from '../src/palettes/web.js';
import { x11 } from '../src/palettes/x11.js';
import { resolve } from '../src/resolve.js';

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

  describe('k — fuzzy top-k (Levenshtein)', () => {
    it('returns an array of top-k matches sorted ascending by edit distance', () => {
      const result = resolve('rebecapurple', { palette: web, k: 3 });
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('rebeccapurple');
      expect(result[0]?.distance).toBe(1);
      expect(result[0]?.value).toBe('#663399');
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev && curr) expect(curr.distance).toBeGreaterThanOrEqual(prev.distance);
      }
    });

    it('exact match has distance 0 and appears at the top', () => {
      const result = resolve('rebeccapurple', { palette: web, k: 1 });
      expect(result[0]?.name).toBe('rebeccapurple');
      expect(result[0]?.distance).toBe(0);
    });

    it('honors the palette normalizer before computing edit distance', () => {
      // 'Rebecca Porple' normalizes to 'rebeccaporple' — 1 edit from 'rebeccapurple'.
      const result = resolve('Rebecca Porple', { palette: web, k: 1 });
      expect(result[0]?.name).toBe('rebeccapurple');
      expect(result[0]?.distance).toBe(1);
    });

    it('handles punctuation / whitespace typos via normalization + Levenshtein', () => {
      const result = resolve('pantone 185c', { palette: pantone, k: 1 });
      expect(result[0]?.name).toBe('185 C');
      expect(result[0]?.distance).toBe(0); // '185c' normalizes to exact match
    });

    it("crayola typo 'Razmataz' finds 'Razzmatazz' within a few edits", () => {
      const result = resolve('Razmataz', { palette: crayola, k: 1 });
      expect(result[0]?.name).toBe('Razzmatazz');
      expect(result[0]?.distance).toBeLessThanOrEqual(3);
    });

    it('respects the output format option on match values', () => {
      const result = resolve('rebeccapurple', { palette: web, format: 'RGB', k: 1 });
      expect(result[0]?.value).toBe('rgb(102, 51, 153)');
    });
    it('RGBA format returns the object shape', () => {
      const result = resolve('red', { palette: web, format: 'RGBA', k: 1 });
      expect(result[0]?.value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('k: 0 returns [] without scanning the palette', () => {
      expect(resolve('rebeccapurple', { palette: web, k: 0 })).toEqual([]);
    });
    it('negative k returns []', () => {
      expect(resolve('rebeccapurple', { palette: web, k: -3 })).toEqual([]);
    });
    it('k greater than palette size caps at palette size', () => {
      const total = Object.keys(web.colors).length;
      const result = resolve('rebeccapurple', { palette: web, k: total + 100 });
      expect(result.length).toBe(total);
    });

    it('defaults to web palette when palette omitted', () => {
      const result = resolve('crimzon', { k: 1 });
      expect(result[0]?.name).toBe('crimson');
    });

    it('fuzzy-resolve works on BYO palettes', () => {
      const brand = {
        name: 'acme',
        colors: { 'acme red': '#ff2a3b', 'acme ink': '#0a0f2c' },
        normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
        defaultMetric: 'deltaEok',
      } as const;
      // 'akme red' normalizes to 'akmered' — 1 edit from 'acmered'.
      const result = resolve('akme red', { palette: brand, k: 1 });
      expect(result[0]?.name).toBe('acme red');
      expect(result[0]?.distance).toBe(1);
    });

    it('empty string input returns the full ranked list (all keys 1+ edits away)', () => {
      const result = resolve('', { palette: web, k: 3 });
      expect(result).toHaveLength(3);
      for (const entry of result) {
        expect(entry.distance).toBeGreaterThan(0);
      }
    });
  });
});
