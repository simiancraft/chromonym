import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { defineColorPalette } from '../src/defineColorPalette.js';
import { identify } from '../src/identify.js';
import { resolve } from '../src/resolve.js';

describe('defineColorPalette', () => {
  let warnMock: ReturnType<typeof mock>;
  beforeEach(() => {
    warnMock = mock(() => {});
    spyOn(console, 'warn').mockImplementation(warnMock);
  });

  describe('value normalization', () => {
    it('preserves hex values as-is', () => {
      const p = defineColorPalette({
        name: 't',
        colors: { Red: '#ff0000', Blue: '#0000ff' },
        normalize: (s) => s.toLowerCase(),
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.Red).toBe('#ff0000');
      expect(p.colors.Blue).toBe('#0000ff');
    });

    it('normalizes rgb string values to hex', () => {
      const p = defineColorPalette({
        name: 't',
        colors: { Red: 'rgb(255, 0, 0)' },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.Red).toBe('#ff0000');
    });

    it('normalizes hsl string values to hex', () => {
      const p = defineColorPalette({
        name: 't',
        colors: { Red: 'hsl(0, 100%, 50%)' },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.Red).toBe('#ff0000');
    });

    it('normalizes rgb tuple values to hex', () => {
      const p = defineColorPalette({
        name: 't',
        colors: { Red: [255, 0, 0] as const },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.Red).toBe('#ff0000');
    });

    it('normalizes rgb object values to hex', () => {
      const p = defineColorPalette({
        name: 't',
        colors: { Red: { r: 255, g: 0, b: 0 } },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.Red).toBe('#ff0000');
    });

    it('normalizes hsv object values to hex', () => {
      const p = defineColorPalette({
        name: 't',
        colors: { Red: { h: 0, s: 100, v: 100 } },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.Red).toBe('#ff0000');
    });

    it('accepts a mixed-format jagged palette and smooths every entry to hex', () => {
      const p = defineColorPalette({
        name: 'brand',
        colors: {
          'Acme Red': '#ff0044',
          'Acme Blue': 'rgb(0, 68, 255)',
          'Acme Ink': { r: 20, g: 20, b: 30 },
          'Acme Mist': [240, 244, 248] as const,
        },
        normalize: (s) => s.toLowerCase(),
        defaultMetric: 'deltaE2000',
      });
      expect(p.colors['Acme Red']).toBe('#ff0044');
      expect(p.colors['Acme Blue']).toBe('#0044ff');
      expect(p.colors['Acme Ink']).toBe('#14141e');
      expect(p.colors['Acme Mist']).toBe('#f0f4f8');
    });
  });

  describe('bad-value handling', () => {
    it('discards a key with an unparseable string value and logs a warning', () => {
      const p = defineColorPalette({
        name: 'partial',
        colors: {
          good: '#00ff00',
          bad: 'taco' as never,
        },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect('good' in p.colors).toBe(true);
      expect('bad' in p.colors).toBe(false);
      expect(warnMock).toHaveBeenCalledTimes(1);
      const msg = warnMock.mock.calls[0]?.[0];
      expect(msg).toContain('defineColorPalette');
      expect(msg).toContain('partial');
      expect(msg).toContain('"bad"');
      expect(msg).toContain('taco');
    });

    it('survives a garbage object value (drops just that key)', () => {
      const p = defineColorPalette({
        name: 'partial',
        colors: {
          good: '#ff00ff',
          weird: { not: 'a color' } as never,
        },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(p.colors.good).toBe('#ff00ff');
      expect('weird' in p.colors).toBe(false);
      expect(warnMock).toHaveBeenCalledTimes(1);
    });

    it('drops every bad key but reports each via its own warn call', () => {
      const p = defineColorPalette({
        name: 'mostly-bad',
        colors: {
          ok: '#123456',
          badA: 'foo' as never,
          badB: 'bar' as never,
          badC: null as never,
        },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(Object.keys(p.colors)).toEqual(['ok']);
      expect(warnMock).toHaveBeenCalledTimes(3);
    });

    it('returns an empty palette (but does not throw) when every value is bad', () => {
      const p = defineColorPalette({
        name: 'all-bad',
        colors: { a: 'nope' as never, b: 'also nope' as never },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect(Object.keys(p.colors)).toEqual([]);
    });

    it('describe() handles a value whose JSON.stringify returns undefined', () => {
      // JSON.stringify(() => {}) === undefined; describe() falls back to String(value).
      const fn = (() => 'hi') as never;
      const p = defineColorPalette({
        name: 'json-undef',
        colors: { good: '#00ff00', badFn: fn },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect('badFn' in p.colors).toBe(false);
      expect(warnMock).toHaveBeenCalledTimes(1);
      const msg = warnMock.mock.calls[0]?.[0];
      // String(() => 'hi') yields the function source; the warn message
      // falls back to that when JSON.stringify returns undefined.
      expect(msg).toContain('badFn');
    });

    it('preserves __proto__ as a literal key when the palette is JSON-hydrated', () => {
      // JSON.parse materializes '__proto__' as a real own string key, unlike
      // object literals where TypeScript would reject it outright. With a
      // plain `{}` accumulator, the Object.prototype.__proto__ setter would
      // silently eat the assignment (strings aren't valid prototypes), and
      // the key would disappear without firing the bad-value warn path.
      // The Object.create(null) accumulator avoids that.
      const source = JSON.parse('{"__proto__": "#ff0000", "good": "#00ff00"}');
      const palette = defineColorPalette({
        name: 'proto-hydrated',
        colors: source,
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      const colors = palette.colors as Record<string, string>;
      expect(colors.good).toBe('#00ff00');
      expect(colors.__proto__).toBe('#ff0000');
      expect(warnMock).toHaveBeenCalledTimes(0);
    });

    it('describe() survives a value whose JSON.stringify throws (circular ref)', () => {
      // Circular references make JSON.stringify throw; describe()'s catch
      // path falls back to String(value), which works for plain objects.
      const circular: Record<string, unknown> = { name: 'loop' };
      circular.self = circular;
      const p = defineColorPalette({
        name: 'circular',
        colors: { good: '#00ff00', bad: circular as never },
        normalize: (s) => s,
        defaultMetric: 'deltaE76',
      });
      expect('bad' in p.colors).toBe(false);
      expect(warnMock).toHaveBeenCalledTimes(1);
      const msg = warnMock.mock.calls[0]?.[0];
      expect(msg).toContain('"bad"');
      // String({...}) renders as '[object Object]'.
      expect(msg).toContain('[object Object]');
    });
  });

  describe('downstream integration', () => {
    it('returned palette works with identify, including narrow key return type', () => {
      const brand = defineColorPalette({
        name: 'brand',
        colors: {
          'Acme Red': '#ff0044',
          'Acme Blue': '#0044ff',
        },
        normalize: (s) => s.toLowerCase(),
        defaultMetric: 'deltaE2000',
      });
      const name = identify('#ff0000', { palette: brand });
      // Runtime assertion; the type-level inference is exercised by tsc.
      expect(name).toBe('Acme Red');
    });

    it('returned palette works with resolve', () => {
      const brand = defineColorPalette({
        name: 'brand',
        colors: { 'Acme Red': 'rgb(255, 0, 68)' },
        normalize: (s) => s.toLowerCase().replace(/\s+/g, ''),
        defaultMetric: 'deltaE2000',
      });
      expect(resolve('Acme Red', { palette: brand })).toBe('#ff0044');
    });
  });
});
