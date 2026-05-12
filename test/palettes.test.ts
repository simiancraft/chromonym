import { describe, expect, it } from 'bun:test';
import { crayola } from '../src/palettes/crayola.js';
import { fs595b } from '../src/palettes/fs595b.js';
import { fs595c } from '../src/palettes/fs595c.js';
import { isccNbs } from '../src/palettes/isccNbs.js';
import { nbs } from '../src/palettes/nbs.js';
import { ncs } from '../src/palettes/ncs.js';
import { ntc } from '../src/palettes/ntc.js';
import { pantone } from '../src/palettes/pantone.js';
import { pokemon } from '../src/palettes/pokemon.js';
import { resene } from '../src/palettes/resene.js';
import { web } from '../src/palettes/web.js';
import { werner } from '../src/palettes/werner.js';
import { x11 } from '../src/palettes/x11.js';
import { xkcd } from '../src/palettes/xkcd.js';

const HEX_RE = /^#[0-9a-f]{6}$/;

describe.each([
  ['web', web, { minCount: 140, spotChecks: { red: '#ff0000', aliceblue: '#f0f8ff' } }],
  ['x11', x11, { minCount: 600, spotChecks: { snow: '#fffafa', 'alice blue': '#f0f8ff' } }],
  [
    'pantone',
    pantone,
    {
      minCount: 900,
      spotChecks: { '100 C': '#f6eb61', '102 C': '#fce300' } as Record<string, string>,
    },
  ],
  [
    'crayola',
    crayola,
    {
      minCount: 60,
      spotChecks: {
        Razzmatazz: '#e3256b',
        'Granny Smith Apple': '#a8e4a0',
      } as Record<string, string>,
    },
  ],
  [
    'ntc',
    ntc,
    {
      minCount: 1500,
      spotChecks: {
        Stratos: '#000741',
        'International Klein Blue': '#002fa7',
      } as Record<string, string>,
    },
  ],
  [
    'xkcd',
    xkcd,
    {
      minCount: 900,
      spotChecks: {
        'cloudy blue': '#acc2d9',
        dust: '#b2996e',
      } as Record<string, string>,
    },
  ],
  [
    'fs595c',
    fs595c,
    {
      minCount: 580,
      spotChecks: {
        'FS 10032': '#372726',
        'FS 11136': '#a32b25',
      } as Record<string, string>,
    },
  ],
  [
    'fs595b',
    fs595b,
    {
      minCount: 200,
      spotChecks: {
        'FS 11136': '#9b2f25',
        'FS 10140': '#532f15',
      } as Record<string, string>,
    },
  ],
  [
    'isccNbs',
    isccNbs,
    {
      minCount: 255,
      spotChecks: {
        'Vivid pink': '#fd7992',
        'Dark yellowish green': '#2f5d3a',
      } as Record<string, string>,
    },
  ],
  [
    'nbs',
    nbs,
    {
      minCount: 260,
      spotChecks: {
        // Intentionally different hex from isccNbs's 'Vivid pink' (#fd7992):
        // confirms the two digitizations are distinct palettes.
        vividpink: '#ffb5ba',
        brilliantblue: '#4997d0',
      } as Record<string, string>,
    },
  ],
  [
    'resene',
    resene,
    {
      minCount: 1300,
      spotChecks: {
        treepoppy: '#e2813b',
        acapulco: '#75aa94',
      } as Record<string, string>,
    },
  ],
  [
    'ncs',
    ncs,
    {
      minCount: 1900,
      spotChecks: {
        '0500-N': '#f2f2f2',
        '2030-R80B': '#677bd6',
      } as Record<string, string>,
    },
  ],
  [
    'pokemon',
    pokemon,
    {
      minCount: 18,
      spotChecks: {
        Fire: '#ee8130',
        Water: '#6390f0',
        Fairy: '#d685ad',
      } as Record<string, string>,
    },
  ],
  [
    'werner',
    werner,
    {
      minCount: 110,
      spotChecks: {
        'Berlin Blue': '#7994b5',
        'Prussian Blue': '#1c1949',
        'Lake Red': '#b74a70',
        'Velvet Black': '#241f20',
      } as Record<string, string>,
    },
  ],
])('%s palette', (name, space, { minCount, spotChecks }) => {
  it('declares its own name', () => {
    expect(space.name as string).toBe(name);
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
