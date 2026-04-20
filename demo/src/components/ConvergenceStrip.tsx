// Convergence strip — the signature visualization. Three R/G/B bars whose
// horizontal offset literally encodes the current match's ΔE distance.
// Perfect match → bars converge, multiply to near-black, readout reads TUNED.
// Poor fit → bars spread apart into separable red/green/blue beams.
//
// Each metric has its own "reference worst" distance so the spread reads
// consistently whether you're in deltaE2000 (typical 0–10) or euclidean-sRGB
// (0–441). MAX_OFFSET caps the maximum visual spread.

import type { DistanceMetric } from 'chromonym';

const METRIC_WORST: Record<DistanceMetric, number> = {
  'euclidean-srgb': 80,
  'euclidean-linear': 80,
  deltaE76: 15,
  deltaE94: 12,
  deltaE2000: 10,
  deltaEok: 0.12,
};

const MAX_OFFSET_PX = 34;

interface ConvergenceStripProps {
  distance: number | null;
  metric: DistanceMetric;
}

export function ConvergenceStrip({ distance, metric }: ConvergenceStripProps) {
  const normalized = distance == null ? 0 : Math.min(distance / METRIC_WORST[metric], 1);
  const offset = normalized * MAX_OFFSET_PX;
  const tuned = distance != null && distance < 0.001;

  return (
    <div className="relative w-full">
      <div className="flex items-stretch gap-4">
        <div className="flex items-center">
          <span className="bh-eyebrow">convergence</span>
        </div>

        <div
          className="flex-1 relative h-12 overflow-hidden"
          style={{ backgroundColor: 'var(--bh-cream)' }}
          role="img"
          aria-label={
            distance == null
              ? 'no match — bars undefined'
              : `delta-E ${distance.toFixed(2)}; convergence offset ${offset.toFixed(1)} pixels`
          }
        >
          {/* R bar — pushed left as distance grows */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: '14px',
              height: '4px',
              backgroundColor: 'var(--crt-r)',
              transform: `translateX(${-offset}px)`,
              transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1)',
              mixBlendMode: 'multiply',
            }}
          />
          {/* G bar — holds the center */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: '21px',
              height: '4px',
              backgroundColor: 'var(--crt-g)',
              transform: `translateX(${offset * 0.2}px)`,
              transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1)',
              mixBlendMode: 'multiply',
            }}
          />
          {/* B bar — pushed right as distance grows */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: '28px',
              height: '4px',
              backgroundColor: 'var(--crt-b)',
              transform: `translateX(${offset}px)`,
              transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1)',
              mixBlendMode: 'multiply',
            }}
          />

          {/* tick marks at 0 / half / full spread, for scale reference */}
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[var(--bh-ink)] opacity-40" />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="absolute bottom-0 w-[1px] bg-[var(--bh-ink)] opacity-40"
              style={{ left: `${t * 100}%`, height: t === 0.5 ? '8px' : '4px' }}
            />
          ))}
        </div>

        <div className="flex items-center min-w-[96px] justify-end">
          <span
            className="bh-eyebrow"
            style={{ color: tuned ? 'var(--bh-blue)' : 'var(--bh-ink)' }}
          >
            {distance == null ? '—' : tuned ? 'tuned' : `ΔE ${distance.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
