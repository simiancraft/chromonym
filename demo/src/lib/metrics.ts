// Canonical metric list + human-readable labels. Shared across the three
// identify sub-demos so they don't drift (they used to — one read "fastest",
// another read "— fastest", another had no suffix at all).

import type { DistanceMetric } from 'chromonym';

export const METRICS: readonly DistanceMetric[] = [
  'euclidean-srgb',
  'euclidean-linear',
  'deltaE76',
  'deltaE94',
  'deltaE2000',
  'deltaEok',
];

export const METRIC_LABELS: Record<DistanceMetric, string> = {
  'euclidean-srgb': 'Euclidean · sRGB (fastest)',
  'euclidean-linear': 'Euclidean · linear RGB',
  deltaE76: 'ΔE*76 · CIELAB',
  deltaE94: 'ΔE*94 · CIE 1994',
  deltaE2000: 'ΔE*00 · CIEDE2000',
  deltaEok: 'ΔE OKLAB · modern',
};

// Concise one-line explanation of each metric — shown below the selector in
// the identify panel so the reader understands the tradeoff without having
// to leave the demo to read the README. Keep each ~2 lines max.
export const METRIC_DESCRIPTIONS: Record<DistanceMetric, string> = {
  'euclidean-srgb':
    'Raw sRGB channel distance. Fastest and not perceptually uniform — two colors 20 units apart can look closer or farther than two colors 10 apart.',
  'euclidean-linear':
    'Euclidean distance on linearized RGB. Same speed class as sRGB; slightly better for physical-light / mixing contexts.',
  deltaE76:
    'CIELAB Euclidean (CIE 1976). First perceptual metric — simple, but underweights chroma, so saturated colors read as farther apart than they look (Mahy 1994 pegs JND nearer ΔE ≈ 2.3).',
  deltaE94:
    'CIE 1994 refinement of ΔE76 with chroma/hue weighting. Fixes "saturated colors feel too far apart" without the full CIEDE2000 math.',
  deltaE2000:
    'CIEDE2000 (Luo/Cui/Rigg 2001). Industry standard for print and design. Separate formulation from ΔE94, fit to combined visual datasets, with L/C/h weighting and a hue-rotation term near h′≈275°.',
  deltaEok:
    'Euclidean on OKLAB (Ottosson 2020). Designed for perceptual uniformity against IPT / CAM16-UCS — often a better nearest-match than ΔE2000 in saturated regions, and cheaper to compute.',
};
