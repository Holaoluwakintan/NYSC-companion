import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import * as store from '../store';
import { Top, Icon, Skeleton, Footer, Sources } from '../ui';
import type { Src } from '../data/facts';

export interface Camp {
  code: string; state: string; name: string | null; town: string | null; address: string | null;
  lat: number | null; lon: number | null; geocoded?: boolean; mapUrl?: string | null; directions?: string | null;
  expect: { text: string; src?: Src; verified?: boolean }[]; moved?: string | null;
  verified: Record<string, boolean>; sources: Src[]; lastChecked: string;
}
let cache: Camp[] | null = null;
export async function loadCamps(): Promise<Camp[]> {
  if (cache) return cache;
  const r = await fetch('/data/camps.json'); cache = (await r.json()).camps; return cache!;
}

function V({ ok }: { ok?: boolean }) { return ok ? <span class="badge ok" title="Confirmed by an official or two independent sources">✓</span> : <span class="badge warn" title="From one unofficial source; confirm locally">Unverified</span>; }

function Detail({ c }: { c: Camp }) {
  const mine = store.get().profile.state === c.code;
  const q = encodeURIComponent((c.name || 'NYSC orientation camp') + ', ' + (c.address || c.town || c.state));
  const maps = c.mapUrl ? c.mapUrl : c.lat != null && c.lon != null ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
  return <>
    <Top title={c.state} back />
    <div class="wrap stagger">
      <section class="hero" style={{ paddingBottom: 18 }}>
        <div class="eyebrow"><span class="flagdot"><i /><i /><i /></span>{c.code} · Orientation camp</div>
        <h2 style={{ fontSize: 21 }}>{c.name || 'NYSC Orientation Camp, ' + c.state}</h2>
        <p>{c.town || ''}</p>
        <div class="meta">{mine ? <span class="pill">⭐ Your state</span> : <button class="pill" onClick={() => store.setProfile({ state: c.code })}>Set as my state</button>}</div>
      </section>
      {c.moved && <div class="card" style={{ borderLeft: '4px solid var(--amber)' }}><b>Heads up:</b> {c.moved}</div>}
      <div class="card">
        <h3>Address</h3>
        <div class="kv"><span>Camp</span><span style={{ textAlign: 'right' }}>{c.name || '—'} <V ok={c.verified.name} /></span></div>
        {c.town && <div class="kv"><span>Area</span><span style={{ textAlign: 'right' }}>{c.town}</span></div>}
        <div class="kv"><span>Location</span><span style={{ textAlign: 'right' }}>{c.address || c.town || 'Not confirmed yet'} {c.address && <V ok={c.verified.address} />}</span></div>
        {c.directions && <div class="kv"><span>Getting there</span><span style={{ textAlign: 'right' }}>{c.directions} {!c.verified.directions && <span class="badge warn">Unverified</span>}</span></div>}
        <a class="btn" style={{ marginTop: 12 }} href={maps} target="_blank" rel="noopener"><Icon n="pin" size={20} />Open in Maps</a>
        <p class="tiny" style={{ marginTop: 8 }}>{c.mapUrl ? 'Map pin from the NYSC website.' : 'No official map pin: this searches the address.'}</p>
      </div>
      <div class="card">
        <h3>What to expect</h3>
        {c.expect.length ? <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>{c.expect.map((e, i) => <li key={i} style={{ marginBottom: 6 }}>{e.text}{e.verified === false && <> <span class="badge warn">Unverified</span></>}{e.src && <> <a class="tiny" href={e.src.url} target="_blank" rel="noopener">source</a></>}</li>)}</ul>
          : <p class="sub">No camp-specific notes we could verify yet. General camp life: early morning parades, lectures, SAED sessions, Man O' War drills and a busy Mammy market.</p>}
      </div>
      <a class="card row" href="#/checklist" style={{ color: 'inherit' }}><div style={{ fontSize: 24 }}>🎒</div><div class="grow"><h3>Pack for camp</h3><div class="sub">Open your checklist</div></div><Icon n="chev" /></a>
      <Sources src={c.sources} note={'Last checked ' + c.lastChecked + '. Camps sometimes move: confirm with your call-up letter.'} />
      <Footer />
    </div>
  </>;
}

export default function Camps({ arg }: { arg: string }) {
  const [list, setList] = useState<Camp[] | null>(cache);
  const [q, setQ] = useState('');
  const [err, setErr] = useState(false);
  useEffect(() => { if (!list) loadCamps().then(setList).catch(() => setErr(true)); }, []);
  const mine = store.get().profile.state;
  const shown = useMemo(() => {
    if (!list) return [];
    const t = q.trim().toLowerCase();
    const l = list.filter(c => !t || (c.state + ' ' + c.code + ' ' + (c.name || '') + ' ' + (c.town || '') + ' ' + (c.address || '')).toLowerCase().includes(t));
    return l.sort((a, b) => (b.code === mine ? 1 : 0) - (a.code === mine ? 1 : 0) || a.state.localeCompare(b.state));
  }, [list, q, mine]);
  if (err) return <><Top title="Camp guides" back /><div class="wrap"><div class="empty"><div class="e">📡</div>Couldn't load camps. Connect once and they'll stay offline.</div></div></>;
  if (!list) return <><Top title="Camp guides" back /><Skeleton n={6} /></>;
  if (arg) { const c = list.find(x => x.code === arg.toUpperCase()); if (c) return <Detail c={c} />; }
  return <>
    <Top title="Camp guides" back />
    <div class="wrap">
      <p class="sub" style={{ margin: '0 4px 12px' }}>All 37 orientation camps: 36 states + FCT. Every fact is sourced; anything we couldn't double-check is marked.</p>
      <div class="search"><Icon n="search" /><input class="inp" type="search" placeholder="Search state, town or camp" value={q} onInput={e => setQ((e.target as HTMLInputElement).value)} aria-label="Search camps" /></div>
      <div class="card list stagger" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {shown.map(c => <a key={c.code} class="li" href={'#/camps/' + c.code} style={{ color: 'inherit' }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: c.code === mine ? 'var(--g)' : 'var(--gl)', color: c.code === mine ? '#fff' : 'var(--g3)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flex: 'none' }}>{c.code}</div>
          <div class="grow"><div class="t">{c.state}{c.code === mine && <span class="must">YOURS</span>}</div><div class="tiny" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.town || c.name || 'Camp details pending'}</div></div>
          <span class="chev"><Icon n="chev" /></span></a>)}
        {!shown.length && <div class="empty"><div class="e">🔍</div>No camp matches “{q}”.</div>}
      </div>
      <Footer />
    </div>
  </>;
}
