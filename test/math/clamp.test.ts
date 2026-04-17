import { describe, expect, it } from 'bun:test';
import { clamp, requireFinite } from '../../src/math/clamp';

describe('clamp', () => {
  it('returns n when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
  it('clamps high to hi', () => {
    expect(clamp(300, 0, 255)).toBe(255);
  });
  it('clamps low to lo', () => {
    expect(clamp(-50, 0, 255)).toBe(0);
  });
  it('passes through boundary values', () => {
    expect(clamp(0, 0, 1)).toBe(0);
    expect(clamp(1, 0, 1)).toBe(1);
  });
});

describe('requireFinite', () => {
  it('returns a finite number unchanged', () => {
    expect(requireFinite(42, 'x')).toBe(42);
    expect(requireFinite(-0.5, 'x')).toBe(-0.5);
  });
  it('throws on NaN', () => {
    expect(() => requireFinite(Number.NaN, 'x')).toThrow();
  });
  it('throws on Infinity', () => {
    expect(() => requireFinite(Number.POSITIVE_INFINITY, 'x')).toThrow();
    expect(() => requireFinite(Number.NEGATIVE_INFINITY, 'x')).toThrow();
  });
  it('throws on non-number', () => {
    expect(() => requireFinite('42', 'x')).toThrow();
    expect(() => requireFinite(null, 'x')).toThrow();
    expect(() => requireFinite(undefined, 'x')).toThrow();
    expect(() => requireFinite({}, 'x')).toThrow();
  });
});
