// Pure merge logic for cloud sync (last-writer-wins per entry). No DOM; unit-tested in test/sync.test.mjs.
// Flag maps hold a signed timestamp: +ts = on (done/attended), -ts = off. The larger |ts| wins.
// Record maps hold objects with .ts (deleted records keep {del:true, ts} as tombstones).
export const FLAG_MAPS = ['check', 'clear', 'cds'];
export const REC_MAPS = ['custom', 'budget'];

export function blank() {
  return { v: 1, profile: { ts: 0 }, check: {}, clear: {}, cds: {}, custom: {}, budget: {} };
}
export function normalize(s) {
  const b = blank();
  if (!s || typeof s !== 'object') return b;
  const o = { ...b, ...s };
  o.profile = s.profile && typeof s.profile === 'object' ? { ts: 0, ...s.profile } : b.profile;
  for (const k of [...FLAG_MAPS, ...REC_MAPS]) o[k] = s[k] && typeof s[k] === 'object' ? { ...s[k] } : {};
  return o;
}
export function mergeFlags(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b || {})) {
    const x = out[k], y = b[k];
    if (typeof y !== 'number') continue;
    if (typeof x !== 'number' || Math.abs(y) > Math.abs(x)) out[k] = y;
  }
  return out;
}
export function mergeRecs(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b || {})) {
    const x = out[k], y = b[k];
    if (!y || typeof y !== 'object') continue;
    if (!x || (y.ts || 0) > (x.ts || 0)) out[k] = y;
  }
  return out;
}
export function merge(local, cloud) {
  const a = normalize(local), b = normalize(cloud);
  const out = blank();
  out.profile = (b.profile.ts || 0) > (a.profile.ts || 0) ? b.profile : a.profile;
  for (const k of FLAG_MAPS) out[k] = mergeFlags(a[k], b[k]);
  for (const k of REC_MAPS) out[k] = mergeRecs(a[k], b[k]);
  return out;
}
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
export function same(a, b) { return canon(normalize(a)) === canon(normalize(b)); }
export function isFlagOn(map, id) { return typeof map[id] === 'number' && map[id] > 0; }
export function setFlag(map, id, on, now) { return { ...map, [id]: on ? now : -now }; }
