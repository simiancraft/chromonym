import { describe, expect, it } from 'bun:test';
import { identify } from '../src/identify.js';
import { carc } from '../src/palettes/carc.js';
import { copic } from '../src/palettes/copic.js';
import { crayola } from '../src/palettes/crayola.js';
import { farrowBall } from '../src/palettes/farrowBall.js';
import { fs595b } from '../src/palettes/fs595b.js';
import { fs595c } from '../src/palettes/fs595c.js';
import { isccNbs } from '../src/palettes/isccNbs.js';
import { japanese } from '../src/palettes/japanese.js';
import { material } from '../src/palettes/material.js';
import { milStd101c } from '../src/palettes/milStd101c.js';
import { milStd709d } from '../src/palettes/milStd709d.js';
import { milStd2525d } from '../src/palettes/milStd2525d.js';
import { nbs } from '../src/palettes/nbs.js';
import { ncs } from '../src/palettes/ncs.js';
import { ntc } from '../src/palettes/ntc.js';
import { pantone } from '../src/palettes/pantone.js';
import { pokemon } from '../src/palettes/pokemon.js';
import { prismacolor } from '../src/palettes/prismacolor.js';
import { ral } from '../src/palettes/ral.js';
import { resene } from '../src/palettes/resene.js';
import { tailwind } from '../src/palettes/tailwind.js';
import { tcca } from '../src/palettes/tcca.js';
import { usMilitary } from '../src/palettes/usMilitary.js';
import { uswds } from '../src/palettes/uswds.js';
import { web } from '../src/palettes/web.js';
import { werner } from '../src/palettes/werner.js';
import { x11 } from '../src/palettes/x11.js';
import { xkcd } from '../src/palettes/xkcd.js';
import { resolve } from '../src/resolve.js';

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
    'copic',
    copic,
    {
      minCount: 358,
      spotChecks: {
        BV0000: '#eeecf5',
        B01: '#e1f1f3',
        YG03: '#eaeeb2',
        'C-5': '#a4aeb2',
      } as Record<string, string>,
    },
  ],
  [
    'prismacolor',
    prismacolor,
    {
      minCount: 150,
      spotChecks: {
        PC901: '#162452',
        PC1035: '#eefd02',
        PC1099: '#474443',
        PC938: '#ffffff',
      } as Record<string, string>,
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
    'farrowBall',
    farrowBall,
    {
      minCount: 132,
      spotChecks: {
        "Elephant's Breath": '#ccbfb3',
        'Dead Salmon': '#b49d8d',
        'Borrowed Light': '#d5dbdb',
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
    'japanese',
    japanese,
    {
      minCount: 227,
      spotChecks: {
        'Sakura-iro': '#fcc9b9',
        Ainezumi: '#5c544e',
        'Kōbai-iro': '#db5a6b',
      } as Record<string, string>,
    },
  ],
  [
    'carc',
    carc,
    {
      minCount: 26,
      spotChecks: {
        'Green 383': '#4f5443',
        'Tan 686A': '#b79d7f',
        'Weapons Safety Red': '#fc3b2c',
      } as Record<string, string>,
    },
  ],
  [
    'fs595c',
    fs595c,
    {
      minCount: 680,
      spotChecks: {
        'FS 10032': '#473f3f',
        'FS 11136': '#8c4040',
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
    'tcca',
    tcca,
    {
      minCount: 238,
      spotChecks: {
        'Old Glory Red 70180': '#9c1c2d',
        'Scarlet 65006': '#a62c30',
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
  [
    'tailwind',
    tailwind,
    {
      minCount: 242,
      spotChecks: {
        'slate-500': '#62748e',
        'rose-500': '#ff2056',
        'gray-50': '#f9fafb',
        'blue-600': '#155dfc',
      } as Record<string, string>,
    },
  ],
  [
    'material',
    material,
    {
      minCount: 98,
      spotChecks: {
        'light-primary': '#6750a4',
        'light-on-surface': '#1d1b20',
        'dark-primary': '#d0bcff',
        'dark-surface': '#141218',
      } as Record<string, string>,
    },
  ],
  [
    'ral',
    ral,
    {
      minCount: 215,
      spotChecks: {
        'RAL 1003': '#f9a900',
        'RAL 5002': '#00387a',
        'RAL 9005': '#0e0e10',
        'RAL 9011': '#27292b',
      } as Record<string, string>,
    },
  ],
  [
    'uswds',
    uswds,
    {
      minCount: 461,
      spotChecks: {
        'blue-60v': '#005ea2',
        'red-warm-60v': '#9c3d10',
        'cyan-5': '#e7f6f8',
        'gray-100': '#000000',
      } as Record<string, string>,
    },
  ],
  [
    'usMilitary',
    usMilitary,
    {
      minCount: 31,
      spotChecks: {
        'Army Gold': '#ffcc01',
        'Air Force Blue': '#00308f',
        'Air Force Ultramarine Blue': '#00539f',
        'DOW Space Blue': '#15263b',
      } as Record<string, string>,
    },
  ],
  [
    'milStd101c',
    milStd101c,
    {
      minCount: 10,
      spotChecks: {
        Yellow: '#fcb217',
        Brown: '#625046',
        Blue: '#2c698d',
        Green: '#5b7a41',
      } as Record<string, string>,
    },
  ],
  [
    'milStd709d',
    milStd709d,
    {
      minCount: 18,
      spotChecks: {
        Yellow: '#f5a01c',
        'Dark Green': '#476653',
        'Light Blue': '#466b7d',
        Bronze: '#b89964',
      } as Record<string, string>,
    },
  ],
  [
    'milStd2525d',
    milStd2525d,
    {
      minCount: 20,
      spotChecks: {
        'Hostile Medium': '#ff3031',
        'Friend Light': '#80e0ff',
        'Civilian Dark': '#500050',
        'Friend Unfilled': '#00ffff',
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

describe('japanese palette', () => {
  it('ships 227 romanized lookup names', () => {
    expect(Object.keys(japanese.colors)).toHaveLength(227);
  });

  it('resolves both names for Hanaba-iro', () => {
    expect(resolve('Hanaba-iro', { palette: japanese })).toBe('#ffb94e');
    expect(resolve('kayou-iro', { palette: japanese })).toBe('#ffb94e');
  });

  it('normalizes macrons, case, spaces, hyphens, and apostrophes', () => {
    expect(japanese.normalize('Kōbai-iro')).toBe('kobaiiro');
    expect(japanese.normalize('KOBAI IRO')).toBe('kobaiiro');
    expect(japanese.normalize("Su'ō")).toBe('suo');
  });
});

/** WCAG 2 contrast ratio between two sRGB hex colors. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('uswds palette', () => {
  const entries = Object.entries(uswds.colors);
  const grade = (key: string) => Number(/-(\d+)v?$/.exec(key)?.[1]);

  it('ships the 461 v3.14.0 system tokens', () => {
    expect(entries.length).toBe(461);
  });

  it('keeps every token distinct once normalized', () => {
    const normalized = entries.map(([key]) => uswds.normalize(key));
    expect(new Set(normalized).size).toBe(entries.length);
  });

  it('meets WCAG AA (4.5:1) for every pair 50 or more grades apart', () => {
    let worst = Number.POSITIVE_INFINITY;
    for (const [i, [a, hexA]] of entries.entries()) {
      for (const [b, hexB] of entries.slice(i + 1)) {
        if (Math.abs(grade(a) - grade(b)) >= 50) worst = Math.min(worst, contrast(hexA, hexB));
      }
    }
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });
});

describe('milStd2525d palette', () => {
  const identities = ['Hostile', 'Friend', 'Neutral', 'Unknown', 'Civilian'] as const;
  const shades = ['Dark', 'Medium', 'Light', 'Unfilled'] as const;

  it('carries a dark, medium, light, and unfilled color for each identity, and nothing else', () => {
    const expected = identities.flatMap((id) => shades.map((shade) => `${id} ${shade}`));
    expect(Object.keys(milStd2525d.colors).sort()).toEqual(expected.sort());
  });

  it('answers the shared yellow with the filled entry, first in insertion order', () => {
    expect(milStd2525d.colors['Unknown Unfilled']).toBe(milStd2525d.colors['Unknown Medium']);
    expect(identify('#ffff00', { palette: milStd2525d })).toBe('Unknown Medium');
  });
});
