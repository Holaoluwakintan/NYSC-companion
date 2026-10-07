import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as store from '../store';
import { CDS_GROUPS, CDS_SOURCE, CLEARANCE_SOURCE } from '../data/content';
import { Top, Icon, Sources, Footer, confetti, haptic, toast } from '../ui';
import { nextDow, addDays, watTime, watDate, serviceMonths, clearanceStatus, monthLabel, ics, gcalLink, phase } from '../lib/dates.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const short = (d: string) => new Date(watTime(d, 12)).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' });
const RR = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function download(name: string, text: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export default function Cds() {
  const pf = store.get().profile;
  const [, f] = useState(0);
  const now = Date.now(); const today = watDate(now);
  const start = store.campStart();
  const ph = phase(start, now);
  const firstService = addDays(start, 21);
  const day = pf.cdsDay;
  // CDS dates: the last 3 and the next 4 around today (only after camp)
  const dates: string[] = [];
  if (day != null) { const nx = nextDow(day, now); const from = nx > firstService ? nx : nextDow(day, watTime(firstService, 12)); for (let i = -3; i < 4; i++) { const d = addDays(from, i * 7); if (d >= firstService) dates.push(d); } }
  const months = serviceMonths(start, 11);
  const doneMonths = months.filter(m => store.cleared(m)).length;
  const cdsEvent = day != null ? { uid: 'cds', title: 'CDS' + (pf.cdsGroup ? ': ' + pf.cdsGroup : ''), date: nextDow(day, watTime(firstService > today ? firstService : today, 12)), hh: 9, mins: 180, rrule: 'FREQ=WEEKLY;BYDAY=' + RR[day], desc: 'Weekly Community Development Service. Attendance is compulsory. (NYSC Companion)', alarmMin: 720 } : null;
  const firstMonth = months[0] + '-01';
  const clrEvent = { uid: 'clearance', title: 'NYSC monthly clearance', date: firstMonth, hh: 8, mins: 60, rrule: 'FREQ=MONTHLY;BYMONTHDAY=1;COUNT=11', desc: 'Do your monthly clearance at your LGA (check your dashboard for your LGA\'s window). (NYSC Companion)', alarmMin: 60 };
  const exportAll = () => { download('nysc-reminders.ics', ics([...(cdsEvent ? [cdsEvent] : []), clrEvent], Date.now())); toast('Calendar file saved. Open it to add the reminders.'); };
  const notif = async () => {
    if (!('Notification' in window)) { toast('Notifications are not supported on this browser.'); return; }
    const p = await Notification.requestPermission();
    store.setSettings({ notify: p === 'granted' }); f(x => x + 1);
    toast(p === 'granted' ? 'On. You\'ll get a nudge when you open the app on CDS and clearance days.' : 'Notifications are blocked in your browser settings.');
  };
  return <>
    <Top title="CDS & clearance" back />
    <div class="wrap">
      <section class="card">
        <h3>🤝 Your CDS</h3>
        <p class="sub" style={{ marginTop: 4 }}>Group CDS is one day a week, set by your LGA. Pick yours after camp.</p>
        <div class="field"><span>CDS day</span><div class="seg">{[1, 2, 3, 4, 5].map(d => <button key={d} class={day === d ? 'on' : ''} onClick={() => { store.setProfile({ cdsDay: d }); haptic(); }}>{DAYS[d]}</button>)}</div></div>
        <label class="field"><span>CDS group</span><select class="inp" value={pf.cdsGroup || ''} onChange={e => store.setProfile({ cdsGroup: (e.target as HTMLSelectElement).value })}><option value="">Not chosen yet</option>{CDS_GROUPS.map(g => <option key={g}>{g}</option>)}</select></label>
        {dates.length > 0 && <div class="list" style={{ marginTop: 12 }}>{dates.map(d => { const past = d < today, isToday = d === today; const on = store.attended(d); return <div key={d} class="li">
          <div class="grow"><div class="t">{short(d)} {isToday && <span class="badge info">Today</span>}</div><div class="tiny">{past || isToday ? (on ? 'Attended' : 'Did you attend?') : 'Upcoming'}</div></div>
          {(past || isToday) && <button class={'ck' + (on ? ' on' : '')} style={{ width: 'auto', padding: 4 }} role="checkbox" aria-checked={on} aria-label={'Attended CDS ' + d} onClick={() => { store.setCds(d, !on); haptic(); }}><span class="box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span></button>}
        </div>; })}</div>}
        <Sources src={[CDS_SOURCE]} />
      </section>
      <section class="card">
        <div class="row"><h3 class="grow">🪪 Monthly clearance</h3><span class="badge ok">{doneMonths}/{months.length}</span></div>
        <p class="sub" style={{ marginTop: 4 }}>Clearance confirms you are at your PPA; without it you may not be paid for that month. Most LGAs run it in the first days of the month, and your dashboard shows your LGA's window.</p>
        <div class="list" style={{ marginTop: 8 }}>{months.map(m => { const st = clearanceStatus(m, store.cleared(m), now); return <div key={m} class="li">
          <div class="grow"><div class="t">{monthLabel(m)}</div></div>
          <span class={'badge ' + (st === 'done' ? 'ok' : st === 'due' ? 'warn' : st === 'upcoming' ? 'mute' : 'bad')}>{st === 'done' ? 'Cleared' : st === 'due' ? 'Due now' : st === 'upcoming' ? 'Upcoming' : st === 'late' ? 'Late' : 'Missed?'}</span>
          {st !== 'upcoming' && <button class={'ck' + (st === 'done' ? ' on' : '')} style={{ width: 'auto', padding: 4 }} role="checkbox" aria-checked={st === 'done'} aria-label={'Cleared ' + m} onClick={(e) => { const was = st === 'done'; store.setClear(m, !was); haptic(); if (!was) { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); confetti(r.left + 16, r.top + 16, 18); } }}><span class="box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span></button>}
        </div>; })}</div>
        <Sources src={[CLEARANCE_SOURCE]} />
      </section>
      <section class="card">
        <h3>⏰ Reminders</h3>
        <p class="sub" style={{ marginTop: 4 }}>Add them to your phone's calendar so they ring even when the app is closed.</p>
        <button class="btn" style={{ marginTop: 12 }} onClick={exportAll}><Icon n="cal" size={20} />Add all to my calendar (.ics)</button>
        <div class="grid2" style={{ marginTop: 10 }}>
          {cdsEvent ? <a class="btn ghost sm" style={{ width: '100%' }} href={gcalLink(cdsEvent)} target="_blank" rel="noopener">CDS · Google Cal</a> : <button class="btn ghost sm" style={{ width: '100%' }} disabled>Pick a CDS day</button>}
          <a class="btn ghost sm" style={{ width: '100%' }} href={gcalLink(clrEvent)} target="_blank" rel="noopener">Clearance · Google Cal</a>
        </div>
        <button class="btn ghost" style={{ marginTop: 10 }} onClick={notif}><Icon n="bell" size={20} />{store.getSettings().notify ? 'App nudges are on ✓' : 'Also nudge me when I open the app'}</button>
        {ph.kind === 'before' && <p class="tiny" style={{ marginTop: 8 }}>Your first clearance is expected in {monthLabel(months[0])}.</p>}
        {day != null && <p class="tiny" style={{ marginTop: 6 }}>CDS every {FULL[day]} at 9:00 am, with a reminder the evening before.</p>}
      </section>
      <Footer />
    </div>
  </>;
}
