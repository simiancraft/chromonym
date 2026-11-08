import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fs595c } from '../src/palettes/fs595c.js';
import { lab10ToSrgbHex, parseFs595cGsaFixture } from './fs595cGsa.js';

const fixture = readFileSync(new URL('./fixtures/fs595c-gsa.tsv', import.meta.url), 'utf8');
const gsaRows = parseFs595cGsaFixture(fixture);

const retainedColors = {
  'FS 10129': '#876f55',
  'FS 14087': '#3c3727',
  'FS 14108': '#2a563f',
  'FS 15053': '#263b56',
  'FS 16152': '#5c6369',
  'FS 16231': '#767b7f',
  'FS 17200': '#919699',
  'FS 20129': '#876f55',
  'FS 24087': '#454031',
  'FS 25466': '#83c2e5',
  'FS 30076': '#620000',
  'FS 30129': '#876f55',
  'FS 30152': '#843320',
  'FS 30400': '#c29963',
  'FS 33432': '#e59a00',
  'FS 33591': '#e8d300',
  'FS 34056': '#232d24',
  'FS 34062': '#00401e',
  'FS 34077': '#2e3933',
  'FS 34087': '#554f44',
  'FS 34115': '#005d39',
  'FS 34172': '#556f56',
  'FS 35050': '#18324d',
  'FS 35053': '#263b56',
  'FS 35115': '#035c3c',
  'FS 35182': '#2a6da2',
  'FS 36187': '#697374',
  'FS 36329': '#849899',
  'FS 36400': '#c3c19b',
  'FS 37043': '#807537',
  'FS 37178': '#879296',
  'FS 38913': '#ff2d00',
} as const;

describe('FS595C generated palette', () => {
  it('contains the four corrected chips', () => {
    expect(fs595c.colors['FS 27769']).toBe('#e0d3ba');
    expect(fs595c.colors['FS 14056']).toBe('#474c48');
    expect(fs595c.colors['FS 11136']).toBe('#8c4040');
    expect(fs595c.colors['FS 34088']).toBe('#675e4b');
  });

  it('matches the conversion of every GSA-covered row', () => {
    for (const { chip, l, a, b } of gsaRows) {
      const key = `FS ${chip}` as keyof typeof fs595c.colors;
      expect(fs595c.colors[key] as string).toBe(lab10ToSrgbHex(l, a, b));
    }
  });

  it('retains every chip absent from the GSA data', () => {
    expect(
      Object.fromEntries(
        Object.keys(retainedColors).map((key) => [
          key,
          fs595c.colors[key as keyof typeof fs595c.colors],
        ]),
      ),
    ).toEqual(retainedColors);
  });

  it('contains exactly the GSA and retained keys in canonical format', () => {
    const keys = Object.keys(fs595c.colors);
    expect(keys).toHaveLength(682);
    expect(keys.every((key) => /^FS \d{5}$/.test(key))).toBe(true);
    const gsaKeys = new Set(gsaRows.map(({ chip }) => `FS ${chip}`));
    expect(Object.keys(retainedColors).every((key) => !gsaKeys.has(key))).toBe(true);
  });
});
