import { describe, expect, it } from 'bun:test';
import { pantone } from '../src/palettes/pantone';
import { web } from '../src/palettes/web';
import { identify } from '../src/identify';
import type { DistanceMetric } from '../src/types';

/**
 * Documents that chromonym's distance metrics aren't interchangeable —
 * different metrics can return different names for the same input. This
 * is the whole point of exposing the `metric` axis; these tests lock the
 * divergences in place so regressions in any metric's pipeline surface
 * immediately.
 *
 * Targets are in the saturated blue/purple region, where CIEDE2000 was
 * specifically designed to diverge from CIE76, and where OKLAB (Ottosson
 * 2020) was shown to correct residual non-uniformities in CIELAB.
 */

const IDENTIFY = (hex: string, metric: DistanceMetric) =>
  identify(hex, { palette: pantone, metric });

describe('cross-metric divergence (pantone, saturated blue region)', () => {
  it('#0000ff: non-perceptual metrics pick 2736C; OKLAB picks 2728C', () => {
    // sRGB Euclidean + CIELAB Euclidean (ΔE76) + CIEDE2000 all agree on
    // 2736C here. OKLAB disagrees because its uniformity correction in the
    // blue region shifts which candidate is perceived as closer.
    expect(IDENTIFY('#0000ff', 'euclidean-srgb')).toBe('2736 C');
    expect(IDENTIFY('#0000ff', 'deltaE76')).toBe('2736 C');
    expect(IDENTIFY('#0000ff', 'deltaE2000')).toBe('2736 C');
    expect(IDENTIFY('#0000ff', 'deltaEok')).toBe('2728 C');
  });

  it('#1e90ff: perceptual metrics pick 279C; non-perceptual pick 2727C', () => {
    // The split here is the perceptual / non-perceptual divide: both ΔE2000
    // and OKLAB agree, both Euclidean-in-sRGB and ΔE76 agree — but the two
    // groups disagree with each other. Exactly the kind of disagreement
    // the `metric` option exists to let callers control.
    expect(IDENTIFY('#1e90ff', 'euclidean-srgb')).toBe('2727 C');
    expect(IDENTIFY('#1e90ff', 'deltaE76')).toBe('2727 C');
    expect(IDENTIFY('#1e90ff', 'deltaE2000')).toBe('279 C');
    expect(IDENTIFY('#1e90ff', 'deltaEok')).toBe('279 C');
  });

  it('#8a2be2 (blueviolet): ΔE76 diverges from the other three', () => {
    // ΔE76's known failure in saturated violet: picks 2592C while the
    // newer metrics agree on 266C. Documents that ΔE76 is not always
    // sufficient for dense palettes in this region.
    expect(IDENTIFY('#8a2be2', 'deltaE76')).toBe('2592 C');
    expect(IDENTIFY('#8a2be2', 'euclidean-srgb')).toBe('266 C');
    expect(IDENTIFY('#8a2be2', 'deltaE2000')).toBe('266 C');
    expect(IDENTIFY('#8a2be2', 'deltaEok')).toBe('266 C');
  });

  it('pure primaries on web palette: all metrics agree', () => {
    // Sanity: on a well-separated palette like web (148 entries),
    // the metric choice should NOT matter for obvious inputs.
    for (const metric of [
      'euclidean-srgb',
      'euclidean-linear',
      'deltaE76',
      'deltaE94',
      'deltaE2000',
      'deltaEok',
    ] as const) {
      expect(identify('#ff0000', { palette: web, metric })).toBe('red');
      expect(identify('#00ff00', { palette: web, metric })).toBe('lime');
      expect(identify('#0000ff', { palette: web, metric })).toBe('blue');
    }
  });
});
