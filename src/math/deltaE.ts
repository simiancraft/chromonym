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

/**
 * ΔE*94 (CIE 1994). Weights the chroma and hue contributions relative to
 * Lab Euclidean distance — fixes the "saturated colors feel too far apart"
 * problem of ΔE*76. Uses graphic-arts constants (kL=1, K1=0.045, K2=0.015).
 *
 * Not symmetric in the strict sense (reference vs sample), but we treat
 * both inputs as graphic-arts samples — the formula reduces to a
 * symmetric form below.
 */
export function deltaE94(p: Lab, q: Lab): number {
  const [l1, a1, b1] = p;
  const [l2, a2, b2] = q;
  const dL = l1 - l2;
  const c1 = Math.hypot(a1, b1);
  const c2 = Math.hypot(a2, b2);
  const dC = c1 - c2;
  const da = a1 - a2;
  const db = b1 - b2;
  const dH2 = da * da + db * db - dC * dC;
  // dH² can go slightly negative due to floating-point — clamp.
  const dH2Safe = dH2 < 0 ? 0 : dH2;

  const K1 = 0.045;
  const K2 = 0.015;
  const sL = 1;
  const sC = 1 + K1 * c1;
  const sH = 1 + K2 * c1;

  const termL = dL / sL;
  const termC = dC / sC;
  const termH = Math.sqrt(dH2Safe) / sH;

  return Math.sqrt(termL * termL + termC * termC + termH * termH);
}
