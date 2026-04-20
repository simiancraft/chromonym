// Conversions block for the "convert" act. Thin wrapper around the shared
// LiveSnippet + the `buildConvertSnippet` builder — the CRT chrome and
// copy-button logic are the same contract every other snippet uses.

import { buildConvertSnippet } from '../lib/snippets.js';
import { LiveSnippet } from './LiveSnippet.js';

interface ConversionsScopeProps {
  conversions: Readonly<Record<string, unknown>>;
  tintHex: string;
  input: string;
}

const ROW_ORDER = ['HEX', 'RGB', 'RGBA', 'HSL', 'HSV'] as const;

export function ConversionsScope({ conversions, tintHex, input }: ConversionsScopeProps) {
  return (
    <LiveSnippet
      label="signal · convert"
      tintHex={tintHex}
      {...buildConvertSnippet({ input, conversions, rowOrder: ROW_ORDER })}
      ariaLabel="live chromonym convert calls for every format"
    />
  );
}
