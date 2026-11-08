import { describe, expect, it } from 'bun:test';
import { carc } from '../src/palettes/carc.js';
import { fs595c } from '../src/palettes/fs595c.js';

const carcFs595cChips = {
  'Aircraft Black': 'FS 37038',
  'Aircraft Gray': 'FS 36300',
  'Aircraft Green': 'FS 34031',
  'Aircraft Insignia Blue': 'FS 35044',
  'Aircraft Red': 'FS 31136',
  'Aircraft White': 'FS 37875',
  'Aircraft Yellow': 'FS 33538',
  Black: 'FS 37030',
  'Blue Gray': 'FS 35237',
  'Brown 383': 'FS 30051',
  'Dark Green': 'FS 34082',
  'Dark Sandstone': 'FS 33510',
  'Earth Yellow': 'FS 33245',
  'Field Drab': 'FS 33105',
  'Green 383': 'FS 34094',
  'Green 808': 'FS 34102',
  'Interior Aircraft Black': 'FS 37031',
  'Interior Aircraft Gray': 'FS 36231',
  'IRR Foliage Green 504': 'FS 34160',
  'Medium Gray': 'FS 36375',
  'Olive Drab': 'FS 34088',
  Sand: 'FS 33303',
  'Tan 686A': 'FS 33446',
  Tan: 'FS 33531',
  'Woodland Desert Sage': 'FS 34201',
  'Weapons Safety Red': 'FS 38905',
} as const;

describe('CARC coating colors', () => {
  it('contains the 26 colors listed by MIL-DTL-53039E', () => {
    expect(Object.keys(carc.colors)).toEqual(Object.keys(carcFs595cChips));
  });

  it('duplicates the matching GSA-derived FS595C values', () => {
    for (const [name, chip] of Object.entries(carcFs595cChips)) {
      const carcValue: string = carc.colors[name as keyof typeof carc.colors];
      const fs595cValue: string = fs595c.colors[chip as keyof typeof fs595c.colors];
      expect(carcValue).toBe(fs595cValue);
    }
  });
});
