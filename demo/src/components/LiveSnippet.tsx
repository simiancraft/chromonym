// Canonical code block — CRT oscilloscope aesthetic. Green phosphor text
// on a dark screen, a tint glow driven by the current input color, a
// copy button in the channel header. Every chromonym API call the demo
// makes is rendered through this component so the visual language is
// consistent from identify → resolve → convert.

import { useState } from 'react';

interface LiveSnippetProps {
  displayText: string;
  copyText: string;
  /** Short uppercase label in the bezel header, e.g. "signal · identify". */
  label: string;
  /** Hex to drive the tint glow + indicator dot. Falls back to phosphor green. */
  tintHex?: string;
  ariaLabel?: string;
}

export function LiveSnippet({
  displayText,
  copyText,
  label,
  tintHex = '#3dff8c',
  ariaLabel,
}: LiveSnippetProps) {
  return (
    <section
      className="relative overflow-hidden scanlines crt-vignette"
      style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--bh-ink)' }}
      aria-label={ariaLabel ?? label}
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
            {label}
          </h3>
        </div>
        <CopyButton text={copyText} />
      </header>

      <div className="relative px-5 md:px-6 py-4 md:py-5" style={{ zIndex: 3 }}>
        <pre
          className="font-mono text-xs md:text-sm leading-relaxed overflow-x-auto whitespace-pre"
          style={{
            color: 'var(--crt-g)',
            textShadow: `0 0 4px ${tintHex}, 0 0 2px var(--crt-g)`,
          }}
        >
          <code>{displayText}</code>
        </pre>
      </div>
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        // Insecure contexts + permission-denied both reject; swallow the
        // rejection so it doesn't surface as an unhandled promise. The
        // UI not flashing "copied" is already the visible failure mode.
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {
            /* clipboard denied — silently no-op */
          });
      }}
      aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
      className="relative font-mono text-[10px] tracking-[0.25em] uppercase px-3 py-1 border border-neutral-700 hover:border-[var(--crt-g)] transition-colors"
      style={{ color: 'var(--crt-g)', zIndex: 3 }}
    >
      {copied ? 'copied' : 'copy'}
    </button>
  );
}
