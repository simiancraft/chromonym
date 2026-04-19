#!/usr/bin/env bun

/**
 * Micro-benchmarks for chromonym hot paths.
 * Run with: bun run scripts/bench.ts
 *
 * Each measurement is in microseconds per call, averaged over N iterations
 * with a 1000-call warmup. Results are noisy at the sub-microsecond scale;
 * use for relative comparison (before/after a change), not absolute claims.
 */

import { hexToRgba } from '../src/conversions/hex.js';
import { hslToRgba } from '../src/conversions/hsl.js';
import { hsvToRgba } from '../src/conversions/hsv.js';
import { rgbToRgba } from '../src/conversions/rgb.js';
import { convert, fromRgba, toRgba } from '../src/convert.js';
import { detectFormat } from '../src/detectFormat.js';
import { identify } from '../src/identify.js';
import { pantone } from '../src/palettes/pantone.js';
import { x11 } from '../src/palettes/x11.js';
import { resolve } from '../src/resolve.js';

function bench(label: string, fn: () => unknown, iters: number): void {
  for (let i = 0; i < 1000; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < iters; i++) fn();
  const t1 = performance.now();
  const us = ((t1 - t0) * 1000) / iters;
  console.log(`  ${label.padEnd(40)} ${us.toFixed(3).padStart(8)} µs/call   (${iters} iters)`);
}

console.log('\n=== chromonym benchmarks ===\n');

console.log('— low-level parsers —');
bench('detectFormat(#ff0000)', () => detectFormat('#ff0000'), 200000);
bench('detectFormat({r,g,b})', () => detectFormat({ r: 255, g: 0, b: 0 }), 200000);
bench('hexToRgba(#ff0000)', () => hexToRgba('#ff0000'), 200000);
bench('rgbToRgba({r,g,b})', () => rgbToRgba({ r: 255, g: 0, b: 0 }), 200000);
bench('hslToRgba({h,s,l})', () => hslToRgba({ h: 180, s: 50, l: 50 }), 200000);
bench('hsvToRgba({h,s,v})', () => hsvToRgba({ h: 180, s: 50, v: 50 }), 200000);

console.log('\n— dispatchers —');
bench('toRgba(#ff0000)', () => toRgba('#ff0000'), 100000);
bench('fromRgba(rgba, HEX)', () => fromRgba({ r: 255, g: 0, b: 0, a: 1 }, 'HEX'), 100000);
bench('convert(#ff0000 → HEX)', () => convert('#ff0000'), 50000);
bench('convert(#ff0000 → HSL)', () => convert('#ff0000', { format: 'HSL' }), 50000);
bench('resolve(crimson, web)', () => resolve('crimson'), 50000);
bench('resolve(185 C, pantone)', () => resolve('185 C', { palette: pantone }), 50000);

console.log('\n— nearest-match (palette defaults) —');
bench('identify(#ff0000, web)', () => identify('#ff0000'), 20000);
bench('identify(#ff0000, x11)', () => identify('#ff0000', { palette: x11 }), 5000);
bench('identify(#ff0000, pantone)', () => identify('#ff0000', { palette: pantone }), 3000);

console.log('\n— nearest-match (metric comparison, pantone 907 entries) —');
for (const metric of [
  'euclidean-srgb',
  'euclidean-linear',
  'deltaE76',
  'deltaE94',
  'deltaE2000',
  'deltaEok',
] as const) {
  bench(
    `identify(#ff0080, pantone, ${metric})`,
    () => identify('#ff0080', { palette: pantone, metric }),
    metric.startsWith('deltaE') && metric !== 'deltaE76' ? 1000 : 3000,
  );
}

console.log('');
