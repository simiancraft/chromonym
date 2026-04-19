import { describe, expect, it } from 'bun:test';
import { levenshtein } from '../../src/math/editDistance.js';

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('', '')).toBe(0);
    expect(levenshtein('abc', 'abc')).toBe(0);
    expect(levenshtein('rebeccapurple', 'rebeccapurple')).toBe(0);
  });

  it('returns length(b) when a is empty', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('', 'x')).toBe(1);
  });

  it('returns length(a) when b is empty', () => {
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('rebeccapurple', '')).toBe(13);
  });

  it('counts single insertion', () => {
    expect(levenshtein('abc', 'abcd')).toBe(1);
    expect(levenshtein('abcd', 'abc')).toBe(1);
  });

  it('counts single deletion', () => {
    expect(levenshtein('abc', 'ac')).toBe(1);
    expect(levenshtein('abcd', 'acd')).toBe(1);
  });

  it('counts single substitution', () => {
    expect(levenshtein('abc', 'abd')).toBe(1);
    expect(levenshtein('cat', 'bat')).toBe(1);
  });

  it('transpositions count as two edits (not one — this is Levenshtein, not Damerau)', () => {
    // 'ab' → 'ba' is one substitution + one substitution, OR delete + insert = 2.
    expect(levenshtein('ab', 'ba')).toBe(2);
    expect(levenshtein('teh', 'the')).toBe(2);
  });

  it('computes the canonical kitten/sitting example (distance = 3)', () => {
    // Textbook example: kitten → sitten (sub k→s) → sittin (sub e→i) → sitting (insert g)
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });

  it('handles realistic typo patterns on palette names', () => {
    // "rebecapurple" (missing one 'c')  → 1 edit from 'rebeccapurple'
    expect(levenshtein('rebecapurple', 'rebeccapurple')).toBe(1);
    // "Rebecca Porple" normalized → 'rebeccaporple' — 1 edit from 'rebeccapurple'
    expect(levenshtein('rebeccaporple', 'rebeccapurple')).toBe(1);
    // "razmatazz" (dropped 'z', dropped 'z') vs 'razzmatazz' — 1 edit
    expect(levenshtein('razmatazz', 'razzmatazz')).toBe(1);
  });

  it('is symmetric (distance is a metric)', () => {
    expect(levenshtein('abc', 'xyz')).toBe(levenshtein('xyz', 'abc'));
    expect(levenshtein('rebecca', 'rebekah')).toBe(levenshtein('rebekah', 'rebecca'));
  });

  it('swaps a and b when a is longer (space-optimization path)', () => {
    // This forces the `if (a.length > b.length) [a, b] = [b, a]` branch.
    expect(levenshtein('rebeccapurple', 'red')).toBe(11);
    expect(levenshtein('red', 'rebeccapurple')).toBe(11);
  });
});
