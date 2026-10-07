import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as store from '../store';
import { ALLOWANCE } from '../data/facts';
import { Top, Icon, Sheet, Sources, Footer, toast, haptic, AdSlot } from '../ui';
import { naira, monthTotals, monthKey, monthLabel, watDate } from '../lib/dates.js';

export const CATS: [string, string, string][] = [
  ['food', '🍛', '#0f9d58'], ['rent', '🏠', '#2f6fde'], ['transport', '🚌', '#e8a400'], ['data', '📶', '#8b5cf6'],
  ['savings', '🏦', '#0ea5a4'], ['family', '👪', '#ec4899'], ['kits', '👕', '#64748b'], ['other', '✨', '#f97316'],
];
const INCOME = ['Allawee', 'PPA pay', 'State allowance', 'Side hustle', 'Gift'];
const catOf = (c: string) => CATS.find(x => x[0] === c) || CATS[7];

function shiftMonth(k: string, n: number) { let [y, m] = k.split('-').map(Number); m += n; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } return y + '-' + String(m).padStart(2, '0'); }

export default function Money() {
  const [mk, setMk] = useState(monthKey(Date.now()));
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'out' | 'in'>('out');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(watDate(Date.now()));
  const all = store.entries();
  const list = all.filter(([, e]) => e.date.slice(0, 7) === mk);
  const t = monthTotals(all.map(([, e]) => e), mk);
  const pctLeft = t.in ? Math.max(0, t.left) / t.in : 0;
  const save = () => {
    const a = Math.round(Number(amt.replace(/[^0-9.]/g, '')));
    if (!a) return;
    store.addEntry({ type, amt: a, cat: type === 'in' ? (note || 'Income') : cat, note: type === 'in' ? '' : note.trim().slice(0, 60), date });
    setOpen(false); setAmt(''); setNote(''); haptic(); toast(type === 'in' ? 'Income added 💰' : 'Expense added');
  };
  const quickAllawee = () => { store.addEntry({ type: 'in', amt: ALLOWANCE.amount, cat: 'Allawee', date: mk === monthKey(Date.now()) ? watDate(Date.now()) : mk + '-01' }); haptic(); toast('Allawee added: ' + naira(ALLOWANCE.amount)); };
  const del = (id: string) => { store.delEntry(id); toast('Deleted', 'Undo', () => store.restoreEntry(id)); };
  return <>
    <Top title="Allawee & budget" />
    <div class="wrap">
      <section class="hero">
        <div class="eyebrow">💸 Monthly federal allowance</div>
        <h2 class="num" style={{ fontSize: 38 }}>{naira(ALLOWANCE.amount)}</h2>
        <p>Same in every state. Some states and PPAs add their own stipend.</p>
        <div class="meta"><span class="pill">✓ Verified {ALLOWANCE.checked}</span></div>
      </section>
      <Sources src={ALLOWANCE.sources} note={ALLOWANCE.text} />
      <div class="row" style={{ margin: '18px 2px 0' }}>
        <button class="iconbtn" aria-label="Previous month" onClick={() => setMk(shiftMonth(mk, -1))}><Icon n="back" /></button>
        <h2 class="grow" style={{ textAlign: 'center', fontSize: 18 }}>{monthLabel(mk)}</h2>
        <button class="iconbtn" aria-label="Next month" onClick={() => setMk(shiftMonth(mk, 1))}><Icon n="chev" /></button>
      </div>
      <div class="card">
        <div class="row" style={{ alignItems: 'flex-end' }}>
          <div class="grow"><div class="tiny">Left this month</div><div class="num" style={{ fontSize: 30, fontWeight: 800, color: t.left < 0 ? 'var(--red)' : undefined }}>{naira(t.left)}</div></div>
          <div style={{ textAlign: 'right' }}><div class="tiny">In {naira(t.in)}</div><div class="tiny">Out {naira(t.out)}</div></div>
        </div>
        <div class="bar"><i style={{ width: (pctLeft * 100) + '%', background: pctLeft < .2 ? 'var(--red)' : 'linear-gradient(90deg,#0f9d58,#34d399)' }} /></div>
        {!t.in && <button class="btn sm" style={{ marginTop: 12 }} onClick={quickAllawee}>+ Add this month's allawee ({naira(ALLOWANCE.amount)})</button>}
        {t.in > 0 && t.left < t.in * .2 && <p class="tiny" style={{ marginTop: 8, color: 'var(--amber)' }}>Under 20% left. Slow down on spending till the next alert. 🙏</p>}
      </div>
      {t.out > 0 && <div class="card">
        <h3>Where it went</h3>
        {Object.entries(t.byCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => { const [, e, col] = catOf(c); return <div key={c} style={{ marginTop: 10 }}>
          <div class="row"><span>{e}</span><span class="grow" style={{ textTransform: 'capitalize', fontWeight: 600 }}>{c}</span><span class="num">{naira(v)}</span></div>
          <div class="bar"><i style={{ width: (100 * v / t.out) + '%', background: col }} /></div></div>; })}
      </div>}
      <div class="sec"><h2>Transactions</h2></div>
      <div class="card list" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {list.map(([id, e]) => { const [, em] = catOf(e.cat); return <div key={id} class="li">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--chip)', display: 'grid', placeItems: 'center', fontSize: 20, flex: 'none' }}>{e.type === 'in' ? '💰' : em}</div>
          <div class="grow"><div class="t" style={{ textTransform: 'capitalize' }}>{e.type === 'in' ? e.cat : (e.note || e.cat)}</div><div class="tiny">{new Date(e.date + 'T12:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}{e.type === 'out' && e.note ? ' · ' + e.cat : ''}</div></div>
          <div class="num" style={{ fontWeight: 700, color: e.type === 'in' ? 'var(--g3)' : undefined }}>{e.type === 'in' ? '+' : '−'}{naira(e.amt)}</div>
          <button class="iconbtn" style={{ width: 34, height: 34, background: 'none' }} aria-label="Delete" onClick={() => del(id)}><Icon n="trash" size={18} /></button></div>; })}
        {!list.length && <div class="empty"><div class="e">🧾</div>No transactions in {monthLabel(mk)} yet.<br />Tap + to add one.</div>}
      </div>
      <AdSlot id="money" />
      <Footer />
    </div>
    <button class="fab" aria-label="Add transaction" onClick={() => { setOpen(true); setDate(mk === monthKey(Date.now()) ? watDate(Date.now()) : mk + '-01'); }}><Icon n="plus" /></button>
    <Sheet label="Add transaction" open={open} onClose={() => setOpen(false)}>
      <div class="seg"><button class={type === 'out' ? 'on' : ''} onClick={() => setType('out')}>Expense</button><button class={type === 'in' ? 'on' : ''} onClick={() => { setType('in'); setNote('Allawee'); }}>Income</button></div>
      <label class="field"><span>Amount (₦)</span><input class="inp num" inputMode="numeric" value={amt} onInput={e => setAmt((e.target as HTMLInputElement).value)} placeholder="0" style={{ fontSize: 24, fontWeight: 800, height: 56 }} autoFocus /></label>
      {type === 'out' ? <>
        <div class="field"><span>Category</span><div class="chips" style={{ flexWrap: 'wrap', margin: 0, padding: 0 }}>{CATS.map(([c, e]) => <button key={c} class={'chip' + (cat === c ? ' on' : '')} style={{ textTransform: 'capitalize' }} onClick={() => setCat(c)}>{e} {c}</button>)}</div></div>
        <label class="field"><span>Note (optional)</span><input class="inp" value={note} onInput={e => setNote((e.target as HTMLInputElement).value)} placeholder="e.g. Bus to PPA" maxLength={60} /></label>
      </> : <div class="field"><span>Source</span><div class="chips" style={{ flexWrap: 'wrap', margin: 0, padding: 0 }}>{INCOME.map(c => <button key={c} class={'chip' + (note === c ? ' on' : '')} onClick={() => { setNote(c); if (c === 'Allawee' && !amt) setAmt(String(ALLOWANCE.amount)); }}>{c}</button>)}</div></div>}
      <label class="field"><span>Date</span><input class="inp" type="date" value={date} onInput={e => setDate((e.target as HTMLInputElement).value)} /></label>
      <button class="btn" style={{ marginTop: 16 }} onClick={save} disabled={!Number(amt.replace(/[^0-9.]/g, ''))}>Save</button>
    </Sheet>
  </>;
}
