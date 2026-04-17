import { describe, expect, it } from 'bun:test';
import { identify } from '../src/identify';

describe('identify', () => {
  describe('README examples', () => {
    it("identify('#ff0000') → 'red'", () => {
      expect(identify('#ff0000')).toBe('red');
    });
    it("identify([255, 0, 0]) → 'red'", () => {
      expect(identify([255, 0, 0])).toBe('red');
    });
    it("identify({ r: 250, g: 20, b: 60 }) → 'crimson'", () => {
      expect(identify({ r: 250, g: 20, b: 60 })).toBe('crimson');
    });
  });

  describe('input format variety', () => {
    it('accepts hex', () => {
      expect(identify('#00ff00')).toBe('lime');
    });
    it('accepts rgb string', () => {
      expect(identify('rgb(0, 255, 0)')).toBe('lime');
    });
    it('accepts rgb tuple', () => {
      expect(identify([0, 255, 0])).toBe('lime');
    });
    it('accepts rgb object', () => {
      expect(identify({ r: 0, g: 255, b: 0 })).toBe('lime');
    });
    it('accepts rgba input (alpha ignored)', () => {
      expect(identify({ r: 0, g: 255, b: 0, a: 0.5 })).toBe('lime');
    });
    it('accepts hsl input', () => {
      expect(identify({ h: 0, s: 100, l: 50 })).toBe('red');
    });
  });

  describe('colorspace option', () => {
    it('identifies in web by default', () => {
      expect(identify('#ff0000')).toBe('red');
    });
    it('identifies in x11', () => {
      const result = identify('#ff0000', { colorspace: 'x11' });
      expect(result).toMatch(/^red\d?$/);
    });
    it('identifies in pantone', () => {
      const result = identify('#e4002b', { colorspace: 'pantone' });
      expect(result).toBe('185C');
    });
  });

  describe('nearest-match behavior', () => {
    it('returns nearest when exact match is absent', () => {
      // #fe0001 is 1 unit off pure red; should still identify as 'red'.
      expect(identify('#fe0001')).toBe('red');
    });
    it('ties: returns first-encountered entry', () => {
      // #ffffff matches 'white' and 'aliceblue' poorly; white wins by distance.
      expect(identify('#ffffff')).toBe('white');
    });
  });

  describe('error / null cases', () => {
    it('returns null for unrecognized input', () => {
      expect(identify('not a color' as never)).toBeNull();
    });
    it('returns null for empty string', () => {
      expect(identify('' as never)).toBeNull();
    });
  });
});
