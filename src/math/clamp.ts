/**
 * Clamp n to [lo, hi]. Caller must ensure n is a finite number.
 */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Require a finite number at an API boundary; throws otherwise.
 * Used by converter entry points to reject NaN, Infinity, and non-numeric
 * values before they propagate through color math.
 */
export function requireFinite(n: unknown, label: string): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new Error(`Expected finite number for ${label}, got ${typeof n}: ${String(n)}`);
  }
  return n;
}
