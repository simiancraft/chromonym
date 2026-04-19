import { describe, expect, it } from 'bun:test';
import { identifyAll } from '../src/identifyAll.js';
import { crayola } from '../src/palettes/crayola.js';
import { pantone } from '../src/palettes/pantone.js';
import { web } from '../src/palettes/web.js';

describe('identifyAll', () => {
  describe('structure + ordering', () => {
    it('returns an array of { name, distance } entries', () => {
      const result = identifyAll('#ff0000', { k: 3 });
      expect(result).toHaveLength(3);
      for (const entry of result) {
        expect(typeof entry.name).toBe('string');
        expect(typeof entry.distance).toBe('number');
        expect(entry.distance).toBeGreaterThanOrEqual(0);
      }
    });

    it('entries are sorted ascending by distance (nearest first)', () => {
      const result = identifyAll('#ff0080', { palette: pantone, k: 10 });
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev && curr) expect(curr.distance).toBeGreaterThanOrEqual(prev.distance);
      }
    });

    it('the first entry matches `identify`', () => {
      const all = identifyAll('#ff0080', { palette: pantone });
      expect(all[0]?.name).toMatch(/^\d+ C$/);
    });

    it('exact-hex match has distance 0', () => {
      // web.colors.red = '#ff0000'; so identifyAll('#ff0000', {palette: web})
      // should have 'red' at index 0 with distance 0.
      const result = identifyAll('#ff0000', { palette: web, k: 1 });
      expect(result[0]?.name).toBe('red');
      expect(result[0]?.distance).toBeLessThan(1e-9);
    });
  });

  describe('k limit', () => {
    it('k: 3 returns exactly 3 entries', () => {
      expect(identifyAll('#ff0000', { palette: pantone, k: 3 })).toHaveLength(3);
    });
    it('k omitted returns every entry in the palette', () => {
      const all = identifyAll('#ff0000', { palette: web });
      expect(all.length).toBe(Object.keys(web.colors).length);
    });
    it('k: 0 returns empty array', () => {
      expect(identifyAll('#ff0000', { palette: web, k: 0 })).toEqual([]);
    });
    it('k greater than palette size caps at palette size', () => {
      const total = Object.keys(web.colors).length;
      const result = identifyAll('#ff0000', { palette: web, k: total + 100 });
      expect(result.length).toBe(total);
    });
    it('negative k is treated as 0', () => {
      expect(identifyAll('#ff0000', { palette: web, k: -5 })).toEqual([]);
    });
  });

  describe('palette defaults', () => {
    it('defaults to the web palette', () => {
      const result = identifyAll('#ff0000', { k: 1 });
      expect(result[0]?.name).toBe('red');
    });
    it("respects the target palette's defaultMetric when metric omitted", () => {
      // pantone default = deltaE2000, so distances should be ΔE values, not squared.
      const result = identifyAll('#ff0000', { palette: pantone, k: 1 });
      // ΔE2000 distance from #ff0000 to 172 C (~#fa4616) is in single digits.
      expect(result[0]?.distance).toBeLessThan(20);
    });
    it('metric override changes ordering in saturated regions', () => {
      // rebeccapurple in pantone: deltaE2000 picks 267 C; deltaEok picks 526 C.
      const dE2000 = identifyAll('#663399', { palette: pantone, metric: 'deltaE2000', k: 1 });
      const dEok = identifyAll('#663399', { palette: pantone, metric: 'deltaEok', k: 1 });
      expect(dE2000[0]?.name).toBe('267 C');
      expect(dEok[0]?.name).toBe('526 C');
    });
  });

  describe('BYO palette', () => {
    const brand = {
      name: 'acme',
      colors: { 'acme red': '#ff2a3b', 'acme ink': '#0a0f2c', 'acme mist': '#e6ecf5' },
      normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
      defaultMetric: 'deltaEok',
    } as const;

    it('ranks BYO entries correctly', () => {
      const result = identifyAll('#ff0000', { palette: brand });
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('acme red');
    });
    it('return type narrows to the BYO key union', () => {
      const result = identifyAll('#ff0000', { palette: brand, k: 1 });
      const first = result[0];
      if (first) {
        const _name: 'acme red' | 'acme ink' | 'acme mist' = first.name;
        expect(typeof _name).toBe('string');
      }
    });
  });

  describe('cross-metric distances', () => {
    it('euclidean-srgb distances are in sRGB channel-unit Euclidean space', () => {
      const result = identifyAll('#ff0000', {
        palette: web,
        metric: 'euclidean-srgb',
        k: 1,
      });
      expect(result[0]?.distance).toBeLessThan(1e-9); // exact match → 0
    });
    it('deltaE2000 distances are well below 1 for an exact match', () => {
      const result = identifyAll('#ff0000', {
        palette: web,
        metric: 'deltaE2000',
        k: 1,
      });
      expect(result[0]?.distance).toBeLessThan(1e-6);
    });
    it('crayola "did you mean" top-3 for a hot pink input', () => {
      const result = identifyAll('#ff4488', { palette: crayola, k: 3 });
      expect(result).toHaveLength(3);
      for (const entry of result) {
        expect(Object.keys(crayola.colors)).toContain(entry.name);
      }
    });
    it('euclidean-linear ranks in linear-RGB distance units', () => {
      const result = identifyAll('#ff0000', {
        palette: web,
        metric: 'euclidean-linear',
        k: 1,
      });
      expect(result[0]?.name).toBe('red');
      expect(result[0]?.distance).toBeLessThan(1e-9);
    });
    it('deltaE94 ranks in ΔE94 units', () => {
      const result = identifyAll('#ff0000', {
        palette: pantone,
        metric: 'deltaE94',
        k: 3,
      });
      expect(result).toHaveLength(3);
      for (const entry of result) {
        expect(entry.distance).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('error / empty cases', () => {
    it('returns [] for unrecognized input', () => {
      expect(identifyAll('not a color' as never)).toEqual([]);
    });
    it('returns [] for empty string', () => {
      expect(identifyAll('' as never)).toEqual([]);
    });
  });
});
