import { describe, expect, it } from 'bun:test';
import { fs595c } from '../src/palettes/fs595c.js';
import { milStd101c } from '../src/palettes/milStd101c.js';

const milStd101cFs595cChips = {
  Yellow: 'FS 13655',
  Brown: 'FS 10080',
  Blue: 'FS 15102',
  Green: 'FS 14187',
  Gray: 'FS 16187',
  Red: 'FS 11105',
  Black: 'FS 17038',
  White: 'FS 17875',
  Orange: 'FS 12246',
  Buff: 'FS 13594',
} as const;

describe('MIL-STD-101C identification colors', () => {
  it('contains the ten colors assigned by sections 4.2 and 4.3', () => {
    expect(Object.keys(milStd101c.colors)).toEqual(Object.keys(milStd101cFs595cChips));
  });

  it('duplicates the matching GSA-derived FS595C values', () => {
    for (const [name, chip] of Object.entries(milStd101cFs595cChips)) {
      const value: string = milStd101c.colors[name as keyof typeof milStd101c.colors];
      const fs595cValue: string = fs595c.colors[chip];
      expect(value).toBe(fs595cValue);
    }
  });
});
