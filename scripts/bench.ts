#!/usr/bin/env bun

/**
 * Micro-benchmarks for chromonym hot paths.
 * Run with: bun run scripts/bench.ts
 *
 * Each measurement is in microseconds per call, averaged over N iterations
 * with a 1000-call warmup. Results are noisy at the sub-microsecond scale;
 * use for relative comparison (before/after a change), not absolute claims.
 */

import { hexToRgba } from '../src/conversions/hex';
import { hslToRgba } from '../src/conversions/hsl';
import { hsvToRgba } from '../src/conversions/hsv';
import { rgbToRgba } from '../src/conversions/rgb';
import { convert } from '../src/convert';
import { detectFormat } from '../src/detectFormat';
import { identify } from '../src/identify';
import { resolve } from '../src/resolve';

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
bench('convert(#ff0000 → HEX)', () => convert('#ff0000'), 50000);
bench('convert(#ff0000 → HSL)', () => convert('#ff0000', { format: 'HSL' }), 50000);
bench('resolve(crimson, web)', () => resolve('crimson'), 50000);
bench('resolve(185C, pantone)', () => resolve('185 C', { colorspace: 'pantone' }), 50000);

console.log('\n— nearest-match —');
bench('identify(#ff0000, web)', () => identify('#ff0000'), 20000);
bench('identify(#ff0000, x11)', () => identify('#ff0000', { colorspace: 'x11' }), 5000);
bench('identify(#ff0000, pantone)', () => identify('#ff0000', { colorspace: 'pantone' }), 3000);

console.log('');
