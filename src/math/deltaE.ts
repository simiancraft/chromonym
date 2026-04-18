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

// ---- ΔE00 helpers --------------------------------------------------------

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function hueDeg(b: number, a: number): number {
  if (b === 0 && a === 0) return 0;
  return (Math.atan2(b, a) * RAD + 360) % 360;
}

/**
 * ΔE*00 (CIE 2000 / CIEDE2000). Current industry-standard perceptual
 * color-difference formula. Fixes the saturated-blue failure of ΔE76/94
 * with a rotation term in the blue-purple region (h ≈ 275°).
 *
 * kL / kC / kH are parametric factors (default 1/1/1 = graphic arts).
 * Reference: G. Sharma, W. Wu, E.N. Dalal, "The CIEDE2000 Color-Difference
 * Formula" (Color Research & Application, 2005).
 */
// Precomputed constant: 25^7 = 6,103,515,625. Appears twice in the formula.
const POW_25_7 = 6103515625;

// Inline pow(x, 7) — Math.pow with non-integer exponent is slower in V8
// than three multiplies. x² → x⁴ → x⁶·x.
function pow7(x: number): number {
  const x2 = x * x;
  const x4 = x2 * x2;
  return x4 * x2 * x;
}

export function deltaE2000(p: Lab, q: Lab, kL = 1, kC = 1, kH = 1): number {
  const l1 = p[0];
  const a1 = p[1];
  const b1 = p[2];
  const l2 = q[0];
  const a2 = q[1];
  const b2 = q[2];

  // Chromas and mean chroma. Lab values stay within ±150 so overflow
  // protection in Math.hypot is unnecessary — plain sqrt(a²+b²) is ~3×
  // faster in V8 and more than precise enough for our range.
  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const cBar = (c1 + c2) / 2;
  const cBar7 = pow7(cBar);

  // G-factor boost for a* in low-chroma regions.
  const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + POW_25_7)));
  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;

  // Primed chroma and hue.
  const c1p = Math.sqrt(a1p * a1p + b1 * b1);
  const c2p = Math.sqrt(a2p * a2p + b2 * b2);
  const h1p = hueDeg(b1, a1p);
  const h2p = hueDeg(b2, a2p);

  // Differences.
  const dLp = l2 - l1;
  const dCp = c2p - c1p;

  let dhp: number;
  if (c1p * c2p === 0) {
    dhp = 0;
  } else {
    const raw = h2p - h1p;
    if (Math.abs(raw) <= 180) dhp = raw;
    else if (raw > 180) dhp = raw - 360;
    else dhp = raw + 360;
  }
  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dhp * DEG) / 2);

  // Means.
  const lBarP = (l1 + l2) / 2;
  const cBarP = (c1p + c2p) / 2;

  let hBarP: number;
  if (c1p * c2p === 0) {
    hBarP = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hBarP = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hBarP = (h1p + h2p + 360) / 2;
  } else {
    hBarP = (h1p + h2p - 360) / 2;
  }

  // Weighting function T.
  const hBarRad = hBarP * DEG;
  const t =
    1 -
    0.17 * Math.cos(hBarRad - 30 * DEG) +
    0.24 * Math.cos(2 * hBarRad) +
    0.32 * Math.cos(3 * hBarRad + 6 * DEG) -
    0.2 * Math.cos(4 * hBarRad - 63 * DEG);

  // Lightness, chroma, hue weighting factors.
  const lBarMinus50Sq = (lBarP - 50) ** 2;
  const sL = 1 + (0.015 * lBarMinus50Sq) / Math.sqrt(20 + lBarMinus50Sq);
  const sC = 1 + 0.045 * cBarP;
  const sH = 1 + 0.015 * cBarP * t;

  // Rotation term — the blue-purple correction that ΔE94 lacks.
  const hShift = (hBarP - 275) / 25;
  const dTheta = 30 * Math.exp(-(hShift * hShift));
  const cBarP7 = pow7(cBarP);
  const rC = 2 * Math.sqrt(cBarP7 / (cBarP7 + POW_25_7));
  const rT = -Math.sin(2 * dTheta * DEG) * rC;

  const termL = dLp / (kL * sL);
  const termC = dCp / (kC * sC);
  const termH = dHp / (kH * sH);

  return Math.sqrt(termL * termL + termC * termC + termH * termH + rT * termC * termH);
}

/**
 * Squared Euclidean distance in OKLAB space (Björn Ottosson, 2020).
 * OKLAB is perceptually uniform by construction — plain Euclidean IS the
 * perceptual distance, no weighting needed. Returns the square for
 * argmin speed; `deltaEok` returns the actual distance.
 *
 * Often gives more visually-accurate nearest-matches than CIEDE2000 in
 * the saturated blue/purple region.
 */
export function deltaEokSquared(p: Lab, q: Lab): number {
  const dl = p[0] - q[0];
  const da = p[1] - q[1];
  const db = p[2] - q[2];
  return dl * dl + da * da + db * db;
}

export function deltaEok(p: Lab, q: Lab): number {
  return Math.sqrt(deltaEokSquared(p, q));
}
