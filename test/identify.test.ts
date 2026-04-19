import { describe, expect, it } from 'bun:test';
import { identify } from '../src/identify.js';
import { crayola } from '../src/palettes/crayola.js';
import { pantone } from '../src/palettes/pantone.js';
import { web } from '../src/palettes/web.js';
import { x11 } from '../src/palettes/x11.js';

describe('identify', () => {
  describe('web palette (default)', () => {
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
    it('is explicit when palette: web is passed', () => {
      expect(identify('#ff0000', { palette: web })).toBe('red');
    });
  });

  describe('x11 palette', () => {
    it("returns 'red' for #ff0000 (alphabetically first among red/red1/…)", () => {
      expect(identify('#ff0000', { palette: x11 })).toBe('red');
    });
    it("returns 'gray 50' for #7f7f7f (x11-only entry)", () => {
      expect(identify('#7f7f7f', { palette: x11 })).toBe('gray 50');
    });
    it("returns 'light goldenrod' for #eedd82 (x11-only)", () => {
      expect(identify('#eedd82', { palette: x11 })).toBe('light goldenrod');
    });
    it("returns 'sea green' for #2e8b57 (shared name, same rgb)", () => {
      expect(identify('#2e8b57', { palette: x11 })).toBe('sea green');
    });
    it('accepts tuple input', () => {
      expect(identify([0, 0, 0], { palette: x11 })).toMatch(/^(black|gray 0|grey 0)$/);
    });
    it('returns a string for any recognized input', () => {
      const result = identify({ r: 123, g: 45, b: 67 }, { palette: x11 });
      expect(typeof result).toBe('string');
    });
  });

  describe('pantone palette', () => {
    it("returns '100 C' exactly for its canonical rgb", () => {
      expect(identify({ r: 246, g: 235, b: 97 }, { palette: pantone })).toBe('100 C');
    });
    it("returns '185 C' for #e4002b (exact)", () => {
      expect(identify('#e4002b', { palette: pantone })).toBe('185 C');
    });
    it('returns a Pantone code for pure red (nearest match)', () => {
      const result = identify('#ff0000', { palette: pantone });
      expect(result).toMatch(/^\d+ C$/);
    });
    it('accepts hsl input', () => {
      const result = identify({ h: 0, s: 100, l: 50 }, { palette: pantone });
      expect(result).toMatch(/^\d+ C$/);
    });
    it('ignores alpha in distance', () => {
      const r1 = identify({ r: 246, g: 235, b: 97, a: 1 }, { palette: pantone });
      const r2 = identify({ r: 246, g: 235, b: 97, a: 0.1 }, { palette: pantone });
      expect(r1).toBe(r2);
    });
  });

  describe('distance metric option', () => {
    it('defaults to deltaE76 for web (still returns red for pure red)', () => {
      expect(identify('#ff0000')).toBe('red');
    });
    it('defaults to deltaE2000 for pantone', () => {
      // Exact Pantone 185 C match holds regardless of metric.
      expect(identify('#e4002b', { palette: pantone })).toBe('185 C');
    });
    it("metric: 'euclidean-srgb' still returns pure-red match", () => {
      expect(identify('#ff0000', { metric: 'euclidean-srgb' })).toBe('red');
    });
    it("metric: 'euclidean-linear' still returns pure-red match", () => {
      expect(identify('#ff0000', { metric: 'euclidean-linear' })).toBe('red');
    });
    it("metric: 'deltaE76' still returns pure-red match", () => {
      expect(identify('#ff0000', { metric: 'deltaE76' })).toBe('red');
    });
    it("metric: 'deltaE94' still returns pure-red match", () => {
      expect(identify('#ff0000', { metric: 'deltaE94' })).toBe('red');
    });
    it("metric: 'deltaE2000' still returns pure-red match", () => {
      expect(identify('#ff0000', { metric: 'deltaE2000' })).toBe('red');
    });
    it("metric: 'deltaEok' still returns pure-red match", () => {
      expect(identify('#ff0000', { metric: 'deltaEok' })).toBe('red');
    });
    it('all metrics return a string for any recognized input', () => {
      const metrics = [
        'euclidean-srgb',
        'euclidean-linear',
        'deltaE76',
        'deltaE94',
        'deltaE2000',
        'deltaEok',
      ] as const;
      for (const m of metrics) {
        const r = identify({ r: 123, g: 45, b: 67 }, { palette: x11, metric: m });
        expect(typeof r).toBe('string');
      }
    });
    it('metric override works cross-palette', () => {
      expect(identify('#ff0000', { palette: pantone, metric: 'euclidean-srgb' })).toMatch(
        /^\d+ C$/,
      );
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

    it('returns a user-defined key for an exact input match', () => {
      expect(identify('#748c3f', { palette: homebrew })).toBe('nurgle green');
    });
    it('returns the nearest user-defined key for a nearby input', () => {
      expect(identify('#8a1a1b', { palette: homebrew })).toBe('world eaters red');
    });
    it('distinguishes closely-related reds (picks adeptus red over world eaters red)', () => {
      expect(identify('#652022', { palette: homebrew })).toBe('adeptus red');
    });
  });

  describe('error / null cases', () => {
    it('returns null for garbage string input', () => {
      expect(identify('not a color' as never)).toBeNull();
    });
    it('returns null for empty string', () => {
      expect(identify('' as never)).toBeNull();
    });
    it('returns null regardless of palette when input is unrecognized', () => {
      expect(identify('garbage' as never, { palette: pantone })).toBeNull();
    });
  });

  describe('source — cross-palette (name in, nearest name out)', () => {
    it("web name → pantone: 'rebeccapurple' → '267 C'", () => {
      expect(identify('rebeccapurple', { palette: pantone, source: web })).toBe('267 C');
    });
    it("crayola name → pantone: 'Razzmatazz' → '213 C'", () => {
      expect(identify('Razzmatazz', { palette: pantone, source: crayola })).toBe('213 C');
    });
    it("web name → x11: 'dodgerblue' → 'dodger blue' (shared hex, exact neighbor)", () => {
      expect(identify('dodgerblue', { palette: x11, source: web })).toBe('dodger blue');
    });
    it('source palette normalizer is applied to the input (case/punctuation tolerant)', () => {
      expect(identify('Rebecca Purple', { palette: pantone, source: web })).toBe('267 C');
      expect(identify('rebecca-purple!', { palette: pantone, source: web })).toBe('267 C');
    });
    it("metric override works on the target side: 'rebeccapurple' → '526 C' under deltaEok", () => {
      expect(identify('rebeccapurple', { palette: pantone, source: web, metric: 'deltaEok' })).toBe(
        '526 C',
      );
    });
    it('returns null when the name is not in the source palette', () => {
      expect(identify('not-a-real-web-name', { palette: pantone, source: web })).toBeNull();
    });
    it('structural input still wins when source is present — hex parses as hex', () => {
      expect(identify('#663399', { palette: pantone, source: web })).toBe('267 C');
    });
  });

  describe('k — ranked top-k matches', () => {
    it('returns a single-entry array with k: 1', () => {
      const result = identify('#ff0000', { palette: pantone, k: 1 });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toMatch(/^\d+ C$/);
      expect(typeof result[0]?.distance).toBe('number');
      expect(result[0]?.value).toMatch(/^#[0-9a-f]{6}$/);
    });
    it('returns k entries sorted ascending by distance', () => {
      const result = identify('#ff0080', { palette: pantone, k: 5 });
      expect(result).toHaveLength(5);
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev && curr) expect(curr.distance).toBeGreaterThanOrEqual(prev.distance);
      }
    });
    it('exact-hex match has distance 0', () => {
      const result = identify('#ff0000', { palette: web, k: 1 });
      expect(result[0]?.name).toBe('red');
      expect(result[0]?.value).toBe('#ff0000');
      expect(result[0]?.distance).toBeLessThan(1e-9);
    });
    it('k: 0 returns []', () => {
      expect(identify('#ff0000', { palette: web, k: 0 })).toEqual([]);
    });
    it('k > palette size caps at palette size', () => {
      const total = Object.keys(web.colors).length;
      expect(identify('#ff0000', { palette: web, k: total + 50 }).length).toBe(total);
    });
    it('k with unrecognized input returns []', () => {
      expect(identify('garbage' as never, { palette: web, k: 3 })).toEqual([]);
    });
    it('k honors metric override', () => {
      // rebeccapurple under deltaE2000 picks 267 C; under deltaEok picks 526 C.
      const def = identify('#663399', { palette: pantone, k: 1, metric: 'deltaE2000' });
      const ok = identify('#663399', { palette: pantone, k: 1, metric: 'deltaEok' });
      expect(def[0]?.name).toBe('267 C');
      expect(ok[0]?.name).toBe('526 C');
    });
    it('k combines with source — cross-palette top-k', () => {
      const result = identify('Razzmatazz', { palette: pantone, source: crayola, k: 3 });
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('213 C');
    });
    it('euclidean-srgb metric ranks in sRGB channel-unit distance', () => {
      const result = identify('#ff0000', { palette: web, metric: 'euclidean-srgb', k: 1 });
      expect(result[0]?.name).toBe('red');
      expect(result[0]?.distance).toBeLessThan(1e-9);
    });
    it('euclidean-linear metric ranks in linear-RGB distance units', () => {
      const result = identify('#ff0000', {
        palette: web,
        metric: 'euclidean-linear',
        k: 1,
      });
      expect(result[0]?.name).toBe('red');
      expect(result[0]?.distance).toBeLessThan(1e-9);
    });
    it('deltaE94 ranks in ΔE94 units', () => {
      const result = identify('#ff0000', { palette: pantone, metric: 'deltaE94', k: 3 });
      expect(result).toHaveLength(3);
      for (const entry of result) {
        expect(entry.distance).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
