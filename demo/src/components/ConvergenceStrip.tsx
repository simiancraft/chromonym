// Channel strip — three R/G/B bars whose widths encode the channel values
// of the *currently-selected* input color. Meant to run as a full-width
// line-break between the above-fold identify demos and everything below;
// when the user scrubs the color picker or pins a pixel via the eyedropper,
// this strip animates in lockstep so the divider is visibly part of the demo.

const CHANNELS = [
  { key: 'r', label: 'R', color: 'var(--crt-r)' },
  { key: 'g', label: 'G', color: 'var(--crt-g)' },
  { key: 'b', label: 'B', color: 'var(--crt-b)' },
] as const;

interface ConvergenceStripProps {
  hex: string;
}

export function ConvergenceStrip({ hex }: ConvergenceStripProps) {
  const { r, g, b } = parseHex(hex);
  const vals = { r, g, b };

  return (
    <div
      className="relative w-full py-3 md:py-4"
      style={{
        borderTop: '1px solid var(--bh-ink)',
        borderBottom: '1px solid var(--bh-ink)',
      }}
      role="img"
      aria-label={`RGB channels for ${hex}: R ${r}, G ${g}, B ${b}`}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <span className="bh-eyebrow shrink-0">channels</span>

        <div className="flex-1 flex flex-col gap-[6px] min-w-0">
          {CHANNELS.map(({ key, label, color }) => {
            const v = vals[key];
            const pct = (v / 255) * 100;
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] tracking-[0.24em] uppercase w-3 text-center shrink-0"
                  style={{ color: 'var(--bh-ink)' }}
                >
                  {label}
                </span>
                <div
                  className="flex-1 h-[6px] relative"
                  style={{ backgroundColor: 'var(--bh-paper)' }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      mixBlendMode: 'multiply',
                      transition: 'width 450ms cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] tabular-nums w-8 text-right shrink-0">
                  {v}
                </span>
              </div>
            );
          })}
        </div>

        <span
          className="bh-eyebrow shrink-0 hidden sm:inline font-mono"
          style={{ color: 'var(--bh-ink)' }}
        >
          {hex.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

// Tolerates #rgb, #rrggbb, #rrggbbaa. Returns {0,0,0} on parse failure so
// the strip silently no-ops instead of throwing during a bad input moment.
function parseHex(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  const h = m[1];
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
