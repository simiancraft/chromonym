import assert from 'node:assert/strict';

const captureCommit = 'fd6a65bad530104e34f2aa41e3f74b2fff05e51c';
const upstreamCommit = 'd872455c4be56022da2095349b30ef46e0b55bc3';
const upstreamBase = `https://raw.githubusercontent.com/material-components/material-web/${upstreamCommit}/tokens/versions/v0_192`;

const [paletteResponse, rolesResponse] = await Promise.all([
  fetch(`${upstreamBase}/_md-ref-palette.scss`),
  fetch(`${upstreamBase}/_md-sys-color.scss`),
]);
assert.equal(paletteResponse.status, 200);
assert.equal(rolesResponse.status, 200);

const paletteSource = await paletteResponse.text();
const rolesSource = await rolesResponse.text();
assert.match(paletteSource, /Design system version: v0\.192/);
assert.match(rolesSource, /Design system version: v0\.192/);

const reference = new Map();
for (const match of paletteSource.matchAll(/'([^']+)': if\([^\n]+, (#[0-9a-f]+)\)/g)) {
  const [, token, hex] = match;
  reference.set(token, hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c.repeat(2)).join('')}` : hex);
}

const parseRoles = (scheme, source) => {
  const result = new Map();
  const pattern = /'([^']+)':\s*map\.get\(\$deps,\s*'md-ref-palette',\s*'([^']+)'\)/gs;
  for (const match of source.matchAll(pattern)) {
    const [, role, referenceToken] = match;
    const value = reference.get(referenceToken);
    assert.ok(value, `missing reference token ${referenceToken}`);
    result.set(`${scheme}-${role}`, value);
  }
  return result;
};

const darkSection = rolesSource.slice(
  rolesSource.indexOf('@function values-dark'),
  rolesSource.indexOf('$_default-light'),
);
const lightSection = rolesSource.slice(rolesSource.indexOf('@function values-light'));
const expected = new Map([...parseRoles('light', lightSection), ...parseRoles('dark', darkSection)]);

const root = await import('chromonym');
const subpath = await import('chromonym/material');
assert.equal(root.material, subpath.material);
const actual = subpath.material.colors;
const actualEntries = Object.entries(actual);
const missing = [...expected].filter(([key]) => !(key in actual));
const extra = actualEntries.filter(([key]) => !expected.has(key));
const mismatches = actualEntries.filter(([key, value]) => expected.get(key) !== value);

assert.equal(expected.size, 98);
assert.equal(expected.size, actualEntries.length);
assert.equal(missing.length, 0);
assert.equal(extra.length, 0);
assert.equal(mismatches.length, 0);
assert.equal(subpath.material.defaultMetric, 'deltaEok');
assert.equal(root.resolve('light-primary', { palette: root.material }), '#6750a4');
assert.equal(root.identify('#b3261e', { palette: root.material }), 'light-error');

console.log(`capture_commit=${captureCommit}`);
console.log(`upstream_material_web_commit=${upstreamCommit}`);
console.log('upstream_design_system_version=v0.192');
console.log(`expected_roles=${expected.size}`);
console.log(`actual_roles=${actualEntries.length}`);
console.log(`light_roles=${[...expected.keys()].filter((key) => key.startsWith('light-')).length}`);
console.log(`dark_roles=${[...expected.keys()].filter((key) => key.startsWith('dark-')).length}`);
console.log(`missing=${missing.length}`);
console.log(`extra=${extra.length}`);
console.log(`mismatches=${mismatches.length}`);
console.log('root_export=pass');
console.log('node_esm_subpath_export=pass');
console.log('default_metric=deltaEok');
console.log('resolve_exact=pass');
console.log('identify_exact=pass');
console.log('FOCUSED_MATERIAL_PROOF_EXIT=0');
