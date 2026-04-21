// Live SVG rendering of the chromonym wordmark with three RGB ghost layers
// that shift apart as the user manipulates the demo's input color.
//
// Each R / G / B channel (0–255) linearly scales the x-offset of its own
// ghost layer — pure black converges everything to the black key at dead
// center; brighter / chromatic inputs push the ghosts outward, making the
// wordmark read as a live "R G B convergence" driven by whatever color is
// currently selected in the demo.

import { useMemo } from 'react';

interface WordmarkProps {
  hex: string;
  /** mix-blend-mode applied to each R/G/B ghost layer. Defaults to
   *  `difference` — the masthead can pipe any CSS blend mode through
   *  via the eyebrow-select easter egg. */
  ghostBlendMode?: React.CSSProperties['mixBlendMode'];
  /** 0–1 opacity for the three ghost layers. Defaults to 1. The masthead's
   *  thin slider drives this at runtime. */
  ghostOpacity?: number;
  className?: string;
}

// Max pixel offset in each direction. The scales per channel differ so the
// three layers go in different directions — R to the right, G to the left,
// B a smaller step right — which makes the "spread" read as three distinct
// halos at the wordmark's edges instead of three layers moving in lockstep.
const OFFSET_MAX = 14;
const SCALE_R = 1.0;
const SCALE_G = -1.0;
const SCALE_B = 0.6;

function parseHex(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  const h = m[1];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

const channelToOffset = (v: number, scale: number) => (v / 255) * OFFSET_MAX * scale;

export function Wordmark({
  hex,
  ghostBlendMode = 'difference',
  ghostOpacity = 1,
  className = '',
}: WordmarkProps) {
  const { r, g, b } = useMemo(() => parseHex(hex), [hex]);
  const dR = channelToOffset(r, SCALE_R);
  const dG = channelToOffset(g, SCALE_G);
  const dB = channelToOffset(b, SCALE_B);

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
            .wm-ghost {
              transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
            }
          `}
        </style>
      </defs>

      {/*
        Three ghost layers tinted with the CRT R / G / B phosphor colors.
        Each sits in its own blend-mode: difference pass so it inverts
        against whatever pixels are already under it — creating sharp
        complementary fringes instead of the softer multiply darken.
        The black key plate stays in normal blending to anchor the
        wordmark's silhouette.
      */}
      <text
        x={650}
        y={168}
        textAnchor="middle"
        className="wm-text wm-ghost"
        fill="var(--crt-r)"
        style={{
          transform: `translateX(${dR}px)`,
          mixBlendMode: ghostBlendMode,
          opacity: ghostOpacity,
        }}
      >
        chromonym
      </text>
      <text
        x={650}
        y={168}
        textAnchor="middle"
        className="wm-text wm-ghost"
        fill="var(--crt-g)"
        style={{
          transform: `translateX(${dG}px)`,
          mixBlendMode: ghostBlendMode,
          opacity: ghostOpacity,
        }}
      >
        chromonym
      </text>
      <text
        x={650}
        y={168}
        textAnchor="middle"
        className="wm-text wm-ghost"
        fill="var(--crt-b)"
        style={{
          transform: `translateX(${dB}px)`,
          mixBlendMode: ghostBlendMode,
          opacity: ghostOpacity,
        }}
      >
        chromonym
      </text>

      {/* Black key plate on top — anchors the silhouette. */}
      <text x={650} y={168} textAnchor="middle" className="wm-text" fill="var(--bh-ink)">
        chromonym
      </text>
    </svg>
  );
}
