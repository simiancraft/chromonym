// Bring-your-own palette, visualized as a Kandinsky-style composition. The
// six Warhammer 40k colors render as overlapping abstract shapes — not as a
// rounded-rectangle swatch row. The currently-matched cutout pulses with a
// phosphor glow, so as the user scrubs the main input, the composition
// breathes in sync with the identify() result.
//
// This is the demo's "resolve" act: the pulsing shape's fill is pulled by
// `resolve(matchedName, { palette: warhammer })` — a name-to-hex lookup on
// a user-supplied palette object. The canonical code block below shows the
// exact resolve call the live render is using.

import type { ReactNode } from 'react';
import type { WarhammerName } from '../data/warhammer.js';
import { LiveSnippet } from './LiveSnippet.js';

// The composition is specific to the six Warhammer factions — the SVG shape
// list is hand-tuned to their names. Typing `matchedName` / `colors` /
// `invocations` to `WarhammerName` means a typo anywhere in the dispatch
// chain fails the compile rather than silently falling through to black.
interface KandinskyBYOProps {
  input: string;
  /** Writes back to the shared demo input — the BYO picker is a second
   *  interface to the same `input` state that the hero + eyedropper drive. */
  setInput: (hex: string) => void;
  matchedName: WarhammerName | null;
  matchedHex: string | null;
  colors: Readonly<Record<WarhammerName, string>>;
  /** Per-palette-entry flavor lines rendered in the displayed (not copied)
   *  snippet. Makes the code block feel alive: different match → different
   *  invocation. Stays out of the copy payload. */
  invocations?: Readonly<Record<WarhammerName, string>>;
}

const SHAPES: Array<{
  name: WarhammerName;
  node: (fill: string, pulse: boolean) => ReactNode;
  label: { x: number; y: number; align: 'start' | 'middle' | 'end' };
}> = [
  {
    // 'world eaters red' — big red disc, top-left anchor
    name: 'world eaters red',
    node: (fill, pulse) => (
      <circle
        cx={115}
        cy={130}
        r={86}
        fill={fill}
        style={{
          transition: 'transform 500ms ease, filter 500ms ease',
          transformOrigin: '115px 130px',
          transform: pulse ? 'scale(1.04)' : 'scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
        }}
      />
    ),
    label: { x: 115, y: 245, align: 'middle' },
  },
  {
    // 'adeptus red' — small hard square sitting atop the disc
    name: 'adeptus red',
    node: (fill, pulse) => (
      <rect
        x={160}
        y={52}
        width={78}
        height={78}
        fill={fill}
        style={{
          transition: 'transform 500ms ease, filter 500ms ease',
          transformOrigin: '199px 91px',
          transform: pulse ? 'rotate(4deg) scale(1.04)' : 'rotate(0deg) scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
        }}
      />
    ),
    label: { x: 199, y: 44, align: 'middle' },
  },
  {
    // 'sons of malice white' — off-white triangle, mid-upper
    name: 'sons of malice white',
    node: (fill, pulse) => (
      <polygon
        points="340,40 420,190 260,190"
        fill={fill}
        stroke="var(--bh-ink)"
        strokeWidth={1.5}
        style={{
          transition: 'transform 500ms ease, filter 500ms ease',
          transformOrigin: '340px 115px',
          transform: pulse ? 'scale(1.04)' : 'scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
        }}
      />
    ),
    label: { x: 340, y: 210, align: 'middle' },
  },
  {
    // 'the flawless host purple' — tall rectangle, right-of-center
    name: 'the flawless host purple',
    node: (fill, pulse) => (
      <rect
        x={460}
        y={60}
        width={52}
        height={170}
        fill={fill}
        style={{
          transition: 'transform 500ms ease, filter 500ms ease',
          transformOrigin: '486px 145px',
          transform: pulse ? 'scale(1.04, 1.06)' : 'scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
        }}
      />
    ),
    label: { x: 486, y: 250, align: 'middle' },
  },
  {
    // 'nurgle green' — arc (semi-circle open top), right side
    name: 'nurgle green',
    node: (fill, pulse) => (
      <path
        d="M 560 220 A 80 80 0 0 1 720 220 Z"
        fill={fill}
        style={{
          transition: 'transform 500ms ease, filter 500ms ease',
          transformOrigin: '640px 220px',
          transform: pulse ? 'scale(1.05)' : 'scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
        }}
      />
    ),
    label: { x: 640, y: 245, align: 'middle' },
  },
  {
    // 'alpha legion teal' — diagonal slash bar crossing the composition
    name: 'alpha legion teal',
    node: (fill, pulse) => (
      <polygon
        points="570,30 660,30 620,130 530,130"
        fill={fill}
        style={{
          transition: 'transform 500ms ease, filter 500ms ease',
          transformOrigin: '595px 80px',
          transform: pulse ? 'scale(1.04)' : 'scale(1)',
          filter: pulse ? `drop-shadow(0 0 22px ${fill})` : 'none',
        }}
      />
    ),
    label: { x: 595, y: 20, align: 'middle' },
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
  // No inline section wrapper or header here — the parent <DemoPanel />
  // provides the bordered card + Bauhaus "act 02 · resolve · bring your
  // own" chrome. This component is content only.
  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-0 divide-x divide-[var(--bh-ink)]">
        <div className="relative p-6">
          <svg
            viewBox="0 0 760 300"
            role="img"
            aria-label="Kandinsky composition of warhammer palette entries"
            className="w-full h-auto"
          >
            {/* grid ticks */}
            <g opacity={0.15} stroke="var(--bh-ink)" strokeWidth={0.6}>
              {Array.from({ length: 11 }).map((_, i) => (
                <line
                  // biome-ignore lint/suspicious/noArrayIndexKey: deterministic
                  key={`v${i}`}
                  x1={i * 76}
                  y1={0}
                  x2={i * 76}
                  y2={300}
                />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <line
                  // biome-ignore lint/suspicious/noArrayIndexKey: deterministic
                  key={`h${i}`}
                  x1={0}
                  y1={i * 75}
                  x2={760}
                  y2={i * 75}
                />
              ))}
            </g>

            {/* shapes — ordered back-to-front for overlap semantics */}
            {SHAPES.map(({ name, node, label }) => {
              const fill = colors[name] ?? '#000';
              const pulse = matchedName === name;
              return (
                <g key={name}>
                  {node(fill, pulse)}
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.align}
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize={9.5}
                    letterSpacing={1.4}
                    fill="var(--bh-ink)"
                    opacity={pulse ? 1 : 0.55}
                  >
                    {name.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="p-6 flex flex-col gap-4" style={{ backgroundColor: 'var(--bh-cream)' }}>
          <label className="block">
            <div className="bh-eyebrow mb-2">scrub · your input</div>
            <input
              type="color"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-10 cursor-pointer appearance-none"
              style={{ border: '1px solid var(--bh-ink)', padding: 0 }}
              aria-label="BYO color picker"
            />
            <code className="font-mono text-xs block mt-1">{input}</code>
          </label>

          <div>
            <div className="bh-eyebrow mb-2">nearest warhammer</div>
            <div
              className="h-10"
              style={{
                backgroundColor: matchedHex ?? 'transparent',
                border: '1px solid var(--bh-ink)',
              }}
            />
            <code className="font-mono text-xs block mt-1">
              {matchedName ?? '—'} {matchedHex ? `· ${matchedHex}` : ''}
            </code>
          </div>

          <div className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-70 leading-relaxed mt-auto">
            scrub the picker — as the input crosses a faction's region, the
            matching shape pulses and the snippet below swaps its chant.
          </div>
        </aside>
      </div>

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
// palette literal so pasting it into a file yields runnable code. The copy
// payload strips the `// → …` result comment; the on-screen display keeps
// it so the reader sees the match live.
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
