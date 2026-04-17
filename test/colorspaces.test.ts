import { describe, expect, it } from 'bun:test';
import { pantone, web, x11 } from '../src/colorspaces';

const HEX_RE = /^#[0-9a-f]{6}$/;

describe.each([
  ['web', web, { minCount: 140, spotChecks: { red: '#ff0000', aliceblue: '#f0f8ff' } }],
  ['x11', x11, { minCount: 600, spotChecks: { snow: '#fffafa', aliceblue: '#f0f8ff' } }],
  [
    'pantone',
    pantone,
    // biome-ignore lint/suspicious/noExplicitAny: pantone keys include digits and are valid identifiers but require string-indexing for test lookup
    { minCount: 900, spotChecks: { '100C': '#f6eb61', '102C': '#fce300' } as Record<string, string> },
  ],
])('%s colorspace', (_name, space, { minCount, spotChecks }) => {
  it(`has at least ${minCount} entries`, () => {
    expect(Object.keys(space).length).toBeGreaterThanOrEqual(minCount);
  });

  it('every value is a valid 6-digit lowercase hex', () => {
    for (const [key, value] of Object.entries(space)) {
      if (!HEX_RE.test(value)) {
        throw new Error(`Invalid hex for ${key}: ${value}`);
      }
    }
  });

  it('every key has no spaces', () => {
    for (const key of Object.keys(space)) {
      expect(key).not.toContain(' ');
    }
  });

  it('spot-checks known values', () => {
    for (const [key, expected] of Object.entries(spotChecks)) {
      expect((space as Record<string, string>)[key]).toBe(expected);
    }
  });
});
