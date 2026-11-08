import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { munsell } from '../src/palettes/munsell.js';
import { resolve } from '../src/resolve.js';

type Vector = readonly [number, number, number];
type Matrix = readonly [Vector, Vector, Vector];

const BRADFORD: Matrix = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
];
const BRADFORD_INVERSE: Matrix = [
  [0.9869929, -0.1470543, 0.1599627],
  [0.4323053, 0.5183603, 0.0492912],
  [-0.0085287, 0.0400428, 0.9684867],
];

function multiply(matrix: Matrix, vector: Vector): Vector {
  return matrix.map(
    (row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2],
  ) as unknown as Vector;
}

function whitePoint(x: number, y: number): Vector {
  return [x / y, 1, (1 - x - y) / y];
}

const C_LMS = multiply(BRADFORD, whitePoint(0.31006, 0.31616));
const D65_LMS = multiply(BRADFORD, whitePoint(0.3127, 0.329));

function adaptCToD65(xyz: Vector): Vector {
  const lms = multiply(BRADFORD, xyz);
  return multiply(BRADFORD_INVERSE, [
    (lms[0] * D65_LMS[0]) / C_LMS[0],
    (lms[1] * D65_LMS[1]) / C_LMS[1],
    (lms[2] * D65_LMS[2]) / C_LMS[2],
  ]);
}

function encodeSrgb(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function xyYToSrgbHex(x: number, y: number, luminance: number) {
  const Y = luminance / 100;
  const [X, adaptedY, Z] = adaptCToD65([(x * Y) / y, Y, ((1 - x - y) * Y) / y]);
  const encoded = [
    encodeSrgb(3.2404542 * X - 1.5371385 * adaptedY - 0.4985314 * Z),
    encodeSrgb(-0.969266 * X + 1.8760108 * adaptedY + 0.041556 * Z),
    encodeSrgb(0.0556434 * X - 0.2040259 * adaptedY + 1.0572252 * Z),
  ];
  const clamped = encoded.some((channel) => channel < 0 || channel > 1);
  const hex = encoded
    .map((channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('');
  return { clamped, hex: `#${hex}` };
}

const source = readFileSync(new URL('./fixtures/munsell-real.dat', import.meta.url), 'utf8');
const rows = source
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.trim().split(/\s+/) as [string, string, string, string, string, string]);

describe('Munsell RIT renotation data', () => {
  it('converts every real.dat row from Illuminant C xyY to the shipped sRGB value', () => {
    let clampedCount = 0;
    const colors: Readonly<Record<string, string>> = munsell.colors;
    expect(rows).toHaveLength(2734);
    expect(Object.keys(colors)).toHaveLength(rows.length);

    for (const [hue, value, chroma, x, y, Y] of rows) {
      const name = `${hue} ${value}/${chroma}`;
      const converted = xyYToSrgbHex(Number(x), Number(y), Number(Y));
      if (converted.clamped) clampedCount += 1;
      expect(colors[name]).toBe(converted.hex);
    }

    expect(clampedCount).toBeGreaterThan(0);
  });

  it('resolves notation without regard to case or spacing', () => {
    expect(resolve('  5r4 / 14 ', { palette: munsell })).toBe('#be1a34');
    expect(munsell.normalize('5R 4/14')).toBe('5R4/14');
  });
});
