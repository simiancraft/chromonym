// resolve · cont. — typo-tolerant name lookup via `resolve(name, { palette, k })`.
// The `k` option switches resolve from strict (exact-match via the palette's
// normalizer) to fuzzy (top-k ranked by Levenshtein edit distance against the
// normalized keys). Perfect for "did you mean" UIs over a user-typed color
// name, which the demo makes tactile: type a misspelling, watch the ranked
// matches and their distances update live.
//
// Clicking a match writes its hex to the shared demo input, so the rest of
// the page (identify act, BYO, convert) reacts in lockstep.

import { type ColorValue, resolve } from 'chromonym';
import { useMemo, useState } from 'react';
import { buildResolveFuzzySnippet } from '../lib/snippets.js';
import { LiveSnippet } from './LiveSnippet.js';
import { PALETTE_KEYS, PALETTE_LABELS, PALETTES, type PaletteKey } from './PaletteGrid.js';

interface FuzzyResolverProps {
  setInput: (hex: string) => void;
}

const DEFAULT_QUERY = 'rebecapurple';

export function FuzzyResolver({ setInput }: FuzzyResolverProps) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('web');
  const [k, setK] = useState(3);

  const matches = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return [] as Array<{ name: string; value: ColorValue; distance: number }>;
    }
    return resolve(trimmed, { palette: PALETTES[paletteKey], k });
  }, [query, paletteKey, k]);

  return (
    <div
      className="p-5 md:p-6 space-y-5"
      style={{ backgroundColor: 'var(--bh-paper)' }}
    >
      <p className="text-sm max-w-2xl leading-snug">
        Type a name — even a typo. <code className="font-mono text-xs">resolve</code>{' '}
        with <code className="font-mono text-xs">k</code> flips to Levenshtein
        fuzzy matching against the palette's normalized keys. Higher k → more
        candidates ranked by edit distance. Perfect for "did you mean" inputs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_220px] gap-4 items-end">
        <label className="block">
          <div className="bh-eyebrow mb-2">query</div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="try 'crmson' or 'aliceblu'"
            className="w-full h-10 px-3 text-sm font-mono"
            style={{
              border: '1px solid var(--bh-ink)',
              backgroundColor: 'var(--bh-cream)',
            }}
            aria-label="fuzzy resolve query"
          />
        </label>
        <label className="block">
          <div className="bh-eyebrow mb-2">palette</div>
          <select
            value={paletteKey}
            onChange={(e) => setPaletteKey(e.target.value as PaletteKey)}
            className="w-full h-10 px-2 text-sm font-mono"
            style={{
              border: '1px solid var(--bh-ink)',
              backgroundColor: 'var(--bh-cream)',
            }}
          >
            {PALETTE_KEYS.map((key) => (
              <option key={key} value={key}>
                {PALETTE_LABELS[key]} ({Object.keys(PALETTES[key].colors).length})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="bh-eyebrow mb-2">k: {k} nearest</div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--bh-red)' }}
            aria-label={`top-k matches, currently ${k}`}
          />
        </label>
      </div>

      {/* Ranked matches — clicking one writes its hex to the shared demo input. */}
      {matches.length > 0 ? (
        <div>
          <div className="bh-eyebrow mb-2">ranked matches</div>
          <div className="flex flex-col gap-[3px]">
            {matches.map((m) => {
              const hexStr = typeof m.value === 'string' ? m.value : '';
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    if (hexStr) setInput(hexStr);
                  }}
                  className="flex items-center gap-3 text-left px-3 py-[6px] transition-colors hover:bg-[var(--bh-ink)] hover:text-[var(--bh-cream)]"
                  style={{ border: '1px solid var(--bh-ink)' }}
                >
                  <span
                    className="w-4 h-4 shrink-0"
                    style={{
                      backgroundColor: hexStr,
                      border: '1px solid var(--bh-ink)',
                    }}
                    aria-hidden
                  />
                  <span className="font-mono text-xs flex-1 truncate">{m.name}</span>
                  <span className="font-mono text-[10px] opacity-60">{hexStr}</span>
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-60 ml-2">
                    d = {m.distance}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="font-mono text-[10px] opacity-60 pt-2 italic">
            distance is Levenshtein edits against the palette's normalized keys.
            an exact match would be d = 0.
          </div>
        </div>
      ) : (
        <div className="bh-eyebrow opacity-60">type a query to begin</div>
      )}

      <LiveSnippet
        label="signal · resolve · fuzzy"
        tintHex={
          typeof matches[0]?.value === 'string' ? (matches[0]!.value as string) : undefined
        }
        {...buildResolveFuzzySnippet({ query, paletteKey, k, matches })}
        ariaLabel="live chromonym fuzzy resolve call"
      />
    </div>
  );
}
