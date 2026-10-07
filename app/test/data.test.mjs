import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const camps = JSON.parse(readFileSync(new URL('../public/data/camps.json', import.meta.url))).camps;
test('37 camps, unique codes, every camp sourced to the NYSC list', () => {
  assert.equal(camps.length, 37);
  assert.equal(new Set(camps.map(c => c.code)).size, 37);
  for (const c of camps) {
    assert.ok(c.address && c.address.length > 10, c.code);
    assert.ok(c.sources.some(s => s.url === 'https://www.nysc.gov.ng/camps.html'), c.code);
    assert.equal(c.lastChecked, '2026-10-07');
    for (const e of c.expect) { assert.ok(e.text && e.src && /^https:\/\//.test(e.src.url), c.code + ' note source'); assert.equal(typeof e.verified, 'boolean'); }
    if (c.lat != null) { assert.ok(c.lat > 4 && c.lat < 14 && c.lon > 2.5 && c.lon < 15, c.code + ' inside Nigeria'); }
  }
});
test('state codes match the app list', async () => {
  const src = readFileSync(new URL('../src/data/states.ts', import.meta.url), 'utf8');
  const codes = [...src.matchAll(/\['([A-Z]{2})', '/g)].map(m => m[1]);
  assert.equal(codes.length, 37); assert.deepEqual([...codes].sort(), camps.map(c => c.code).sort());
});
test('content facts carry sources', () => {
  const f = readFileSync(new URL('../src/data/facts.ts', import.meta.url), 'utf8');
  assert.match(f, /amount: 77000/); assert.match(f, /start: '2026-11-04'/); assert.match(f, /close: '2026-11-24'/);
  const c = readFileSync(new URL('../src/data/content.ts', import.meta.url), 'utf8');
  for (const id of ['callup', 'greencard', 'result', 'medical', 'nin']) assert.match(c, new RegExp(`id: '${id}'`));
});
test('footer disclaimer present', () => { assert.match(readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8'), /Not affiliated with the NYSC/); });
