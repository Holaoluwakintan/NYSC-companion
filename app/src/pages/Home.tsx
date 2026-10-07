import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as store from '../store';
import { CHECKLIST } from '../data/content';
import { NEXT_CAMP, ALLOWANCE } from '../data/facts';
import { STATES, stateName } from '../data/states';
import { countdown, phase, watTime, nextDow, clearanceStatus, monthKey, naira, monthTotals } from '../lib/dates.js';
import { Icon, Ring, Footer, Sheet, PremiumTeaser, AdSlot, confetti } from '../ui';
import { user } from '../auth';

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function checklistPct() {
  const all = CHECKLIST.flatMap(g => g.items.map(i => i.id));
  const custom = Object.entries(store.get().custom).filter(([, c]) => !c.del).map(([id]) => id);
  const ids = [...all, ...custom];
  const done = ids.filter(id => store.checked(id)).length;
  return { done, total: ids.length, pct: ids.length ? done / ids.length : 0 };
}

function Countdown({ start }: { start: string }) {
  const target = watTime(start, 7);
  const [n, setN] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(id); }, []);
  const c = countdown(target, n);
  const cells: [number, string][] = [[c.d, 'days'], [c.h, 'hrs'], [c.m, 'mins'], [c.s, 'secs']];
  return <div class="cd num" role="timer" aria-label={`${c.d} days ${c.h} hours ${c.m} minutes to camp`}>
    {cells.map(([v, l]) => <div key={l}><b key={v} class="tick">{String(v).padStart(2, '0')}</b><span>{l}</span></div>)}
  </div>;
}

function Hero() {
  const pf = store.get().profile;
  const start = store.campStart();
  const ph = phase(start, Date.now());
  const custom = !!pf.campStart && pf.campStart !== NEXT_CAMP.start;
  const sn = stateName(pf.state);
  const label = custom ? 'Your camp' : NEXT_CAMP.label;
  const d = new Date(watTime(start, 12)).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' });
  return <section class="hero">
    <div class="eyebrow"><span class="flagdot"><i /><i /><i /></span>{label}</div>
    {ph.kind === 'before' && <><h2>{ph.days === 1 ? 'Camp is tomorrow!' : 'Camp opens in'}</h2><Countdown start={start} />
      <div class="meta"><span class="pill"><Icon n="cal" size={14} />{d}</span>{sn && <span class="pill"><Icon n="pin" size={14} />{sn} camp</span>}<span class="pill">Swearing-in Nov 6</span></div></>}
    {ph.kind === 'camp' && <><h2>Day {ph.day} of camp 🎖️</h2><p>Stay hydrated, keep your kit clean and finish registration early. You've got this.</p>
      <div class="prog" style={{ marginTop: 14, background: 'rgba(255,255,255,.2)' }}><i style={{ width: (100 * (ph.day || 0) / (ph.of || 21)) + '%', background: '#fff' }} /></div></>}
    {ph.kind === 'service' && <><h2>Service month {ph.month} 💪</h2><p>Don't miss your monthly clearance and weekly CDS.</p></>}
    {ph.kind === 'done' && <><h2>Service year complete 🎉</h2><p>Congratulations, ex-corper! Time to build that CV.</p></>}
  </section>;
}

function Onboard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pf = store.get().profile;
  const [name, setName] = useState(pf.name || '');
  const [st, setSt] = useState(pf.state || '');
  const [mode, setMode] = useState(pf.campStart && pf.campStart !== NEXT_CAMP.start ? 'custom' : 'c2');
  const [date, setDate] = useState(pf.campStart || NEXT_CAMP.start);
  const save = () => {
    store.setProfile({ name: name.trim().slice(0, 40), state: st, campStart: mode === 'c2' ? NEXT_CAMP.start : date, batch: mode === 'c2' ? NEXT_CAMP.id : 'custom', onboarded: true });
    onClose(); confetti(innerWidth / 2, innerHeight * 0.3);
  };
  return <Sheet label="Welcome" open={open} onClose={() => { store.setProfile({ onboarded: true }); onClose(); }}>
    <h2 style={{ fontSize: 22 }}>Welcome, corper! 🇳🇬</h2>
    <p class="sub" style={{ marginTop: 6 }}>Three quick things so your countdown and guides fit you. Everything stays on your phone.</p>
    <label class="field"><span>Your first name</span><input class="inp" value={name} onInput={e => setName((e.target as HTMLInputElement).value)} placeholder="e.g. Ada" autocomplete="given-name" /></label>
    <label class="field"><span>State of deployment</span>
      <select class="inp" value={st} onChange={e => setSt((e.target as HTMLSelectElement).value)}><option value="">Not posted yet</option>{STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
    <div class="field"><span>Your batch</span>
      <div class="seg"><button class={mode === 'c2' ? 'on' : ''} onClick={() => setMode('c2')}>2026 C · Stream II</button><button class={mode === 'custom' ? 'on' : ''} onClick={() => setMode('custom')}>Other date</button></div>
      {mode === 'custom' && <input class="inp" type="date" style={{ marginTop: 10 }} value={date} onInput={e => setDate((e.target as HTMLInputElement).value)} />}
    </div>
    <button class="btn" style={{ marginTop: 18 }} onClick={save}>Let's go</button>
  </Sheet>;
}

export default function Home() {
  const s = store.get(); const pf = s.profile;
  const [ob, setOb] = useState(!pf.onboarded);
  const ck = checklistPct();
  const now = Date.now();
  const nextCds = pf.cdsDay != null ? nextDow(pf.cdsDay, now) : null;
  const mk = monthKey(now);
  const clr = clearanceStatus(mk, store.cleared(mk), now);
  const ph = phase(store.campStart(), now);
  const u = user();
  const t = monthTotals(Object.values(s.budget), mk);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const tiles: [string, string, string, string][] = [
    ['#/camps', '🏕️', 'Camp guides', 'All 37 camps'],
    ['#/timeline', '🗓️', 'Batch timeline', '2026 dates'],
    ['#/cds', '🤝', 'CDS & clearance', 'Reminders'],
    ['#/money', '💸', 'Allawee & budget', naira(ALLOWANCE.amount) + '/mo'],
    ['#/guides/ppa', '🏢', 'PPA tips', 'Before & after posting'],
    ['#/guides/saed', '🛠️', 'SAED skills', 'Pick a paying skill'],
  ];
  return <div class="wrap stagger">
    <div class="row" style={{ padding: '6px 2px 14px' }}>
      <div class="grow"><div class="tiny">{greet}</div><h1 style={{ fontSize: 24, fontWeight: 800 }}>{pf.name ? `Hi ${pf.name} 👋` : 'Hi corper 👋'}</h1></div>
      <a class="iconbtn" href="#/me" aria-label="Me & settings">{u && u.avatar ? <img src={u.avatar} alt="" width={40} height={40} style={{ borderRadius: 12 }} referrerpolicy="no-referrer" /> : <Icon n="user" />}</a>
    </div>
    <Hero />
    <a class="card row" href="#/checklist" style={{ color: 'inherit' }}>
      <Ring pct={ck.pct} size={66} />
      <div class="grow"><h3>Camp checklist</h3><div class="sub">{ck.done === ck.total ? 'All packed. Safe journey! 🎒' : `${ck.done} of ${ck.total} packed · ${ck.total - ck.done} to go`}</div></div>
      <span class="chev"><Icon n="chev" /></span>
    </a>
    <a class="tile wide" href="#/ask" style={{ marginTop: 14, color: 'inherit', background: 'linear-gradient(120deg,var(--card),var(--gl))' }}>
      <div class="ic" style={{ background: 'var(--g)', color: '#fff' }}><Icon n="spark" /></div>
      <div class="grow"><b>Ask Corper Guide</b><small>“What should I pack?” · “How does clearance work?”</small></div><span class="chev"><Icon n="chev" /></span>
    </a>
    <div class="grid2">
      {tiles.map(([href, e, b, sm]) => <a key={href} class="tile" href={href} style={{ color: 'inherit' }}><div class="ic">{e}</div><div><b>{b}</b><small>{sm}</small></div></a>)}
    </div>
    <div class="sec"><h2>Coming up</h2><a href="#/cds">Plan</a></div>
    <div class="card list" style={{ paddingTop: 4, paddingBottom: 4 }}>
      {ph.kind === 'before' && <a class="li" href="#/timeline" style={{ color: 'inherit' }}><div style={{ fontSize: 22 }}>🎖️</div><div class="grow"><div class="t">Camp reception</div><div class="tiny">Registration closes midnight Nov 6 · bring every document</div></div><span class="badge info">{ph.days}d</span></a>}
      <a class="li" href="#/cds" style={{ color: 'inherit' }}><div style={{ fontSize: 22 }}>🤝</div><div class="grow"><div class="t">Next CDS</div><div class="tiny">{nextCds ? `${DOW[pf.cdsDay!]} · ${new Date(watTime(nextCds, 12)).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' })}${pf.cdsGroup ? ' · ' + pf.cdsGroup : ''}` : 'Set your CDS day after camp'}</div></div><span class="chev"><Icon n="chev" /></span></a>
      <a class="li" href="#/cds" style={{ color: 'inherit' }}><div style={{ fontSize: 22 }}>🪪</div><div class="grow"><div class="t">Monthly clearance</div><div class="tiny">{ph.kind === 'service' ? 'Usually in the first days of the month at your LGA' : 'Starts the month after camp'}</div></div>
        {ph.kind === 'service' && <span class={'badge ' + (clr === 'done' ? 'ok' : clr === 'due' ? 'warn' : 'bad')}>{clr === 'done' ? 'Done' : clr === 'due' ? 'Due' : 'Late'}</span>}</a>
      {t.in + t.out > 0 && <a class="li" href="#/money" style={{ color: 'inherit' }}><div style={{ fontSize: 22 }}>👛</div><div class="grow"><div class="t">This month</div><div class="tiny">{naira(t.left)} left of {naira(t.in)}</div></div><span class="chev"><Icon n="chev" /></span></a>}
    </div>
    <a class="card row" href="#/card" style={{ background: 'linear-gradient(135deg,#0b8a4f,#05432a)', color: '#fff' }}>
      <div style={{ fontSize: 30 }}>🪪</div><div class="grow"><h3 style={{ color: '#fff' }}>Make your “My Camp” card</h3><div style={{ opacity: .85, fontSize: 14 }}>Share it on WhatsApp and find your camp mates.</div></div><Icon n="share" />
    </a>
    <AdSlot id="home" />
    <PremiumTeaser />
    <Footer />
    <Onboard open={ob} onClose={() => setOb(false)} />
  </div>;
}
