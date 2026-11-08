export interface TccaNbsRow {
  card: 'standard' | 'army';
  name: string;
  cable: string;
  Y: number;
  x: number;
  y: number;
}

export type Xyz = readonly [x: number, y: number, z: number];
export type LinearSrgb = readonly [r: number, g: number, b: number];

const FIXTURE_HEADER = 'card\tname\tcable\tY\tx\ty';
const BRADFORD = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
] as const;
const BRADFORD_INVERSE = [
  [0.9869929, -0.1470543, 0.1599627],
  [0.4323053, 0.5183603, 0.0492912],
  [-0.0085287, 0.0400428, 0.9684867],
] as const;
const ILLUMINANT_C = xyToXyz(0.31006, 0.31616);
const D65 = xyToXyz(0.3127, 0.329);

/** Parse Table 5 from NBS Research Paper RP1700. */
export function parseTccaNbsFixture(tsv: string): TccaNbsRow[] {
  const [header, ...lines] = tsv.trimEnd().split('\n');
  if (header !== FIXTURE_HEADER) {
    throw new Error(`Unexpected TCCA NBS fixture header: ${header}`);
  }

  return lines.map((line, index) => {
    const fields = line.split('\t');
    if (fields.length !== 6) {
      throw new Error(`Expected 6 fields on TCCA NBS fixture line ${index + 2}`);
    }

    const [card, name, cable, yText, xText, littleYText] = fields as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const [Y, x, y] = [Number(yText), Number(xText), Number(littleYText)];
    if (
      (card !== 'standard' && card !== 'army') ||
      !name ||
      !/^\d{5}$/.test(cable) ||
      ![Y, x, y].every(Number.isFinite)
    ) {
      throw new Error(`Invalid TCCA NBS fixture line ${index + 2}`);
    }

    return { card, name, cable, Y, x, y };
  });
}

function multiplyMatrixVector(
  matrix: readonly (readonly [number, number, number])[],
  [x, y, z]: Xyz,
): Xyz {
  return matrix.map((row) => row[0] * x + row[1] * y + row[2] * z) as unknown as Xyz;
}

function xyToXyz(x: number, y: number): Xyz {
  return [x / y, 1, (1 - x - y) / y];
}

/** CIE 1931 xyY, with Y on a [0, 1] scale, to XYZ. */
export function xyYToXyz(x: number, y: number, Y: number): Xyz {
  return [(x * Y) / y, Y, ((1 - x - y) * Y) / y];
}

/** Bradford chromatic adaptation from Illuminant C to D65. */
export function adaptIlluminantCToD65(xyz: Xyz): Xyz {
  const sourceCone = multiplyMatrixVector(BRADFORD, ILLUMINANT_C);
  const destinationCone = multiplyMatrixVector(BRADFORD, D65);
  const cone = multiplyMatrixVector(BRADFORD, xyz);
  const adaptedCone: Xyz = [
    cone[0] * (destinationCone[0] / sourceCone[0]),
    cone[1] * (destinationCone[1] / sourceCone[1]),
    cone[2] * (destinationCone[2] / sourceCone[2]),
  ];
  return multiplyMatrixVector(BRADFORD_INVERSE, adaptedCone);
}

/** D65 XYZ to linear sRGB using the IEC 61966-2-1 matrix. */
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

export function xyYIlluminantCToSrgbHex(Y: number, x: number, y: number): string {
  return linearSrgbToHex(xyzToLinearSrgb(adaptIlluminantCToD65(xyYToXyz(x, y, Y))));
}
