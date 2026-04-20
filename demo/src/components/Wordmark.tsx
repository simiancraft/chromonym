// Live SVG rendering of the chromonym wordmark with CMYK print-misregistration
// ghosts. The channel-offset magnitude is bound to the current distance metric:
// crude metrics (euclidean-sRGB) read as a badly-tuned CRT / poorly-registered
// press; perceptual metrics (ΔE2000, OKLAB) converge to near-zero offset. The
// metric dropdown thus has a visible, viscerally tangible effect on the title
// itself — "accuracy = tuning."

import type { DistanceMetric } from 'chromonym';

const OFFSET_PX: Record<DistanceMetric, number> = {
  'euclidean-srgb': 9,
  'euclidean-linear': 7,
  deltaE76: 5,
  deltaE94: 3.5,
  deltaE2000: 1.6,
  deltaEok: 0.8,
};

interface WordmarkProps {
  metric: DistanceMetric;
  className?: string;
}

export function Wordmark({ metric, className = '' }: WordmarkProps) {
  const d = OFFSET_PX[metric];

  return (
    <svg
      viewBox="0 0 1300 220"
      role="img"
      aria-label="chromonym"
      className={`w-full h-auto ${className}`}
    >
      <defs>
        <style>
          {`
            .wm-text {
              font-family: 'Bauhaus Modern', 'Unbounded', sans-serif;
              font-weight: 400;
              font-size: 148px;
              letter-spacing: -3px;
            }
          `}
        </style>
      </defs>

      {/*
        Stacked ghosts. In CMYK press misregistration, three plates fail to
        align — producing cyan/magenta/yellow fringes at the edges of the
        black key plate. We paint each channel separately with an offset,
        then lay the black plate on top. Because the ghosts extend past the
        black silhouette only at the offset margins, you only see them as
        edge halos, not as muddy overlaps.
      */}
      <g style={{ mixBlendMode: 'multiply' }}>
        <text
          x={650 - d * 0.8}
          y={168 + d * 0.4}
          textAnchor="middle"
          className="wm-text"
          fill="var(--cmy-y)"
          style={{ transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }}
        >
          chromonym
        </text>
        <text
          x={650 + d}
          y={168 + d * 0.1}
          textAnchor="middle"
          className="wm-text"
          fill="var(--cmy-m)"
          style={{ transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }}
        >
          chromonym
        </text>
        <text
          x={650 + d * 0.3}
          y={168 - d * 0.5}
          textAnchor="middle"
          className="wm-text"
          fill="var(--cmy-c)"
          style={{ transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }}
        >
          chromonym
        </text>
      </g>
      <text
        x={650}
        y={168}
        textAnchor="middle"
        className="wm-text"
        fill="var(--bh-ink)"
      >
        chromonym
      </text>
    </svg>
  );
}
