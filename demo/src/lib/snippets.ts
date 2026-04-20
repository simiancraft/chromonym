// Shared snippet builders for every LiveSnippet call site in the demo.
// Each builder returns a display + copy pair: the display form is what the
// reader sees (complete with the `// → …` result comment so scrubbing is
// self-documenting) and the copy form is what lands in the clipboard —
// strictly the runnable lines, no result comments, so paste-and-run works.

import type { DistanceMetric } from 'chromonym';
import type { PaletteKey } from '../components/PaletteGrid.js';

export interface SnippetPair {
  displayText: string;
  copyText: string;
}

interface IdentifyMatch {
  name: string;
  value: string;
  distance: number;
}

// ---- identify · hero (color → name on one palette) --------------------

export function buildIdentifySnippet(args: {
  input: string;
  paletteKey: PaletteKey;
  metric: DistanceMetric;
  matchedName: string | null;
}): SnippetPair {
  const { input, paletteKey, metric, matchedName } = args;
  const display = [
    `import { identify, ${paletteKey} } from 'chromonym';`,
    ``,
    `identify('${input}', {`,
    `  palette: ${paletteKey},`,
    `  metric:  '${metric}',`,
    `})`,
    `// → ${matchedName ? `'${matchedName}'` : 'null'}`,
  ];
  const copy = [
    `import { identify, ${paletteKey} } from 'chromonym';`,
    ``,
    `identify('${input}', { palette: ${paletteKey}, metric: '${metric}' });`,
  ];
  return { displayText: display.join('\n'), copyText: copy.join('\n') };
}

// ---- identify · translate (name → name across two palettes) -----------

export function buildTranslateSnippet(args: {
  srcPalette: PaletteKey;
  dstPalette: PaletteKey;
  srcSelected: string | null;
  metric: DistanceMetric;
  k: number;
  matches: ReadonlyArray<IdentifyMatch>;
}): SnippetPair {
  const { srcPalette, dstPalette, srcSelected, metric, k, matches } = args;
  const code = [
    `import { identify, ${srcPalette}, ${dstPalette} } from 'chromonym';`,
    ``,
    `identify(${srcSelected ? `'${srcSelected}'` : '/* pick a swatch */'}, {`,
    `  source:  ${srcPalette},`,
    `  palette: ${dstPalette},`,
    `  metric:  '${metric}',`,
    `  k:       ${k},`,
    `})`,
  ];
  const display = [...code];
  if (matches.length > 0) {
    const shown = Math.min(matches.length, 3);
    display.push('// → [');
    for (let i = 0; i < shown; i++) {
      const m = matches[i];
      display.push(
        `//     { name: '${m.name}', value: '${m.value}', distance: ${m.distance.toFixed(3)} },`,
      );
    }
    if (matches.length > shown) display.push('//     // …');
    display.push('// ]');
  }
  return { displayText: display.join('\n'), copyText: code.join('\n') };
}

// ---- identify · eyedropper (pixel → name) -----------------------------

export function buildEyedropperSnippet(args: {
  paletteKey: PaletteKey;
  pickedHex: string | null;
  metric: DistanceMetric;
  k: number;
  matches: ReadonlyArray<IdentifyMatch>;
}): SnippetPair {
  const { paletteKey, pickedHex, metric, k, matches } = args;
  const code = [
    `import { identify, ${paletteKey} } from 'chromonym';`,
    ``,
    `identify(${pickedHex ? `'${pickedHex}'` : '/* hover the canvas */'}, {`,
    `  palette: ${paletteKey},`,
    `  metric:  '${metric}',`,
    `  k:       ${k},`,
    `})`,
  ];
  const display = [...code];
  if (matches.length > 0) {
    const shown = Math.min(matches.length, 3);
    display.push('// → [');
    for (let i = 0; i < shown; i++) {
      const m = matches[i];
      display.push(
        `//     { name: '${m.name}', value: '${m.value}', distance: ${m.distance.toFixed(3)} },`,
      );
    }
    if (matches.length > shown) display.push('//     // …');
    display.push('// ]');
  }
  return { displayText: display.join('\n'), copyText: code.join('\n') };
}

// ---- convert · format ↔ format ----------------------------------------

export function buildConvertSnippet(args: {
  input: string;
  conversions: Readonly<Record<string, unknown>>;
  rowOrder: readonly string[];
}): SnippetPair {
  const { input, conversions, rowOrder } = args;
  const display = [`import { convert } from 'chromonym';`, ``];
  const copy = [`import { convert } from 'chromonym';`, ``];
  for (const fmt of rowOrder) {
    const v = conversions[fmt];
    const vStr = typeof v === 'string' ? `'${v}'` : JSON.stringify(v);
    display.push(`convert('${input}', { format: '${fmt}' })`.padEnd(44) + `// → ${vStr}`);
    copy.push(`convert('${input}', { format: '${fmt}' });`);
  }
  return { displayText: display.join('\n'), copyText: copy.join('\n') };
}
