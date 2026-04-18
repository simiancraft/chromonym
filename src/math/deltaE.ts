/**
 * CIE color-difference metrics. Inputs are `Lab` triples (L, a, b) as
 * produced by `rgbaToLab` from `colorSpace.ts`.
 *
 * All three metrics operate in CIELAB; the differences are in how each
 * region of Lab space is weighted:
 *   ΔE*76  — simple Euclidean in Lab (CIE 1976). Fast, decent.
 *   ΔE*94  — adds chroma/hue weighting (CIE 1994). Better saturation handling.
 *   ΔE00  — also adjusts L/C/h + rotation correction in blue-purple region
 *            (CIE 2000, aka CIEDE2000). Current industry standard.
 *
 * References:
 *   CIE 15:2004 (Colorimetry), CIE TC1-29 (ΔE2000).
 *   G. Sharma, W. Wu, E.N. Dalal, "The CIEDE2000 Color-Difference Formula"
 *   (Color Research & Application, 2005) — canonical test vectors.
 */

export type Lab = readonly [l: number, a: number, b: number];

/**
 * ΔE*ab (CIE 1976). Simple Euclidean distance in Lab.
 * Returns the *square* for speed — identify loops only need argmin, and
 * sqrt is monotonic. Use `deltaE76` if you need the actual distance.
 */
export function deltaE76Squared(p: Lab, q: Lab): number {
  const dl = p[0] - q[0];
  const da = p[1] - q[1];
  const db = p[2] - q[2];
  return dl * dl + da * da + db * db;
}

export function deltaE76(p: Lab, q: Lab): number {
  return Math.sqrt(deltaE76Squared(p, q));
}
