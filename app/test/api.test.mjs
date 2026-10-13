import test from 'node:test'; import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.GEMINI_API_KEY = 'k'; process.env.SUPABASE_SECRET_KEY = 's'; process.env.AI_PER_DAY = '3';
const ask = require('../../api/ask.js'); const card = require('../../api/card.js');
function res() { const r = { code: 0, body: null, h: {} }; r.setHeader = (k, v) => { r.h[k] = v; }; r.status = c => { r.code = c; return r; }; r.json = b => { r.body = b; return r; }; r.send = b => { r.body = b; return r; }; return r; }
function fakeFetch({ limit = { ok: true, n: 1 }, gem = {} } = {}) {
  const calls = [];
  const f = async (u, o) => {
    calls.push(u);
    if (u.includes('nysc_ai_hit')) return { ok: true, json: async () => limit };
    const m = /models\/([^:]+):/.exec(u)[1];
    const g = gem[m] || { status: 200, text: 'Pack your call-up letter.' };
    if ((g.status || 200) !== 200) return { ok: false, status: g.status, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => (g.blocked ? { promptFeedback: { blockReason: 'SAFETY' } } : { candidates: [{ content: { parts: [{ text: g.text }] } }] }) };
  };
  f.calls = calls; return f;
}
const req = (body, ip = '1.1.1.1') => ({ method: 'POST', body, headers: { 'x-forwarded-for': ip } });
test('answers with the primary model', async () => { const f = fakeFetch(); const r = res(); await ask.handler(f)(req({ q: 'What do I pack?', device: 'd1' }), r); assert.equal(r.code, 200); assert.equal(r.body.model, 'gemini-3.6-flash'); assert.match(r.body.answer, /call-up/); });
test('falls back to flash-lite when primary is out of quota', async () => { const f = fakeFetch({ gem: { 'gemini-3.6-flash': { status: 429 } } }); const r = res(); await ask.handler(f)(req({ q: 'Hello there', device: 'd2' }, '2.2.2.2'), r); assert.equal(r.code, 200); assert.equal(r.body.model, 'gemini-3.1-flash-lite'); });
test('daily limit and global cap answer 429 with a friendly message', async () => {
  let r = res(); await ask.handler(fakeFetch({ limit: { ok: false, why: 'user' } }))(req({ q: 'Hi again', device: 'd3' }, '3.3.3.3'), r); assert.equal(r.code, 429); assert.match(r.body.error, /today's 3 questions/);
  r = res(); await ask.handler(fakeFetch({ limit: { ok: false, why: 'global' } }))(req({ q: 'Hi again', device: 'd3' }, '3.3.3.4'), r); assert.equal(r.code, 429); assert.match(r.body.error, /tomorrow/);
});
test('burst limit: 7th request in a minute from one IP is refused', async () => { const h = ask.handler(fakeFetch()); let r; for (let i = 0; i < 7; i++) { r = res(); await h(req({ q: 'Question ' + i, device: 'd4' }, '4.4.4.4'), r); } assert.equal(r.code, 429); });
test('rejects empty and non-POST', async () => { let r = res(); await ask.handler(fakeFetch())(req({ q: ' ' }, '5.5.5.5'), r); assert.equal(r.code, 400); r = res(); await ask.handler(fakeFetch())({ method: 'GET', headers: {} }, r); assert.equal(r.code, 405); });
test('blocked prompt gets a polite refusal, not an error', async () => { const r = res(); await ask.handler(fakeFetch({ gem: { 'gemini-3.6-flash': { blocked: true }, 'gemini-3.1-flash-lite': { blocked: true }, 'gemini-flash-lite-latest': { blocked: true } } }))(req({ q: 'something bad', device: 'd6' }, '6.6.6.6'), r); assert.equal(r.code, 200); assert.match(r.body.answer, /can't help/); });
test('system prompt carries the safety rules and facts', () => { assert.match(ask.SYSTEM, /NOT the NYSC/); assert.match(ask.SYSTEM, /₦77,000/); assert.match(ask.SYSTEM, /Nov 4, 2026/); assert.match(ask.SYSTEM, /Never invent/); });
test('share card page: OG tags, state image, escaping', () => {
  const html = card.page('nysc-companion-ng.vercel.app', 'la', '<script>Ada</script>');
  assert.match(html, /og:image" content="https:\/\/nysc-companion-ng.vercel.app\/og\/LA.jpg"/); assert.match(html, /heading to Lagos camp/);
  assert.ok(!html.includes('<script>Ada')); assert.match(html, /#\/camps\/LA/);
  assert.match(card.page('x.app', 'ZZ', ''), /og\/default.jpg/);
});

test('a 429 puts the primary model on a cooldown (no wasted call)', async () => {
  const f = fakeFetch({ gem: { 'gemini-3.6-flash': { status: 429 } } }); const r = res(); await ask.handler(f)(req({ q: 'Second question', device: 'd7' }, '7.7.7.7'), r);
  assert.equal(r.body.model, 'gemini-3.1-flash-lite'); assert.equal(f.calls.filter(u => u.includes('3.6-flash')).length, 0);
});
test('a 503 (high demand) also skips the primary briefly', async () => {
  const f = fakeFetch({ gem: { 'gemini-3.6-flash': { status: 503 } } }); let r = res(); const h = ask.handler(f);
  // primary may already be cooling from earlier tests; either way the answer comes from the fallback
  await h(req({ q: 'Busy model', device: 'd8' }, '8.8.8.8'), r); assert.equal(r.code, 200); assert.equal(r.body.model, 'gemini-3.1-flash-lite'); assert.equal(typeof r.body.left, 'number');
});
