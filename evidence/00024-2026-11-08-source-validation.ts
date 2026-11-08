import { japanese } from '../src/palettes/japanese.ts';

const captureCommit = Bun.spawnSync(['git', 'rev-parse', 'HEAD']).stdout.toString().trim();
const url =
  'https://en.wikipedia.org/w/api.php?action=parse&oldid=1372240562&prop=text&format=json&formatversion=2';
const response = await fetch(url);
if (!response.ok) throw new Error(`source fetch failed: ${response.status}`);
const payload = (await response.json()) as { parse: { revid: number; text: string } };

const all: Array<[string, string]> = [];
for (const table of payload.parse.text.matchAll(
  /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
)) {
  const cells = [...table[1].matchAll(/<td(?: [^>]*)?>([\s\S]*?)<\/td>/g)].map(
    (match) => match[1],
  );
  for (let index = 0; index + 4 < cells.length; index += 5) {
    const hex = cells[index + 4].match(/#[0-9A-Fa-f]{6}/)?.[0]?.toLowerCase();
    if (!hex) continue;
    const names = [...cells[index + 1].matchAll(/<i lang="ja-Latn">([^<]+)<\/i>/g)].map(
      (match) => match[1].replaceAll('&#39;', "'"),
    );
    for (const name of names) all.push([name, hex]);
  }
}

const start = all.findIndex(([name]) => name === 'Ikkonzome');
const end = all.findIndex(([name]) => name === 'Aijiro');
if (start < 0 || end < start) throw new Error('Japanese color table bounds not found');
const sourceEntries = all.slice(start, end + 1);
const firstOccurrences = new Map<string, string>();
const sourceGroups = new Map<string, string[]>();
for (const [name, hex] of sourceEntries) {
  if (!firstOccurrences.has(name)) firstOccurrences.set(name, hex);
  sourceGroups.set(name, [...(sourceGroups.get(name) ?? []), hex]);
}

const local = new Map(Object.entries(japanese.colors));
const missing = [...firstOccurrences].filter(([name]) => !local.has(name));
const extra = [...local].filter(([name]) => !firstOccurrences.has(name));
const wrong = [...firstOccurrences].filter(
  ([name, hex]) => local.has(name) && local.get(name) !== hex,
);
const duplicateSourceNames = [...sourceGroups].filter(([, values]) => values.length > 1);

const normalizedGroups = new Map<string, string[]>();
for (const name of local.keys()) {
  const normalized = japanese.normalize(name);
  normalizedGroups.set(normalized, [...(normalizedGroups.get(normalized) ?? []), name]);
}
const normalizedCollisions = [...normalizedGroups].filter(([, names]) => names.length > 1);

const result = {
  captureCommit,
  sourceRevision: payload.parse.revid,
  sourceNameRows: sourceEntries.length,
  sourceFirstOccurrenceKeys: firstOccurrences.size,
  localKeys: local.size,
  missing,
  extra,
  wrong,
  duplicateSourceNames,
  normalizedKeys: normalizedGroups.size,
  normalizedCollisions,
  hanaba: local.get('Hanaba-iro'),
  kayou: local.get('kayou-iro'),
};
console.log(JSON.stringify(result, null, 2));

if (
  payload.parse.revid !== 1372240562 ||
  firstOccurrences.size !== 227 ||
  local.size !== 227 ||
  missing.length > 0 ||
  extra.length > 0 ||
  wrong.length > 0 ||
  normalizedCollisions.length > 0 ||
  local.get('Hanaba-iro') !== '#ffb94e' ||
  local.get('kayou-iro') !== '#ffb94e'
) {
  process.exit(1);
}
