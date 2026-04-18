import { describe, expect, it } from 'bun:test';
import { hueSectorToPrime } from '../../src/math/hueSector';

describe('hueSectorToPrime', () => {
  it('returns [chroma, secondary, 0] for sector [0, 1)', () => {
    expect(hueSectorToPrime(0, 1, 0.5)).toEqual([1, 0.5, 0]);
    expect(hueSectorToPrime(0.5, 1, 0.5)).toEqual([1, 0.5, 0]);
  });
  it('returns [secondary, chroma, 0] for sector [1, 2)', () => {
    expect(hueSectorToPrime(1, 1, 0.5)).toEqual([0.5, 1, 0]);
  });
  it('returns [0, chroma, secondary] for sector [2, 3)', () => {
    expect(hueSectorToPrime(2, 1, 0.5)).toEqual([0, 1, 0.5]);
  });
  it('returns [0, secondary, chroma] for sector [3, 4)', () => {
    expect(hueSectorToPrime(3, 1, 0.5)).toEqual([0, 0.5, 1]);
  });
  it('returns [secondary, 0, chroma] for sector [4, 5)', () => {
    expect(hueSectorToPrime(4, 1, 0.5)).toEqual([0.5, 0, 1]);
  });
  it('returns [chroma, 0, secondary] for sector [5, 6)', () => {
    expect(hueSectorToPrime(5, 1, 0.5)).toEqual([1, 0, 0.5]);
  });
});
