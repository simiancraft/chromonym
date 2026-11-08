import { identify, prismacolor, resolve } from './dist/index.js';
import { prismacolor as subpathPrismacolor } from './dist/palettes/prismacolor.js';

const captureCommit = 'd51f09a74a79056ffafc36f5080b72aeb84df79b';
const sourceUrl =
  'https://cyanindesign.blogspot.com/2022/08/150-prismacolor-premier-colored-pencils.html';

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`source fetch failed: ${response.status}`);
const html = await response.text();
const sourceRows = [
  ...html.matchAll(
    /<button class="color-box"[^>]+value="(#[0-9A-F]{6})">\s*<span class="color-name">([^<]+) (\d+)<\/span>/g,
  ),
].map((match) => ({ code: `PC${match[3]}`, name: match[2], hex: match[1].toLowerCase() }));

const implementation = await Bun.file('src/palettes/prismacolor.ts').text();
const implementationRows = [
  ...implementation.matchAll(/^\s+(PC\d+): '(#[0-9a-f]{6})', \/\/ (.+)$/gm),
].map((match) => ({ code: match[1], hex: match[2], name: match[3] }));

const sourceByCode = new Map(sourceRows.map((row) => [row.code, row]));
const implementationByCode = new Map(implementationRows.map((row) => [row.code, row]));
const mismatches = sourceRows.filter((source) => {
  const actual = implementationByCode.get(source.code);
  return !actual || actual.hex !== source.hex || actual.name !== source.name;
});
const extras = implementationRows.filter((row) => !sourceByCode.has(row.code));

const checks = {
  captureCommit,
  sourceUrl,
  sourceHttpStatus: response.status,
  sourceRows: sourceRows.length,
  implementationRows: implementationRows.length,
  uniqueSourceCodes: sourceByCode.size,
  uniqueImplementationCodes: implementationByCode.size,
  mismatches: mismatches.length,
  extras: extras.length,
  runtimeEntries: Object.keys(prismacolor.colors).length,
  rootAndSubpathIdentity: prismacolor.colors.PC901 === subpathPrismacolor.colors.PC901,
  normalizedResolve: resolve('pc 901', { palette: prismacolor }),
  exactIdentify: identify('#162452', { palette: prismacolor }),
  defaultMetric: prismacolor.defaultMetric,
};

console.log(JSON.stringify(checks, null, 2));

if (
  sourceRows.length !== 150 ||
  implementationRows.length !== 150 ||
  sourceByCode.size !== 150 ||
  implementationByCode.size !== 150 ||
  mismatches.length !== 0 ||
  extras.length !== 0 ||
  checks.runtimeEntries !== 150 ||
  !checks.rootAndSubpathIdentity ||
  checks.normalizedResolve !== '#162452' ||
  checks.exactIdentify !== 'PC901' ||
  checks.defaultMetric !== 'deltaE2000'
) {
  console.error(JSON.stringify({ mismatches, extras }, null, 2));
  process.exit(1);
}
