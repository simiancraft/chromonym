import { describe, expect, it } from 'bun:test';
import { pantoneToRgba, rgbaToPantone } from '../../src/conversions/pantone';

describe('pantoneToRgba', () => {
  it('resolves "100 C" (exact canonical key)', () => {
    expect(pantoneToRgba('100 C')).toEqual({ r: 246, g: 235, b: 97, a: 1 });
  });
  it('resolves "100C" (normalizer strips spaces — still matches)', () => {
    expect(pantoneToRgba('100C')).toEqual({ r: 246, g: 235, b: 97, a: 1 });
  });
  it('resolves "100 C" (space-normalized)', () => {
    expect(pantoneToRgba('100 C')).toEqual({ r: 246, g: 235, b: 97, a: 1 });
  });
  it('resolves "Pantone 185 C" (prefixed)', () => {
    expect(pantoneToRgba('Pantone 185 C')).toEqual({ r: 228, g: 0, b: 43, a: 1 });
  });
  it('resolves "PMS 100c" (prefixed + lowercase)', () => {
    expect(pantoneToRgba('PMS 100c')).toEqual({ r: 246, g: 235, b: 97, a: 1 });
  });
  it('throws on unknown code', () => {
    expect(() => pantoneToRgba('9999999C')).toThrow();
  });
  it('throws on non-Pantone string', () => {
    expect(() => pantoneToRgba('not a pantone')).toThrow();
  });
});

describe('rgbaToPantone', () => {
  it('returns exact Pantone code when the rgba matches a known entry', () => {
    // 185 C is #e4002b → rgb(228, 0, 43)
    expect(rgbaToPantone({ r: 228, g: 0, b: 43, a: 1 })).toBe('185 C');
  });
  it('returns nearest-match when rgba is close but not exact', () => {
    // Pure red (#ff0000) isn't a Pantone value but is near 185 C / Red 032 C.
    const match = rgbaToPantone({ r: 255, g: 0, b: 0, a: 1 });
    expect(match).toMatch(/^\d+ C$/);
  });
  it('ignores alpha channel in distance calculation', () => {
    const match1 = rgbaToPantone({ r: 228, g: 0, b: 43, a: 1 });
    const match2 = rgbaToPantone({ r: 228, g: 0, b: 43, a: 0.1 });
    expect(match1).toBe(match2);
  });
  it('never returns null (always finds a nearest)', () => {
    // Any rgba should map to some Pantone code.
    const result = rgbaToPantone({ r: 0, g: 0, b: 0, a: 1 });
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });
});

describe('round-trip pantone ↔ rgba', () => {
  it('exact Pantone entries round-trip to themselves', () => {
    const rgba = pantoneToRgba('100 C');
    expect(rgbaToPantone(rgba)).toBe('100 C');
  });
});
