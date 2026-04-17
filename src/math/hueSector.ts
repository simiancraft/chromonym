/**
 * Map the normalized hue (hp in [0, 6)) plus chroma (c) and intermediate (x)
 * values to the primary-color tuple [r', g', b'] expected by the standard
 * HSL-to-RGB and HSV-to-RGB formulas (each component in [0, c]).
 *
 * Shared by hsl.ts and hsv.ts — same six-sector table, different computation
 * of c, x, m. Caller adds the m offset and scales by 255.
 */
export function hueSectorToPrime(hp: number, c: number, x: number): [number, number, number] {
  if (hp < 1) return [c, x, 0];
  if (hp < 2) return [x, c, 0];
  if (hp < 3) return [0, c, x];
  if (hp < 4) return [0, x, c];
  if (hp < 5) return [x, 0, c];
  return [c, 0, x];
}
