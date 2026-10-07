// Writes dist/sw.js with a precache list of every built file (offline-first), plus a version stamp.
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const dist = new URL('../dist/', import.meta.url).pathname;
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(p); } })(dist);
const skip = /(^og\/|^shots\/|\.map$|^sw\.js$|^vercel\.json$|^icons\/maskable|^icons\/icon-512)/;
const pre = files.map(p => relative(dist, p).replace(/\\/g, '/')).filter(r => !skip.test(r));
const hash = createHash('sha1'); for (const r of pre.sort()) hash.update(r + readFileSync(join(dist, r)).length);
const v = hash.digest('hex').slice(0, 10);
const list = ['/', ...pre.filter(r => r !== 'index.html').map(r => '/' + r)];
const sw = readFileSync(new URL('../sw-template.js', import.meta.url), 'utf8').replace('__VERSION__', v).replace('__PRECACHE__', JSON.stringify(list));
writeFileSync(join(dist, 'sw.js'), sw);
let kb = 0; for (const r of pre) if (/\.js$/.test(r)) kb += statSync(join(dist, r)).size;
console.log('sw.js', v, pre.length, 'files precached; total JS', (kb / 1024).toFixed(1), 'KB');
