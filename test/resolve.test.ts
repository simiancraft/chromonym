import { describe, expect, it } from 'bun:test';
import { pantone } from '../src/colorspaces/pantone';
import { web } from '../src/colorspaces/web';
import { x11 } from '../src/colorspaces/x11';
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
    it("resolve('185 C', { colorspace: pantone }) → '#e4002b'", () => {
      expect(resolve('185 C', { colorspace: pantone })).toBe('#e4002b');
    });
    it("resolve('Pantone 185 C', { colorspace: pantone }) → '#e4002b'", () => {
      expect(resolve('Pantone 185 C', { colorspace: pantone })).toBe('#e4002b');
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
    it("resolve('red', { format: 'PANTONE' }) returns nearest Pantone C code", () => {
      const result = resolve('red', { format: 'PANTONE' });
      expect(result).toMatch(/^\d+C$/);
    });
    it("resolve('185 C', { colorspace: pantone, format: 'RGBA' }) returns the rgba object", () => {
      expect(resolve('185 C', { colorspace: pantone, format: 'RGBA' })).toEqual({
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

  describe('x11 colorspace', () => {
    it('resolves x11-only name', () => {
      expect(resolve('antiquewhite1', { colorspace: x11 })).toBe('#ffefdb');
    });
    it('normalizes x11 spaced input', () => {
      expect(resolve('Antique White 1', { colorspace: x11 })).toBe('#ffefdb');
    });
    it('returns null for x11-only name under web colorspace', () => {
      expect(resolve('antiquewhite1', { colorspace: web })).toBeNull();
    });
  });

  describe('pantone colorspace', () => {
    it('resolves bare numeric code', () => {
      expect(resolve('100C', { colorspace: pantone })).toBe('#f6eb61');
    });
    it('resolves case-insensitively', () => {
      expect(resolve('100c', { colorspace: pantone })).toBe('#f6eb61');
    });
    it('resolves with PMS prefix', () => {
      expect(resolve('PMS 100C', { colorspace: pantone })).toBe('#f6eb61');
    });
    it('returns null for unknown pantone code', () => {
      expect(resolve('999999C', { colorspace: pantone })).toBeNull();
    });
  });

  describe('BYO colorspace', () => {
    const homebrew = {
      name: 'warhammer',
      colors: {
        WorldEatersRed: '#8b1a1a',
        SonsOfMaliceWhite: '#e8e4d8',
        TheFlawlessHostPurple: '#6b2d7d',
        NurgleGreen: '#748c3f',
        AlphaLegionTeal: '#2a6d7a',
      },
      normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),
      defaultMetric: 'deltaE2000',
    } as const;

    it('resolves a BYO key to its hex', () => {
      expect(resolve('NurgleGreen', { colorspace: homebrew })).toBe('#748c3f');
    });
    it('applies the BYO normalizer (case + punctuation insensitive)', () => {
      expect(resolve('nurgle-green', { colorspace: homebrew })).toBe('#748c3f');
    });
    it('returns null for an unknown key', () => {
      expect(resolve('DeathGuard', { colorspace: homebrew })).toBeNull();
    });
  });
});
