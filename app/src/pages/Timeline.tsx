import { h } from 'preact';
import * as store from '../store';
import { BATCHES_2026, NEXT_CAMP, S } from '../data/facts';
import { Top, Sources, Footer } from '../ui';
import { watTime, addDays, watDate } from '../lib/dates.js';

const fmt = (d: string) => new Date(watTime(d, 12)).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' });
const mon = (d: string) => new Date(watTime(d, 12)).toLocaleDateString('en-NG', { month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' });

export default function Timeline() {
  const today = watDate(Date.now());
  const start = store.campStart();
  const isC2 = start === NEXT_CAMP.start;
  const close = isC2 ? NEXT_CAMP.close : addDays(start, 20);
  const steps: { d: string; t: string; s: string; est?: boolean }[] = [
    { d: start, t: 'Camp opens', s: 'Reception and registration. Arrive early with every document.' },
    ...(isC2 ? [{ d: NEXT_CAMP.swearIn, t: 'Swearing-in · registration closes', s: 'Registration ends at midnight Nov 6.' }] : []),
    { d: close, t: 'Closing ceremony', s: 'Posting letters to PPAs are handed out.', est: !isC2 },
    { d: addDays(close, 2), t: 'Report to your PPA', s: 'Go with your posting letter as soon as possible.', est: true },
    { d: addDays(close, 35), t: 'First monthly clearance', s: 'At your LGA, usually in the first days of the month.', est: true },
    { d: addDays(start, 365), t: 'Passing Out Parade (POP)', s: 'About a year after camp. NYSC announces the exact date.', est: true },
  ];
  return <>
    <Top title="Timeline" back />
    <div class="wrap">
      <section class="card">
        <h3>Your service year</h3>
        <p class="tiny" style={{ marginTop: 2 }}>Dates marked “estimate” follow the usual NYSC pattern; official dates come from NYSC.</p>
        <div class="tl stagger" style={{ marginTop: 14 }}>
          {steps.map((x, i) => { const past = x.d < today; const now = !past && (i === 0 || steps[i - 1].d < today); return <div key={i} class={'ev' + (past ? ' past' : '') + (now ? ' now' : '')}>
            <div class="tiny" style={{ fontWeight: 700, color: now ? 'var(--g3)' : undefined }}>{x.est ? 'Around ' + mon(x.d) : fmt(x.d)}{x.est && <span class="badge mute" style={{ marginLeft: 6 }}>estimate</span>}</div>
            <div class="t" style={{ fontWeight: 700, marginTop: 2 }}>{x.t}</div><div class="sub">{x.s}</div></div>; })}
        </div>
        {isC2 && <Sources src={NEXT_CAMP.sources} verified />}
      </section>
      <div class="sec"><h2>2026 orientation courses</h2></div>
      <div class="card list stagger" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {BATCHES_2026.map(b => { const past = (b.end || addDays(b.start, 20)) < today; const next = b.id === NEXT_CAMP.id; return <div key={b.id} class="li" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, flex: 'none', display: 'grid', placeItems: 'center', fontWeight: 800, background: next ? 'var(--g)' : 'var(--chip)', color: next ? '#fff' : 'var(--ink2)' }}>{b.id.slice(0, 2)}</div>
          <div class="grow"><div class="t">{b.label} {next ? <span class="badge info">Next</span> : past ? <span class="badge mute">Done</span> : null}</div>
            <div class="sub">{fmt(b.start)}{b.end ? ' → ' + fmt(b.end) : ''}</div>{b.note && <div class="tiny">{b.note}</div>}
            <div class="tiny" style={{ marginTop: 4 }}>{b.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noopener">{s.label.split(':')[0]}</a></span>)}</div></div></div>; })}
      </div>
      <Sources src={[S.mobtable]} note="NYSC publishes each stream's mobilisation timetable on its website; dates there are marked tentative." />
      <Footer />
    </div>
  </>;
}
