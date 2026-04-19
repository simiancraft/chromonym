/**
 * Levenshtein edit distance between two strings. Classic dynamic-programming
 * implementation; returns the minimum number of single-character insertions,
 * deletions, or substitutions required to transform `a` into `b`.
 *
 * Used by `resolve(_, { k })` for fuzzy-name matching — operating on the
 * palette's already-normalized keys (lowercase, alphanumeric) so typos,
 * casing, and punctuation all reduce to the same canonical forms before
 * the edit distance is measured.
 *
 * Space-optimized: uses two rolling rows instead of a full n×m matrix
 * (O(min(n,m)) space, O(n·m) time). For palette keys (< 20 chars each)
 * this runs sub-microsecond per pair, so a full scan over 907 Pantone
 * entries fits well inside a millisecond.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure `a` is the shorter string so the rolling row is minimal.
  if (a.length > b.length) [a, b] = [b, a];

  const aLen = a.length;
  const bLen = b.length;

  // `prev[i]` = edit distance between a[0..i] and b[0..j-1] (previous row).
  // `curr[i]` = edit distance between a[0..i] and b[0..j]   (current row).
  let prev = new Array<number>(aLen + 1);
  let curr = new Array<number>(aLen + 1);
  for (let i = 0; i <= aLen; i++) prev[i] = i;

  for (let j = 1; j <= bLen; j++) {
    curr[0] = j;
    const bj = b.charCodeAt(j - 1);
    for (let i = 1; i <= aLen; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
      const deletion = (prev[i] ?? 0) + 1;
      const insertion = (curr[i - 1] ?? 0) + 1;
      const substitution = (prev[i - 1] ?? 0) + cost;
      curr[i] = Math.min(deletion, insertion, substitution);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[aLen] ?? 0;
}
