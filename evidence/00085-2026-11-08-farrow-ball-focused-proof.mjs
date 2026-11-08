import { farrowBall as subpathPalette } from 'chromonym/farrow-ball';
import { farrowBall as rootPalette, identify, resolve } from 'chromonym';

const sourceUrl =
  'https://raw.githubusercontent.com/jpederson/colornerd/5a46ba515d61169e49adc81dddb1bcd88da9d60a/json/farrow-ball.json';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`source fetch failed: ${response.status}`);
const upstream = await response.json();
const upstreamColors = Object.fromEntries(
  upstream.map(({ name, hex }) => [name, hex.trim().toLowerCase()]),
);
const localEntries = Object.entries(subpathPalette.colors);
const mismatches = localEntries.filter(
  ([name, hex]) => upstreamColors[name] !== hex.toLowerCase(),
);
const missing = upstream.filter(({ name }) => !(name in subpathPalette.colors)).map(({ name }) => name);
const extra = localEntries.filter(([name]) => !(name in upstreamColors)).map(([name]) => name);

const result = {
  captureCommit: 'e67d15c3853cba32b6e184a48b7b58e371b2d162',
  sourceCommit: '5a46ba515d61169e49adc81dddb1bcd88da9d60a',
  rootAndSubpathSame: rootPalette === subpathPalette,
  localCount: localEntries.length,
  upstreamCount: upstream.length,
  mismatches,
  missing,
  extra,
  defaultMetric: subpathPalette.defaultMetric,
  resolvedElephantsBreath: resolve('elephants-breath', { palette: subpathPalette }),
  identifiedDeadSalmon: identify('#b49d8d', { palette: subpathPalette }),
  resolvedBorrowedLight: resolve('Borrowed Light', { palette: subpathPalette }),
};

console.log(JSON.stringify(result, null, 2));

if (
  !result.rootAndSubpathSame ||
  result.localCount !== 132 ||
  result.upstreamCount !== 132 ||
  mismatches.length !== 0 ||
  missing.length !== 0 ||
  extra.length !== 0 ||
  result.defaultMetric !== 'deltaE2000' ||
  result.resolvedElephantsBreath !== '#ccbfb3' ||
  result.identifiedDeadSalmon !== 'Dead Salmon' ||
  result.resolvedBorrowedLight !== '#d5dbdb'
) {
  process.exit(1);
}
