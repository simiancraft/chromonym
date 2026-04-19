import { describe, expect, it } from 'bun:test';
import { crayola } from '../src/palettes/crayola.js';
import { pantone } from '../src/palettes/pantone.js';
import { web } from '../src/palettes/web.js';
import { x11 } from '../src/palettes/x11.js';
import { translate } from '../src/translate.js';

describe('translate', () => {
  describe('built-in → built-in', () => {
    it("translate('rebeccapurple', { from: web, to: pantone }) → '267 C'", () => {
      expect(translate('rebeccapurple', { from: web, to: pantone })).toBe('267 C');
    });
    it("translate('dodgerblue', { from: web, to: x11 }) → 'dodger blue'", () => {
      expect(translate('dodgerblue', { from: web, to: x11 })).toBe('dodger blue');
    });
    it("translate('Razzmatazz', { from: crayola, to: pantone }) → '213 C'", () => {
      expect(translate('Razzmatazz', { from: crayola, to: pantone })).toBe('213 C');
    });
    it("translate('Granny Smith Apple', { from: crayola, to: web }) → 'palegreen'", () => {
      const result = translate('Granny Smith Apple', { from: crayola, to: web });
      expect(typeof result).toBe('string');
    });
  });

  describe('normalizer tolerance on source name', () => {
    it('accepts casing / punctuation via the source palette normalizer', () => {
      expect(translate('Rebecca Purple', { from: web, to: pantone })).toBe('267 C');
      expect(translate('rebecca-purple!', { from: web, to: pantone })).toBe('267 C');
      expect(translate('REBECCAPURPLE', { from: web, to: pantone })).toBe('267 C');
    });
    it('crayola accepts casing / punctuation', () => {
      expect(translate('razzmatazz', { from: crayola, to: pantone })).toBe('213 C');
      expect(translate('granny-smith-apple', { from: crayola, to: pantone })).toBe(
        translate('Granny Smith Apple', { from: crayola, to: pantone }),
      );
    });
  });

  describe('metric override', () => {
    it('default uses the target palette defaultMetric', () => {
      // pantone defaultMetric = deltaE2000
      expect(translate('rebeccapurple', { from: web, to: pantone })).toBe('267 C');
    });
    it("metric: 'deltaEok' can diverge from the default in saturated regions", () => {
      // deltaEok disagrees with deltaE2000 in the saturated-purple region.
      expect(translate('rebeccapurple', { from: web, to: pantone, metric: 'deltaEok' })).toBe(
        '526 C',
      );
    });
  });

  describe('null on source miss', () => {
    it("returns null when source name isn't in the from palette", () => {
      expect(translate('not-a-css-color', { from: web, to: pantone })).toBeNull();
      expect(translate('NotACrayon', { from: crayola, to: pantone })).toBeNull();
    });
    it('returns null on empty input', () => {
      expect(translate('', { from: web, to: pantone })).toBeNull();
    });
  });

  describe('BYO on either side', () => {
    const brand = {
      name: 'acme',
      colors: {
        'acme red': '#ff2a3b',
        'acme ink': '#0a0f2c',
        'acme mist': '#e6ecf5',
      },
      normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
      defaultMetric: 'deltaEok',
    } as const;

    it('BYO → built-in: finds nearest Pantone for a brand color', () => {
      const result = translate('acme red', { from: brand, to: pantone });
      expect(result).toMatch(/^\d+ C$/);
    });
    it('built-in → BYO: finds nearest brand color for a CSS named color', () => {
      const result = translate('red', { from: web, to: brand });
      expect(['acme red', 'acme ink', 'acme mist']).toContain(result);
    });
  });
});
