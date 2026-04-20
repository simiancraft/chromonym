// Conversions block for the "convert" act of the demo. Shares the canonical
// CRT-styled LiveSnippet so every code block in the demo reads the same.
// Instead of a generic JSON dump, we render the exact chromonym call the
// user would copy-paste: `convert(hex, { format })` for each output format.

import { LiveSnippet } from './LiveSnippet.js';

interface ConversionsScopeProps {
  conversions: Record<string, unknown>;
  tintHex: string;
  input: string;
}

const ROW_ORDER: readonly string[] = ['HEX', 'RGB', 'RGBA', 'HSL', 'HSV'];

export function ConversionsScope({ conversions, tintHex, input }: ConversionsScopeProps) {
  const lines = [`import { convert } from 'chromonym';`, ``];
  for (const fmt of ROW_ORDER) {
    const v = conversions[fmt];
    const vStr = typeof v === 'string' ? `'${v}'` : JSON.stringify(v);
    lines.push(`convert('${input}', { format: '${fmt}' })`.padEnd(44) + `// → ${vStr}`);
  }

  // Copy text strips the `// → …` trailing comments so the clipboard lands
  // five clean runnable `convert(...)` calls.
  const copyLines = [`import { convert } from 'chromonym';`, ``];
  for (const fmt of ROW_ORDER) {
    copyLines.push(`convert('${input}', { format: '${fmt}' });`);
  }

  return (
    <LiveSnippet
      label="signal · convert"
      tintHex={tintHex}
      displayText={lines.join('\n')}
      copyText={copyLines.join('\n')}
      ariaLabel="live chromonym convert calls for every format"
    />
  );
}
