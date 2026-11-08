export interface Fs595cGsaRow {
  chip: string;
  colorGroup: string;
  glossLevel: string;
  l: number;
  a: number;
  b: number;
}

export type Xyz = readonly [x: number, y: number, z: number];
export type LinearSrgb = readonly [r: number, g: number, b: number];

const FIXTURE_HEADER = 'chip\tcolor_group\tgloss_level\td65_l\td65_a\td65_b';
const LAB_DELTA = 6 / 29;

/**
 * Parse the normalized columns from GSA's 2008 FED-STD-595C "CIE only"
 * sheet. This US Government publication is public domain.
 *
 * Archived source: https://web.archive.org/web/20170515085542/https://www.gsa.gov/portal/getMediaData?mediaId=213223
 */
export function parseFs595cGsaFixture(tsv: string): Fs595cGsaRow[] {
  const [header, ...lines] = tsv.trimEnd().split('\n');
  if (header !== FIXTURE_HEADER) {
    throw new Error(`Unexpected FS595C GSA fixture header: ${header}`);
  }

  return lines.map((line, index) => {
    const fields = line.split('\t');
    if (fields.length !== 6) {
      throw new Error(`Expected 6 fields on FS595C GSA fixture line ${index + 2}`);
    }

    const [chip, colorGroup, glossLevel, lText, aText, bText] = fields as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const [l, a, b] = [Number(lText), Number(aText), Number(bText)];
    if (!/^\d{5}$/.test(chip) || !colorGroup || !glossLevel || ![l, a, b].every(Number.isFinite)) {
      throw new Error(`Invalid FS595C GSA fixture line ${index + 2}`);
    }

    return { chip, colorGroup, glossLevel, l, a, b };
  });
}

function inverseLabF(value: number): number {
  return value > LAB_DELTA ? value ** 3 : 3 * LAB_DELTA ** 2 * (value - 4 / 29);
}

/** CIELAB under the CIE 1964 10 degree D65 white point to XYZ, scaled to [0, 1]. */
export function lab10ToXyz(l: number, a: number, b: number): Xyz {
  const fy = (l + 16) / 116;
  return [
    (94.811 * inverseLabF(fy + a / 500)) / 100,
    (100 * inverseLabF(fy)) / 100,
    (107.304 * inverseLabF(fy - b / 200)) / 100,
  ];
}

/** XYZ to linear sRGB using the IEC 61966-2-1 matrix. */
export function xyzToLinearSrgb([x, y, z]: Xyz): LinearSrgb {
  return [
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.204 * y + 1.057 * z,
  ];
}

/** Apply the IEC 61966-2-1 sRGB transfer function to one linear channel. */
export function linearToSrgb(linear: number): number {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
}

/** Clamp linear sRGB to its gamut, transfer, and round to lowercase 8-bit hex. */
export function linearSrgbToHex(linear: LinearSrgb): string {
  const channels = linear.map((channel) => {
    const clamped = Math.max(0, Math.min(1, channel));
    return Math.round(linearToSrgb(clamped) * 255)
      .toString(16)
      .padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

export function lab10ToSrgbHex(l: number, a: number, b: number): string {
  return linearSrgbToHex(xyzToLinearSrgb(lab10ToXyz(l, a, b)));
}
