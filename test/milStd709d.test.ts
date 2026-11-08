import { describe, expect, it } from 'bun:test';
import { identify } from '../src/identify.js';
import { fs595c } from '../src/palettes/fs595c.js';
import { milStd709d } from '../src/palettes/milStd709d.js';

const milStd709dFs595cChips = {
  Yellow: 'FS 33538',
  Brown: 'FS 30117',
  Gray: 'FS 36231',
  'Dark Red': 'FS 31136',
  'Dark Green': 'FS 34108',
  Violet: 'FS 17100',
  Black: 'FS 37038',
  Silver: 'FS 17178',
  Aluminum: 'FS 17178',
  'Light Green': 'FS 34558',
  'Light Red': 'FS 31158',
  White: 'FS 37875',
  'Light Blue': 'FS 35109',
  Orange: 'FS 32246',
  'Light Orange': 'FS 32544',
  Bronze: 'FS 17043',
  Gold: 'FS 17043',
  Brass: 'FS 17043',
} as const;

describe('MIL-STD-709D ammunition colors', () => {
  it('contains the 18 Tier II names from Table II', () => {
    expect(Object.keys(milStd709d.colors)).toEqual(Object.keys(milStd709dFs595cChips));
  });

  it('duplicates the matching GSA-derived FS595C values', () => {
    for (const [name, chip] of Object.entries(milStd709dFs595cChips)) {
      const value: string = milStd709d.colors[name as keyof typeof milStd709d.colors];
      const fs595cValue: string = fs595c.colors[chip];
      expect(value).toBe(fs595cValue);
    }
  });

  it('answers shared values with the first name in insertion order', () => {
    expect(identify('#c3c6c6', { palette: milStd709d })).toBe('Silver');
    expect(identify('#b89964', { palette: milStd709d })).toBe('Bronze');
  });
});
