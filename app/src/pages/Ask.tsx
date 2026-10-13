import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as store from '../store';
import { DISCLAIMER_AI } from '../data/facts';
import { stateName } from '../data/states';
import { Top, Icon, haptic } from '../ui';

interface Msg { r: 'me' | 'ai'; t: string; err?: boolean }
const KEY = 'nysc:ask:v1';
const SUGG = ['What should I pack for camp?', 'How does monthly clearance work?', 'Can I relocate after camp?', 'Tips for my first week at PPA', 'Which SAED skill pays fastest?', 'How do I survive on ₦77k?'];

function esc(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }
export function md(s: string) {
  const lines = esc(s).split('\n'); let out = '', inList = false;
  for (let l of lines) {
    l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\s)\*(?!\s)(.+?)\*(?=\s|$|[.,!?])/g, '$1<i>$2</i>').replace(/(https:\/\/[^\s)<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    const m = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(l);
    if (m) { if (!inList) { out += '<ul>'; inList = true; } out += '<li>' + m[1] + '</li>'; continue; }
    if (inList) { out += '</ul>'; inList = false; }
    if (/^#{1,4}\s/.test(l)) l = '<b>' + l.replace(/^#{1,4}\s/, '') + '</b>';
    if (l.trim()) out += '<p>' + l + '</p>';
  }
  if (inList) out += '</ul>';
  return out;
}

export default function Ask() {
  const [msgs, setMsgs] = useState<Msg[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } });
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState<number | null>(null); // questions left today (server count; health check 2026-10-14)
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-30))); } catch { /* */ } end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, busy]);
  const send = async (text: string) => {
    text = text.trim(); if (!text || busy) return;
    if (!navigator.onLine) { setMsgs(m => [...m, { r: 'me', t: text }, { r: 'ai', t: 'You\'re offline. Corper Guide needs data; the checklist, camp guides and FAQ work offline.', err: true }]); return; }
    const hist = msgs.filter(m => !m.err).slice(-6);
    setMsgs(m => [...m, { r: 'me', t: text }]); setQ(''); setBusy(true); haptic();
    try {
      const pf = store.get().profile;
      const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: text, history: hist, device: store.getSettings().deviceId, ctx: { state: stateName(pf.state), campStart: store.campStart() } }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Corper Guide is busy. Try again in a minute.');
      setMsgs(m => [...m, { r: 'ai', t: j.answer }]);
      if (typeof j.left === 'number') setLeft(j.left);
    } catch (e: any) { setMsgs(m => [...m, { r: 'ai', t: e.message || 'Network problem. Try again.', err: true }]); }
    finally { setBusy(false); }
  };
  return <>
    <Top title="Ask Corper Guide" right={msgs.length ? <button class="iconbtn" aria-label="Clear chat" onClick={() => setMsgs([])}><Icon n="trash" size={20} /></button> : undefined} />
    <div class="wrap" style={{ paddingBottom: 'calc(var(--nav) + 96px)' }}>
      {!msgs.length && <div class="stagger">
        <section class="hero" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44 }}>✨</div>
          <h2>Your AI corper guide</h2>
          <p>Ask anything about camp, PPA, CDS, clearance, SAED or surviving on allawee. Answers in plain English (or Pidgin, just ask).</p>
        </section>
        <div class="sec"><h2>Try asking</h2></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>{SUGG.map(s => <button key={s} class="chip" onClick={() => send(s)}>{s}</button>)}</div>
      </div>}
      {msgs.map((m, i) => m.r === 'me' ? <div key={i} class="bubble me">{m.t}</div> : <div key={i} class="bubble ai prose" style={m.err ? { color: 'var(--red)' } : undefined} dangerouslySetInnerHTML={{ __html: md(m.t) }} />)}
      {busy && <div class="bubble ai" aria-label="Corper Guide is typing"><span class="dots"><i /><i /><i /></span></div>}
      <p class="tiny" style={{ textAlign: 'center', margin: '14px 6px 0' }}>⚠️ {DISCLAIMER_AI}</p>
      <p class="tiny" style={{ textAlign: 'center', margin: '6px 6px 0' }}>Corper Guide is free: up to 20 questions a day on each phone{left !== null ? ` · ${left} left today` : ''}. The count starts again every night. Checklist, camp guides and FAQ have no limit.</p>
      <div ref={end} style={{ scrollMarginBottom: 'calc(var(--nav) + 84px)' }} />
    </div>
    <form class="composer" onSubmit={e => { e.preventDefault(); send(q); }}>
      <input class="inp" value={q} onInput={e => setQ((e.target as HTMLInputElement).value)} placeholder="Ask about camp, PPA, CDS…" maxLength={500} aria-label="Your question" />
      <button class="send" aria-label="Send" disabled={busy || !q.trim()}><Icon n="send" size={20} /></button>
    </form>
  </>;
}
