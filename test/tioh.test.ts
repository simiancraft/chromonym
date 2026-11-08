import { describe, expect, it } from 'bun:test';
import { tioh } from '../src/palettes/tioh.js';
import { resolve } from '../src/resolve.js';

describe('tioh palette', () => {
  it('reproduces all 45 common yarn colors from the sampler', () => {
    expect(Object.keys(tioh.colors)).toHaveLength(45);
    expect(tioh.colors['AF Yellow 67103']).toBe('#ffcd00');
    expect(tioh.colors['Scarlet 67111']).toBe('#c10230');
    expect(tioh.colors['Ultramarine Blue 67118']).toBe('#001689');
    expect(tioh.colors['Bagby Green 67204']).toBe('#a19200');
  });

  it('uses the corrected DoD yarn cable for White', () => {
    expect(tioh.colors['White 67101']).toBe('#ffffff');
    expect('White 67103' in tioh.colors).toBe(false);
  });

  it('normalizes any input containing a yarn cable number to that number', () => {
    expect(resolve('67111', { palette: tioh })).toBe('#c10230');
    expect(resolve('cable 67111 scarlet', { palette: tioh })).toBe('#c10230');
    expect(tioh.normalize('Ultramarine Blue')).toBe('ultramarineblue');
  });
});
