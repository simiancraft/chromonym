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

// 2×4 grid layout. Two rows of four cells in a 1200×340 viewBox — each cell
// is 300 wide, still wide enough that the longest labels (~24 chars at 14px
// mono) fit. Rows at cy=85 and cy=240; labels sit just below the shape.
const COLS = 4;
const CELL_W = 1200 / COLS; // 300
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
      <circle cx={cx} cy={cy} r={54} fill={fill} style={style} />
    ),
  },
  {
    name: 'adeptus red',
    node: ({ cx, cy, fill, style }) => (
      <rect x={cx - 44} y={cy - 44} width={88} height={88} fill={fill} style={style} />
    ),
  },
  {
    name: 'sons of malice white',
    node: ({ cx, cy, fill, style }) => (
      <polygon
        points={`${cx},${cy - 58} ${cx + 52},${cy + 44} ${cx - 52},${cy + 44}`}
        fill={fill}
        stroke="var(--bh-ink)"
        strokeWidth={1.5}
        style={style}
      />
    ),
  },
  {
    name: 'ultramarines blue',
    node: ({ cx, cy, fill, style }) => (
      // Diamond (square rotated 45°) — fills a chroma gap in the palette
      // that nothing else occupies.
      <polygon
        points={`${cx},${cy - 56} ${cx + 46},${cy} ${cx},${cy + 56} ${cx - 46},${cy}`}
        fill={fill}
        style={style}
      />
    ),
  },
  {
    name: 'the flawless host purple',
    node: ({ cx, cy, fill, style }) => (
      <rect x={cx - 26} y={cy - 58} width={52} height={116} fill={fill} style={style} />
    ),
  },
  {
    name: 'nurgle green',
    node: ({ cx, cy, fill, style }) => (
      <path
        d={`M ${cx - 58} ${cy + 40} A 58 58 0 0 1 ${cx + 58} ${cy + 40} Z`}
        fill={fill}
        style={style}
      />
    ),
  },
  {
    name: 'alpha legion teal',
    node: ({ cx, cy, fill, style }) => (
      <polygon
        points={`${cx - 28},${cy - 52} ${cx + 52},${cy - 52} ${cx + 28},${cy + 52} ${cx - 52},${cy + 52}`}
        fill={fill}
        style={style}
      />
    ),
  },
  {
    name: 'imperial fists yellow',
    node: ({ cx, cy, fill, style }) => (
      // Regular hexagon (pointy-top). Vertices at 60° increments — first at
      // top, then clockwise. Gives the palette a yellow that the other
      // seven shapes don't offer.
      <polygon
        points={`${cx},${cy - 54} ${cx + 47},${cy - 27} ${cx + 47},${cy + 27} ${cx},${cy + 54} ${cx - 47},${cy + 27} ${cx - 47},${cy - 27}`}
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
          // `role="group"` (not "img") because this SVG's children are
          // interactive — each shape is a keyboard-reachable button that
          // commits its faction to the shared demo input. With role="img"
          // AT would announce it as a single static graphic.
          role="group"
          aria-label="warhammer palette — press Tab to a shape, Enter to select"
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
            // tabIndex + role=button + Enter/Space handler make the same
            // cell keyboard-reachable — Tab lands focus on each shape,
            // Enter commits. Focus outline drawn via index.css.
            const commit = () => setInput(fill);
            return (
              <g
                key={shape.name}
                className="kandinsky-shape"
                role="button"
                tabIndex={0}
                aria-label={`${shape.name} · ${fill}`}
                onClick={commit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    commit();
                  }
                }}
                style={{ cursor: 'pointer' }}
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
            works. Identify, resolve, convert accept it without registration
            or plugin, at runtime.
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
// palette literal so pasting it into a file yields runnable code. The
// displayed version carries the teaching comments that used to be
// right-column prose — each non-trivial line is annotated so a reader
// learns the Palette shape by reading the code, not body copy.
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
    `// Any object matching Palette<Name> is a BYO palette — no registration,`,
    `// no plugin. identify / resolve / convert all accept this shape at runtime.`,
    `const warhammer = {`,
    `  name: 'warhammer40k',`,
    `  colors: {`,
    ...Object.entries(colors).map(([n, h]) => `    '${n}': '${h}',`),
    `  },`,
    `  // normalize maps user input ("World Eaters Red!") to the canonical key.`,
    `  normalize: (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''),`,
    `  // defaultMetric: used by identify() when the caller doesn't override.`,
    `  defaultMetric: 'deltaE2000',`,
    `} as const satisfies Palette;`,
    ``,
    `// Strict name → hex lookup via the palette's own normalize function.`,
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
