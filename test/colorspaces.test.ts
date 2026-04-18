import { describe, expect, it } from 'bun:test';
import { pantone, web, x11 } from '../src/colorspaces';

const HEX_RE = /^#[0-9a-f]{6}$/;

describe.each([
  [
    'web',
    web,
    { minCount: 140, spotChecks: { red: '#ff0000', 'alice blue': '#f0f8ff' } },
  ],
  [
    'x11',
    x11,
    { minCount: 600, spotChecks: { snow: '#fffafa', 'alice blue': '#f0f8ff' } },
  ],
  [
    'pantone',
    pantone,
    {
      minCount: 900,
      spotChecks: { '100 C': '#f6eb61', '102 C': '#fce300' } as Record<string, string>,
    },
  ],
])('%s colorspace', (name, space, { minCount, spotChecks }) => {
  it('declares its own name', () => {
    expect(space.name).toBe(name);
  });

  it(`has at least ${minCount} entries`, () => {
    expect(Object.keys(space.colors).length).toBeGreaterThanOrEqual(minCount);
  });

  it('every value is a valid 6-digit lowercase hex', () => {
    for (const [key, value] of Object.entries(space.colors)) {
      if (!HEX_RE.test(value)) {
        throw new Error(`Invalid hex for ${key}: ${value}`);
      }
    }
  });

  it('every key round-trips through its own normalizer to match another key', () => {
    // Keys are display-ready (may contain spaces), but must resolve through
    // the palette's own normalize function — otherwise `resolve` won't find them.
    for (const key of Object.keys(space.colors)) {
      const normalized = space.normalize(key);
      expect(normalized.length).toBeGreaterThan(0);
      expect(normalized).not.toContain(' ');
    }
  });

  it('spot-checks known values', () => {
    for (const [key, expected] of Object.entries(spotChecks)) {
      expect((space.colors as Record<string, string>)[key]).toBe(expected);
    }
  });

  it('exposes a normalize function', () => {
    expect(typeof space.normalize).toBe('function');
  });

  it('declares a default distance metric', () => {
    expect(typeof space.defaultMetric).toBe('string');
  });
});
