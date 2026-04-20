// Bring-your-own palette visualized as two rows of three Kandinsky-inflected
// shapes — one per Warhammer faction. Each shape is clickable: clicking
// commits that faction's hex to the shared demo input. When the user scrubs
// the BYO picker, whichever faction is the nearest match pulses with a
// random-direction offset + 10% scale + phosphor glow, so the page animates
// along with the identify result.
//
// Below the row: input picker + nearest readout on the left 2/3, a short
// explanation of BYO on the right 1/3. The canonical LiveSnippet with its
// per-faction invocation follows.

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { type WarhammerName } from '../data/warhammer.js';
import { LiveSnippet } from './LiveSnippet.js';

interface KandinskyBYOProps {
  input: string;
  setInput: (hex: string) => void;
  matchedName: WarhammerName | null;
  matchedHex: string | null;
  colors: Readonly<Record<WarhammerName, string>>;
  invocations?: Readonly<Record<WarhammerName, string>>;
}

// 2×3 grid layout. Two rows of three cells in a 1200×340 viewBox gives each
// cell enough horizontal room that labels (which can be up to ~24 chars)
// don't bleed into neighbours. Row 1 cy=85, row 2 cy=250; labels just
// under each shape center.
const COLS = 3;
const CELL_W = 1200 / COLS; // 400
const VB_W = 1200;
const VB_H = 340;
const ROW_CYS = [85, 240] as const;
const LABEL_DY = 80; // shape-center to label baseline

type ShapeNode = (args: {
  cx: number;
  cy: number;
  fill: string;
  style: React.CSSProperties;
}) => ReactNode;

// Each faction gets its own shape constructor. All shapes are parameterized
// by (cx, cy) so swapping the shape function doesn't require moving
// anything else.
const SHAPES: Array<{ name: WarhammerName; node: ShapeNode }> = [
  {
    name: 'world eaters red',
    node: ({ cx, cy, fill, style }) => (
      <circle cx={cx} cy={cy} r={58} fill={fill} style={style} />
    ),
  },
  {
    name: 'adeptus red',
    node: ({ cx, cy, fill, style }) => (
      <rect x={cx - 48} y={cy - 48} width={96} height={96} fill={fill} style={style} />
    ),
  },
  {
    name: 'sons of malice white',
    node: ({ cx, cy, fill, style }) => (
      <polygon
        points={`${cx},${cy - 62} ${cx + 56},${cy + 48} ${cx - 56},${cy + 48}`}
        fill={fill}
        stroke="var(--bh-ink)"
        strokeWidth={1.5}
        style={style}
      />
    ),
  },
  {
    name: 'the flawless host purple',
    node: ({ cx, cy, fill, style }) => (
      <rect x={cx - 28} y={cy - 62} width={56} height={124} fill={fill} style={style} />
    ),
  },
  {
    name: 'nurgle green',
    node: ({ cx, cy, fill, style }) => (
      <path
        d={`M ${cx - 62} ${cy + 44} A 62 62 0 0 1 ${cx + 62} ${cy + 44} Z`}
        fill={fill}
        style={style}
      />
    ),
  },
  {
    name: 'alpha legion teal',
    node: ({ cx, cy, fill, style }) => (
      <polygon
        points={`${cx - 30},${cy - 56} ${cx + 56},${cy - 56} ${cx + 30},${cy + 56} ${cx - 56},${cy + 56}`}
        fill={fill}
        style={style}
      />
    ),
  },
];

export function KandinskyBYO({
  input,
  setInput,
  matchedName,
  matchedHex,
  colors,
  invocations,
}: KandinskyBYOProps) {
  // Random per-selection offset. Fires on every matchedName change so
  // scrubbing across faction regions keeps the pulse feeling alive; same
  // faction twice still re-randomizes. Angle clamped to the upper half
  // (π to 2π radians) so the shape only drifts up, left, or right — never
  // down into the label beneath it. Distance 8–18px.
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    if (!matchedName) return;
    const angle = Math.PI + Math.random() * Math.PI;
    const d = 8 + Math.random() * 10;
    setOffset({ x: Math.cos(angle) * d, y: Math.sin(angle) * d });
  }, [matchedName]);

  const styleFor = useMemo(
    () =>
      (name: WarhammerName, fill: string): React.CSSProperties => {
        const pulse = matchedName === name;
        return {
          transition:
            'transform 420ms cubic-bezier(0.22,1,0.36,1), filter 420ms ease',
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transform: pulse
            ? `translate(${offset.x}px, ${offset.y}px) scale(1.1)`
            : 'translate(0, 0) scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
          pointerEvents: 'none',
        };
      },
    [matchedName, offset.x, offset.y],
  );

  return (
    <div style={{ backgroundColor: 'var(--bh-paper)' }}>
      {/* ─── Shape grid (2 rows × 3 cols) ─── */}
      <div className="px-4 md:px-6 pt-5 pb-2">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label="Kandinsky composition of warhammer palette entries"
          className="w-full h-auto"
        >
          {/* faint cell guides for compositional rhythm */}
          <g opacity={0.08} stroke="var(--bh-ink)" strokeWidth={1}>
            {Array.from({ length: COLS - 1 }).map((_, i) => (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: deterministic
                key={`v${i}`}
                x1={(i + 1) * CELL_W}
                y1={8}
                x2={(i + 1) * CELL_W}
                y2={VB_H - 8}
              />
            ))}
            <line
              x1={8}
              y1={(ROW_CYS[0] + ROW_CYS[1]) / 2}
              x2={VB_W - 8}
              y2={(ROW_CYS[0] + ROW_CYS[1]) / 2}
            />
          </g>

          {SHAPES.map((shape, idx) => {
            const col = idx % COLS;
            const row = Math.floor(idx / COLS);
            const cx = col * CELL_W + CELL_W / 2;
            const cy = ROW_CYS[row]!;
            const fill = colors[shape.name];
            const pulse = matchedName === shape.name;
            // onClick on the group so a click anywhere in the cell (hit
            // rect, shape, or label area above it) commits the faction.
            return (
              <g
                key={shape.name}
                onClick={() => setInput(fill)}
                style={{ cursor: 'pointer' }}
                aria-label={`select ${shape.name}`}
              >
                {/* full-cell hit rect covers gaps around the shape */}
                <rect
                  x={col * CELL_W}
                  y={cy - CELL_W / 3}
                  width={CELL_W}
                  height={CELL_W / 1.8}
                  fill="transparent"
                />
                {shape.node({ cx, cy, fill, style: styleFor(shape.name, fill) })}
                <text
                  x={cx}
                  y={cy + LABEL_DY}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={14}
                  letterSpacing={2}
                  fill="var(--bh-ink)"
                  opacity={pulse ? 1 : 0.6}
                  style={{ pointerEvents: 'none' }}
                >
                  {shape.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ─── Input + Nearest (left 2/3)  ·  BYO explainer (right 1/3) ─── */}
      <div
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5 md:gap-6 px-5 md:px-6 pt-4 pb-5"
        style={{
          borderTop: '1px solid var(--bh-ink)',
          backgroundColor: 'var(--bh-cream)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <label className="block">
            <div className="bh-eyebrow mb-2">input</div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-16 h-10 cursor-pointer appearance-none"
                style={{ border: '1px solid var(--bh-ink)', padding: 0 }}
                aria-label="BYO color picker"
              />
              <code className="font-mono text-xs">{input}</code>
            </div>
          </label>

          <div>
            <div className="bh-eyebrow mb-2">nearest</div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 shrink-0"
                style={{
                  backgroundColor: matchedHex ?? 'transparent',
                  border: '1px solid var(--bh-ink)',
                }}
              />
              <div className="min-w-0">
                <div className="font-mono text-xs lowercase truncate">
                  {matchedName ?? '—'}
                </div>
                <div className="font-mono text-[10px] opacity-60 truncate">
                  {matchedHex ?? ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="text-xs leading-snug md:border-l md:pl-5"
          style={{ borderColor: 'var(--bh-ink)' }}
        >
          <div className="bh-eyebrow mb-2">bring your own</div>
          <p className="opacity-80">
            Any object matching <code className="font-mono text-[11px]">Palette&lt;Name&gt;</code>{' '}
            works — no registration, no plugin. The Warhammer set above is a
            literal defined in the demo source; swap it for your brand colors,
            a Material token map, or a JSON you paste at runtime and every
            verb on the page (identify, resolve, convert) accepts it unchanged.
          </p>
        </div>
      </div>

      {/* ─── LiveSnippet ─── */}
      <div style={{ borderTop: '1px solid var(--bh-ink)' }}>
        <LiveSnippet
          label="signal · resolve · BYO"
          tintHex={matchedHex ?? undefined}
          displayText={buildDisplaySnippet(matchedName, matchedHex, colors, invocations)}
          copyText={buildCopySnippet(matchedName, colors)}
          ariaLabel="live chromonym resolve call for the BYO palette"
        />
      </div>
    </div>
  );
}

// The BYO snippet is self-contained: it includes the inline `warhammer`
// palette literal so pasting it into a file yields runnable code.
function buildDisplaySnippet(
  matchedName: string | null,
  matchedHex: string | null,
  colors: Readonly<Record<string, string>>,
  invocations: Readonly<Record<string, string>> | undefined,
): string {
  const invocation = matchedName ? invocations?.[matchedName] : undefined;
  const lines: string[] = [
    `import { resolve, type Palette } from 'chromonym';`,
    ``,
    `const warhammer = {`,
    `  name: 'warhammer40k',`,
    `  colors: {`,
    ...Object.entries(colors).map(([n, h]) => `    '${n}': '${h}',`),
    `  },`,
    `  normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),`,
    `  defaultMetric: 'deltaE2000',`,
    `} as const satisfies Palette;`,
    ``,
    `resolve(${matchedName ? `'${matchedName}'` : '/* …pending match… */'}, {`,
    `  palette: warhammer,`,
    `})`,
    `// → ${matchedHex ? `'${matchedHex}'` : 'null'}`,
  ];
  if (invocation) lines.push(`// ${invocation}`);
  return lines.join('\n');
}

function buildCopySnippet(
  matchedName: string | null,
  colors: Readonly<Record<string, string>>,
): string {
  const lines: string[] = [
    `import { resolve, type Palette } from 'chromonym';`,
    ``,
    `const warhammer = {`,
    `  name: 'warhammer40k',`,
    `  colors: {`,
    ...Object.entries(colors).map(([n, h]) => `    '${n}': '${h}',`),
    `  },`,
    `  normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),`,
    `  defaultMetric: 'deltaE2000',`,
    `} as const satisfies Palette;`,
    ``,
    `resolve('${matchedName ?? 'world eaters red'}', { palette: warhammer });`,
  ];
  return lines.join('\n');
}
