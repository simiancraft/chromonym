import { describe, expect, it } from 'bun:test';
import { detectFormat, isColor } from '../src/detectFormat.js';

describe('detectFormat', () => {
  describe('HEX', () => {
    it('detects 6-digit hex', () => {
      expect(detectFormat('#ff0000')).toBe('HEX');
    });
    it('detects 3-digit hex (shorthand)', () => {
      expect(detectFormat('#f00')).toBe('HEX');
    });
    it('detects 8-digit hex (with alpha)', () => {
      expect(detectFormat('#ff0000aa')).toBe('HEX');
    });
    it('is case-insensitive', () => {
      expect(detectFormat('#FF00AA')).toBe('HEX');
    });
  });

  describe('RGB', () => {
    it('detects rgb() string with spaces', () => {
      expect(detectFormat('rgb(255, 0, 0)')).toBe('RGB');
    });
    it('detects rgb() string without spaces', () => {
      expect(detectFormat('rgb(255,0,0)')).toBe('RGB');
    });
    it('detects 3-tuple', () => {
      expect(detectFormat([255, 0, 0] as const)).toBe('RGB');
    });
    it('detects {r,g,b} object', () => {
      expect(detectFormat({ r: 255, g: 0, b: 0 })).toBe('RGB');
    });
  });

  describe('RGBA', () => {
    it('detects rgba() string', () => {
      expect(detectFormat('rgba(255, 0, 0, 0.5)')).toBe('RGBA');
    });
    it('detects 4-tuple', () => {
      expect(detectFormat([255, 0, 0, 0.5] as const)).toBe('RGBA');
    });
    it('detects {r,g,b,a} object', () => {
      expect(detectFormat({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('RGBA');
    });
  });

  describe('HSL', () => {
    it('detects hsl() string', () => {
      expect(detectFormat('hsl(0, 100%, 50%)')).toBe('HSL');
    });
    it('detects {h,s,l} object', () => {
      expect(detectFormat({ h: 0, s: 100, l: 50 })).toBe('HSL');
    });
  });

  describe('HSV', () => {
    it('detects hsv() string', () => {
      expect(detectFormat('hsv(0, 100%, 100%)')).toBe('HSV');
    });
    it('detects {h,s,v} object', () => {
      expect(detectFormat({ h: 0, s: 100, v: 100 })).toBe('HSV');
    });
  });

  describe('PANTONE strings no longer detected (off core path)', () => {
    // Pantone codes are palette data, not a structural color format —
    // detecting them here would force the palette into every identify/
    // convert bundle. Callers parse Pantone codes via `pantoneToRgba`
    // from `chromonym/conversions/pantone` instead.
    it('returns UNKNOWN for "185 C"', () => {
      expect(detectFormat('185 C' as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for "Pantone 185 C"', () => {
      expect(detectFormat('Pantone 185 C' as never)).toBe('UNKNOWN');
    });
  });

  describe('UNKNOWN', () => {
    it('returns UNKNOWN for garbage string', () => {
      expect(detectFormat('not a color' as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for empty string', () => {
      expect(detectFormat('' as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for empty object', () => {
      expect(detectFormat({} as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for 2-length array', () => {
      expect(detectFormat([1, 2] as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for 5-length array', () => {
      expect(detectFormat([1, 2, 3, 4, 5] as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for null', () => {
      expect(detectFormat(null as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for undefined', () => {
      expect(detectFormat(undefined as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for number', () => {
      expect(detectFormat(42 as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for boolean', () => {
      expect(detectFormat(true as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for prototype-polluted object (own-property check)', () => {
      const obj = Object.create({ r: 255, g: 0, b: 0 });
      expect(detectFormat(obj as never)).toBe('UNKNOWN');
    });
    it('returns UNKNOWN for object with only alpha (no r/g/b)', () => {
      expect(detectFormat({ a: 0.5 } as never)).toBe('UNKNOWN');
    });
  });
});

describe('isColor', () => {
  it('returns true for recognized color shapes', () => {
    expect(isColor('#ff0000')).toBe(true);
    expect(isColor('rgb(255, 0, 0)')).toBe(true);
    expect(isColor([255, 0, 0])).toBe(true);
    expect(isColor({ r: 255, g: 0, b: 0 })).toBe(true);
    expect(isColor({ h: 0, s: 100, l: 50 })).toBe(true);
    expect(isColor({ h: 0, s: 100, v: 100 })).toBe(true);
  });
  it('returns false for Pantone codes (palette data, not a structural format)', () => {
    expect(isColor('185 C')).toBe(false);
    expect(isColor('Pantone 185 C')).toBe(false);
  });
  it('returns false for garbage', () => {
    expect(isColor('not a color')).toBe(false);
    expect(isColor('')).toBe(false);
    expect(isColor(null)).toBe(false);
    expect(isColor(undefined)).toBe(false);
    expect(isColor(42)).toBe(false);
    expect(isColor({})).toBe(false);
    expect(isColor([1, 2])).toBe(false);
  });
});
