import { describe, it } from 'bun:test';
import fc from 'fast-check';
import { rgbToRgba } from '../src/conversions/rgb.js';

// Property-based smoke test for the rgb() string parser. Asserts the
// parser either returns or throws an Error — never crashes, hangs, or
// throws a non-Error value — across 1000 arbitrary string inputs per
// run. Also satisfies OpenSSF Scorecard's Fuzzing check, which credits
// the presence of a fast-check property assertion.
describe('rgbToRgba fuzz', () => {
  it('only throws Error instances on arbitrary string input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        try {
          rgbToRgba(input);
        } catch (e) {
          if (!(e instanceof Error)) throw e;
        }
      }),
      { numRuns: 1000 },
    );
  });
});
