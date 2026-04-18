/**
 * Map a normalized hue sector value (range [0, 6)) plus chroma and its
 * secondary into the primary-color tuple `[r', g', b']` used by the
 * standard HSL→RGB and HSV→RGB algorithms. Each component is in [0, chroma].
 *
 * Shared by `hslToRgba` and `hsvToRgba`: same six-sector table, different
 * formulas for chroma and the offset. The caller adds the offset and
 * scales by 255.
 *
 *   hueSector = h / 60 (h wrapped to [0, 360))
 *   chroma    = HSL: (1 − |2l − 1|)·s ; HSV: v·s
 *   secondary = chroma · (1 − |hueSector mod 2 − 1|)
 */
export function hueSectorToPrime(
  hueSector: number,
  chroma: number,
  secondary: number,
): [number, number, number] {
  if (hueSector < 1) return [chroma, secondary, 0];
  if (hueSector < 2) return [secondary, chroma, 0];
  if (hueSector < 3) return [0, chroma, secondary];
  if (hueSector < 4) return [0, secondary, chroma];
  if (hueSector < 5) return [secondary, 0, chroma];
  return [chroma, 0, secondary];
}
