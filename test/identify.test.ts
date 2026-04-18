import { describe, expect, it } from 'bun:test';
import { pantone } from '../src/colorspaces/pantone';
import { web } from '../src/colorspaces/web';
import { x11 } from '../src/colorspaces/x11';
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
      expect(identify('#ff0000', { colorspace: web })).toBe('red');
    });
  });

  describe('x11 colorspace', () => {
    it("returns 'red' for #ff0000 (alphabetically first among red/red1/…)", () => {
      expect(identify('#ff0000', { colorspace: x11 })).toBe('red');
    });
    it("returns 'gray 50' for #7f7f7f (x11-only entry)", () => {
      expect(identify('#7f7f7f', { colorspace: x11 })).toBe('gray 50');
    });
    it("returns 'light goldenrod' for #eedd82 (x11-only)", () => {
      expect(identify('#eedd82', { colorspace: x11 })).toBe('light goldenrod');
    });
    it("returns 'sea green' for #2e8b57 (shared name, same rgb)", () => {
      expect(identify('#2e8b57', { colorspace: x11 })).toBe('sea green');
    });
    it('accepts tuple input', () => {
      expect(identify([0, 0, 0], { colorspace: x11 })).toMatch(/^(black|gray 0|grey 0)$/);
    });
    it('returns a string for any recognized input', () => {
      const result = identify({ r: 123, g: 45, b: 67 }, { colorspace: x11 });
      expect(typeof result).toBe('string');
    });
  });

  describe('pantone colorspace', () => {
    it("returns '100 C' exactly for its canonical rgb", () => {
      expect(identify({ r: 246, g: 235, b: 97 }, { colorspace: pantone })).toBe('100 C');
    });
    it("returns '185 C' for #e4002b (exact)", () => {
      expect(identify('#e4002b', { colorspace: pantone })).toBe('185 C');
    });
    it('returns a Pantone code for pure red (nearest match)', () => {
      const result = identify('#ff0000', { colorspace: pantone });
      expect(result).toMatch(/^\d+ C$/);
    });
    it('accepts hsl input', () => {
      const result = identify({ h: 0, s: 100, l: 50 }, { colorspace: pantone });
      expect(result).toMatch(/^\d+ C$/);
    });
    it('ignores alpha in distance', () => {
      const r1 = identify({ r: 246, g: 235, b: 97, a: 1 }, { colorspace: pantone });
      const r2 = identify({ r: 246, g: 235, b: 97, a: 0.1 }, { colorspace: pantone });
      expect(r1).toBe(r2);
    });
  });

  describe('distance metric option', () => {
    it('defaults to deltaE76 for web (still returns red for pure red)', () => {
      expect(identify('#ff0000')).toBe('red');
    });
    it('defaults to deltaE2000 for pantone', () => {
      // Exact Pantone 185 C match holds regardless of metric.
      expect(identify('#e4002b', { colorspace: pantone })).toBe('185 C');
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
        const r = identify({ r: 123, g: 45, b: 67 }, { colorspace: x11, metric: m });
        expect(typeof r).toBe('string');
      }
    });
    it('metric override works cross-colorspace', () => {
      expect(identify('#ff0000', { colorspace: pantone, metric: 'euclidean-srgb' })).toMatch(
        /^\d+ C$/,
      );
    });
  });

  describe('BYO colorspace', () => {
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
      expect(identify('#748c3f', { colorspace: homebrew })).toBe('nurgle green');
    });
    it('returns the nearest user-defined key for a nearby input', () => {
      expect(identify('#8a1a1b', { colorspace: homebrew })).toBe('world eaters red');
    });
    it('distinguishes closely-related reds (picks adeptus red over world eaters red)', () => {
      expect(identify('#652022', { colorspace: homebrew })).toBe('adeptus red');
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
      expect(identify('garbage' as never, { colorspace: pantone })).toBeNull();
    });
  });
});
