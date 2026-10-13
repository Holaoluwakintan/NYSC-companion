// POST /api/ask {q, history?, device?, ctx?} -> {answer, model}
// Gemini via the server key (never exposed). Rate limits: per device+IP per day, plus a global daily cap, kept in Supabase (nysc.ai_usage).
const crypto = require('crypto');
const MODELS = (process.env.GEMINI_MODELS || 'gemini-3.6-flash,gemini-3.1-flash-lite,gemini-flash-lite-latest').split(',');
const PER_DAY = +(process.env.AI_PER_DAY || 20);
const GLOBAL_DAY = +(process.env.AI_GLOBAL_DAY || 1500);
const SUPA = (process.env.SUPABASE_URL || 'https://rlbrhpjljjgpqpqjrpkc.supabase.co').replace(/\/+$/, '');
const mem = new Map(); // per-instance burst limit
const cool = new Map(); // model -> time until which we skip it (after a 429 quota answer)

const SYSTEM = `You are "Corper Guide", the friendly AI helper inside NYSC Companion, an independent app for Nigerian National Youth Service Corps members. You are NOT the NYSC and not affiliated with it.
Facts you can rely on (checked Oct 7, 2026):
- 2026 Batch C Stream II orientation: reception/registration opens Wednesday Nov 4, 2026; registration closes midnight Friday Nov 6 (swearing-in Nov 6); closing ceremony Tuesday Nov 24, 2026. Held in all 36 states + FCT (37 camps).
- 2026 Batch C Stream I camp runs Sept 30 – Oct 20, 2026.
- Federal monthly allowance ("allawee"): ₦77,000, the same in every state, paid since March 2025 (raised from ₦33,000 under the Minimum Wage Amendment Act 2024). Some states/PPAs pay extra stipends.
- Monthly clearance confirms you are at your PPA; missing it can mean not being paid for that month. LGAs set the window (often the first days of the month); the dashboard on portal.nysc.org.ng shows it.
- Group CDS is one day a week (set by the LGA) and compulsory.
- Relocation/redeployment is considered on marital, health or security grounds with evidence; preference is not a ground.
- Common camp documents (call-up letter instructions are final): call-up letter printed in colour (not laminated), signed green card, original statement of result/certificate + photocopies, school ID card, medical fitness certificate from a government or military hospital, 8–10 passport photos, NIN slip; HND graduates add the IT letter. Kit: white T-shirts, white shorts, white socks, white canvas shoes (NYSC issues a kit but sizes run out), plus bedding, bucket, padlock, toiletries, medication, cash in small notes.
- SAED (Skills Acquisition & Entrepreneurship Development) trains corps members in skills such as ICT, agro-allied, catering, cosmetology, creative industry, construction, automobile, cleaning & hygiene, power/solar, education.
Style: warm, practical, concise (under 160 words unless asked for more), short bullet points, Nigerian context. Write in clear standard English by default. Use Nigerian Pidgin ONLY when the user's own message is written in Pidgin or they ask for Pidgin. Don't use slang greetings from other countries. Don't start with a greeting; answer directly.
Rules: If you are not sure, say so and tell them who to confirm with (camp officials, LGI, NYSC state secretariat, nysc.gov.ng). Never invent dates, amounts, phone numbers, addresses or links. Never ask for or encourage sharing state codes, BVN, passwords or bank details. Warn about scams (nobody can sell postings or relocation). For medical emergencies, tell them to go to the camp clinic or nearest hospital immediately. For security threats, tell them to contact camp security/police. Politely decline topics unrelated to NYSC, careers, money management or corper life.`;

function hash(s) { return crypto.createHash('sha256').update((process.env.AI_SALT || 'nysc') + s).digest('hex').slice(0, 32); }
function clean(s, n) { return String(s || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').slice(0, n); }

async function hit(f, key) {
  const k = process.env.SUPABASE_SECRET_KEY; if (!k) return { ok: true, n: 0 };
  try {
    const r = await f(SUPA + '/rest/v1/rpc/nysc_ai_hit', { method: 'POST', headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_key: key, p_limit: PER_DAY, p_global: GLOBAL_DAY }) });
    if (!r.ok) return { ok: true, n: 0 }; // fail open on our own DB hiccup; the burst limit still applies
    return await r.json();
  } catch { return { ok: true, n: 0 }; }
}

async function gemini(f, model, contents, key) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 22000);
  try {
    const r = await f(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig: { temperature: 0.4, maxOutputTokens: 2048 } /* thinking models spend output tokens on thinking first; 700 could end empty */,
        safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT'].map(c => ({ category: c, threshold: 'BLOCK_MEDIUM_AND_ABOVE' })) }),
    });
    if (!r.ok) return { err: r.status };
    const j = await r.json();
    const text = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('').trim();
    if (!text) return { err: 'empty', blocked: !!(j.promptFeedback && j.promptFeedback.blockReason) };
    return { text };
  } catch (e) { return { err: 'timeout' }; } finally { clearTimeout(t); }
}

function handler(f) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } } b = b || {};
    const q = clean(b.q, 500).trim();
    if (q.length < 2) return res.status(400).json({ error: 'Ask a question first.' });
    const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim() || 'unknown';
    const dev = clean(b.device, 40);
    // burst: max 6 per minute per IP on this instance
    const now = Date.now(); const m = (mem.get(ip) || []).filter(t => now - t < 60000); m.push(now); mem.set(ip, m); if (mem.size > 5000) mem.clear();
    if (m.length > 6) return res.status(429).json({ error: 'Easy, corper! 😅 Too many questions at once. Wait a minute and try again.' });
    const lim = await hit(f, hash(ip + '|' + dev));
    if (!lim.ok) return res.status(429).json({ error: lim.why === 'global' ? 'Corper Guide has answered a lot of corpers today and is resting. Try again tomorrow 🙏' : `You've used today's ${PER_DAY} questions. Come back tomorrow, or check the FAQ and guides meanwhile.` });
    const key = process.env.GEMINI_API_KEY; if (!key) return res.status(503).json({ error: 'Corper Guide is not switched on yet.' });
    const ctx = b.ctx || {};
    const pre = `[User context: ${ctx.state ? 'deployed to ' + clean(ctx.state, 30) + ' state; ' : ''}camp start ${clean(ctx.campStart, 10) || 'unknown'}; today ${new Date().toISOString().slice(0, 10)}]\n`;
    const hist = Array.isArray(b.history) ? b.history.slice(-6) : [];
    const contents = [...hist.map(h => ({ role: h.r === 'me' ? 'user' : 'model', parts: [{ text: clean(h.t, 1200) }] })), { role: 'user', parts: [{ text: pre + q }] }];
    // Gemini wants alternating roles starting with user
    while (contents.length && contents[0].role !== 'user') contents.shift();
    for (const model of MODELS) {
      if ((cool.get(model) || 0) > Date.now() && model !== MODELS[MODELS.length - 1]) continue;
      const out = await gemini(f, model.trim(), contents, key);
      if (out.err === 429) cool.set(model, Date.now() + 15 * 60000);
      else if (out.err === 503) cool.set(model, Date.now() + 2 * 60000); // 'high demand': skip it briefly instead of paying the wait on every question
      if (out.text) return res.status(200).json({ answer: out.text, model: model.trim(), left: Math.max(0, PER_DAY - (lim.n || 0)) });
      if (out.blocked) return res.status(200).json({ answer: 'I can\'t help with that one. Ask me anything about camp, PPA, CDS, clearance or corper life. 🙂', model: model.trim() });
    }
    return res.status(503).json({ error: 'Corper Guide is busy right now. Please try again in a minute.' });
  };
}
module.exports = handler((u, o) => fetch(u, o));
module.exports.handler = handler;
module.exports.SYSTEM = SYSTEM;
