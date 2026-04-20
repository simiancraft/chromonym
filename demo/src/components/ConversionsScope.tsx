// Conversions block, styled as a CRT oscilloscope. Dark phosphor background,
// green monospace text with a tint-glow driven by the current input color,
// scanline overlay, and a soft vignette at the edges. Functional output is
// identical — HEX / RGB / RGBA / HSL / HSV — just framed as an analog readout
// rather than a generic JSON dump.

interface ConversionsScopeProps {
  conversions: Record<string, unknown>;
  tintHex: string;
}

const ROW_ORDER = ['HEX', 'RGB', 'RGBA', 'HSL', 'HSV'];

export function ConversionsScope({ conversions, tintHex }: ConversionsScopeProps) {
  return (
    <section
      className="relative overflow-hidden scanlines crt-vignette"
      style={{
        backgroundColor: '#0a0a0a',
        border: '1px solid var(--bh-ink)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, ${tintHex}26 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />

      <header
        className="relative flex items-center justify-between px-5 py-3 border-b border-neutral-700"
        style={{ zIndex: 3 }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: tintHex,
              boxShadow: `0 0 10px ${tintHex}, 0 0 2px ${tintHex}`,
            }}
            aria-hidden
          />
          <h3
            className="font-mono text-[10px] tracking-[0.32em] uppercase"
            style={{ color: 'var(--crt-g)' }}
          >
            signal · conversions
          </h3>
        </div>
        <div
          className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-60"
          style={{ color: 'var(--crt-g)' }}
        >
          chan 7 · 60hz
        </div>
      </header>

      <div className="relative px-6 py-5" style={{ zIndex: 3 }}>
        <pre
          className="font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre"
          style={{
            color: 'var(--crt-g)',
            textShadow: `0 0 5px ${tintHex}, 0 0 2px var(--crt-g)`,
          }}
        >
{ROW_ORDER.map((k) => {
  const v = conversions[k];
  const vStr = typeof v === 'string' ? v : JSON.stringify(v);
  return `${k.padEnd(5)}  ${vStr}`;
}).join('\n')}
        </pre>
      </div>
    </section>
  );
}
