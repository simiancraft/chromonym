// Bring-your-own palette visualized as a full-width row of six Kandinsky-
// inflected shapes — one per Warhammer faction. Each shape is clickable:
// clicking commits that faction's hex to the shared demo input. When the
// user scrubs the BYO picker, whichever faction is the nearest match pulses
// with a random-direction offset + 10% scale + phosphor glow, so the page
// animates along with the identify result.
//
// Below the row: input picker on the left, nearest readout on the right,
// then the canonical LiveSnippet with the same per-faction invocation as
// before.

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

// Layout grid — six equal-width cells in a wide viewBox. Each shape sits at
// its cell center; the label sits beneath. Cells are 200 wide → viewBox
// width 1200, labels at y=210, shape center at y=108.
const CELL_W = 200;
const CY = 108;
const LABEL_Y = 200;
const VB_W = 1200;
const VB_H = 240;

type ShapeNode = (args: {
  cx: number;
  fill: string;
  style: React.CSSProperties;
}) => ReactNode;

// Each faction gets its own shape constructor. The shape constructor takes
// a cell center x, a fill, and a style (for pulse transform + glow). All
// shapes center around (cx, CY) so swapping the shape function doesn't
// require moving anything else.
const SHAPES: Array<{ name: WarhammerName; node: ShapeNode }> = [
  {
    name: 'world eaters red',
    node: ({ cx, fill, style }) => (
      <circle cx={cx} cy={CY} r={58} fill={fill} style={style} />
    ),
  },
  {
    name: 'adeptus red',
    node: ({ cx, fill, style }) => (
      <rect x={cx - 48} y={CY - 48} width={96} height={96} fill={fill} style={style} />
    ),
  },
  {
    name: 'sons of malice white',
    node: ({ cx, fill, style }) => (
      <polygon
        points={`${cx},${CY - 64} ${cx + 58},${CY + 48} ${cx - 58},${CY + 48}`}
        fill={fill}
        stroke="var(--bh-ink)"
        strokeWidth={1.5}
        style={style}
      />
    ),
  },
  {
    name: 'the flawless host purple',
    node: ({ cx, fill, style }) => (
      <rect x={cx - 28} y={CY - 64} width={56} height={128} fill={fill} style={style} />
    ),
  },
  {
    name: 'nurgle green',
    node: ({ cx, fill, style }) => (
      <path
        d={`M ${cx - 62} ${CY + 44} A 62 62 0 0 1 ${cx + 62} ${CY + 44} Z`}
        fill={fill}
        style={style}
      />
    ),
  },
  {
    name: 'alpha legion teal',
    node: ({ cx, fill, style }) => (
      <polygon
        points={`${cx - 30},${CY - 56} ${cx + 56},${CY - 56} ${cx + 30},${CY + 56} ${cx - 56},${CY + 56}`}
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
  // faction twice still re-randomizes. Distance 8–18px in a random
  // direction around the shape's center.
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    if (!matchedName) return;
    const angle = Math.random() * Math.PI * 2;
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
          cursor: 'pointer',
        };
      },
    [matchedName, offset.x, offset.y],
  );

  return (
    <div style={{ backgroundColor: 'var(--bh-paper)' }}>
      {/* ─── Full-width shape row ─── */}
      <div className="px-4 md:px-6 pt-5 pb-2">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label="Kandinsky composition of warhammer palette entries"
          className="w-full h-auto"
        >
          {/* faint cell guides for compositional rhythm */}
          <g opacity={0.08} stroke="var(--bh-ink)" strokeWidth={1}>
            {SHAPES.map((_, i) => (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: deterministic
                key={i}
                x1={(i + 1) * CELL_W}
                y1={8}
                x2={(i + 1) * CELL_W}
                y2={VB_H - 8}
              />
            ))}
          </g>

          {SHAPES.map((shape, idx) => {
            const cx = idx * CELL_W + CELL_W / 2;
            const fill = colors[shape.name];
            const pulse = matchedName === shape.name;
            return (
              <g key={shape.name}>
                {/* invisible full-cell hit rect so clicking near the shape
                    (or on its label) still registers */}
                <rect
                  x={idx * CELL_W}
                  y={0}
                  width={CELL_W}
                  height={VB_H}
                  fill="transparent"
                  onClick={() => setInput(fill)}
                  style={{ cursor: 'pointer' }}
                  aria-label={`select ${shape.name}`}
                />
                {shape.node({ cx, fill, style: styleFor(shape.name, fill) })}
                <text
                  x={cx}
                  y={LABEL_Y}
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

      {/* ─── Input (left) · Nearest (right) ─── */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-5 md:px-6 pt-4 pb-5"
        style={{
          borderTop: '1px solid var(--bh-ink)',
          backgroundColor: 'var(--bh-cream)',
        }}
      >
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
