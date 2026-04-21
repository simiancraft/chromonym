// Convert act content. An inline color picker + swatch feed the same
// shared `input` state every other demo uses, so tweaking the color at
// the bottom of the page updates everything upstream (identify hero,
// Kandinsky pulse, fuzzy resolver). The canonical LiveSnippet renders
// five `convert(hex, { format })` calls alongside.

import { buildConvertSnippet } from '../lib/snippets.js';
import { LiveSnippet } from './LiveSnippet.js';

interface ConversionsScopeProps {
  conversions: Readonly<Record<string, unknown>>;
  tintHex: string;
  input: string;
  setInput: (hex: string) => void;
}

const ROW_ORDER = ['HEX', 'RGB', 'RGBA', 'HSL', 'HSV'] as const;

export function ConversionsScope({ conversions, tintHex, input, setInput }: ConversionsScopeProps) {
  return (
    <div style={{ backgroundColor: 'var(--bh-paper)' }}>
      <div
        className="p-4 md:p-5"
        style={{ borderBottom: '1px solid var(--bh-ink)' }}
      >
        <div className="bh-eyebrow mb-2">every format</div>
        <p className="text-xs leading-snug opacity-80 max-w-2xl">
          Hex, RGB, RGBA, HSL, HSV through one{' '}
          <code className="font-mono text-[11px]">convert</code> call;
          completes the color toolbelt next to identify and resolve.
        </p>
      </div>

      {/* Tiny inline picker so the reader can drive convert's `input`
          from here too; this is the only demo that doesn't have its
          own dedicated input surface above the code. */}
      <div
        className="flex items-center gap-4 flex-wrap p-4 md:p-5"
        style={{
          backgroundColor: 'var(--bh-cream)',
          borderBottom: '1px solid var(--bh-ink)',
        }}
      >
        <label className="flex items-center gap-3">
          <span className="bh-eyebrow">input</span>
          <input
            type="color"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-14 h-9 cursor-pointer appearance-none"
            style={{ border: '1px solid var(--bh-ink)', padding: 0 }}
            aria-label="convert input color picker"
          />
        </label>
        <div
          className="w-8 h-8"
          style={{ backgroundColor: input, border: '1px solid var(--bh-ink)' }}
          aria-hidden
        />
        <code className="font-mono text-xs">{input}</code>
      </div>

      <LiveSnippet
        label="signal · convert"
        tintHex={tintHex}
        {...buildConvertSnippet({ input, conversions, rowOrder: ROW_ORDER })}
        ariaLabel="live chromonym convert calls for every format"
      />
    </div>
  );
}
