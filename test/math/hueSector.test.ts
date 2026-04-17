import { describe, expect, it } from 'bun:test';
import { hueSectorToPrime } from '../../src/math/hueSector';

describe('hueSectorToPrime', () => {
  it('returns [c, x, 0] for hp in [0, 1)', () => {
    expect(hueSectorToPrime(0, 1, 0.5)).toEqual([1, 0.5, 0]);
    expect(hueSectorToPrime(0.5, 1, 0.5)).toEqual([1, 0.5, 0]);
  });
  it('returns [x, c, 0] for hp in [1, 2)', () => {
    expect(hueSectorToPrime(1, 1, 0.5)).toEqual([0.5, 1, 0]);
  });
  it('returns [0, c, x] for hp in [2, 3)', () => {
    expect(hueSectorToPrime(2, 1, 0.5)).toEqual([0, 1, 0.5]);
  });
  it('returns [0, x, c] for hp in [3, 4)', () => {
    expect(hueSectorToPrime(3, 1, 0.5)).toEqual([0, 0.5, 1]);
  });
  it('returns [x, 0, c] for hp in [4, 5)', () => {
    expect(hueSectorToPrime(4, 1, 0.5)).toEqual([0.5, 0, 1]);
  });
  it('returns [c, 0, x] for hp in [5, 6)', () => {
    expect(hueSectorToPrime(5, 1, 0.5)).toEqual([1, 0, 0.5]);
  });
});
