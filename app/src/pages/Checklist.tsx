import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as store from '../store';
import { CHECKLIST, DONT_BRING } from '../data/content';
import { Top, Ring, Icon, Sheet, Footer, confetti, haptic, toast } from '../ui';
import { checklistPct } from './Home';

export default function Checklist() {
  const [f, setF] = useState<'all' | 'todo' | 'done'>('all');
  const [add, setAdd] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const ck = checklistPct();
  const toggle = (id: string, e: MouseEvent) => {
    const was = store.checked(id); store.toggleCheck(id); haptic(was ? 5 : 12);
    const p = checklistPct();
    if (!was && p.done === p.total) { confetti(innerWidth / 2, innerHeight / 3, 60); toast('Everything packed. Safe journey to camp! 🎒'); }
    else if (!was) { const r = (e.currentTarget as HTMLElement).querySelector('.box')!.getBoundingClientRect(); if (Math.random() < .35) confetti(r.left + 13, r.top + 13, 10); }
  };
  const share = async () => {
    const lines = CHECKLIST.map(g => g.emoji + ' ' + g.title + '\n' + g.items.map(i => (store.checked(i.id) ? '✅ ' : '⬜ ') + i.label).join('\n')).join('\n\n');
    const text = 'My NYSC camp checklist (' + ck.done + '/' + ck.total + ' packed)\n\n' + lines + '\n\nMade with NYSC Companion: ' + location.origin;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { return; } }
    location.href = 'https://wa.me/?text=' + encodeURIComponent(text);
  };
  return <>
    <Top title="Camp checklist" right={<button class="iconbtn" aria-label="Share checklist" onClick={share}><Icon n="share" /></button>} />
    <div class="wrap">
      <div class="card row">
        <Ring pct={ck.pct} size={78} stroke={8} />
        <div class="grow"><h3>{ck.done === ck.total ? 'Fully packed 🎉' : `${ck.total - ck.done} items to go`}</h3><div class="sub">{ck.done} of {ck.total} ticked. Tap an item to tick it.</div></div>
      </div>
      <div class="seg" style={{ marginTop: 14 }}>
        {(['all', 'todo', 'done'] as const).map(k => <button key={k} class={f === k ? 'on' : ''} onClick={() => setF(k)}>{k === 'all' ? 'All' : k === 'todo' ? 'To pack' : 'Packed'}</button>)}
      </div>
      {CHECKLIST.map(g => {
        const items = [...g.items.map(i => ({ ...i, custom: false })), ...store.customs(g.id).map(([id, c]) => ({ id, label: c.label, must: false, note: '', custom: true }))]
          .filter(i => f === 'all' || (f === 'done') === store.checked(i.id));
        const done = [...g.items.map(i => i.id), ...store.customs(g.id).map(([id]) => id)].filter(id => store.checked(id)).length;
        const total = g.items.length + store.customs(g.id).length;
        return <section key={g.id} class="card">
          <div class="row"><div style={{ fontSize: 24 }}>{g.emoji}</div><h3 class="grow">{g.title}</h3><span class={'badge ' + (done === total ? 'ok' : 'mute')}>{done}/{total}</span></div>
          <div class="prog" style={{ margin: '10px 0 4px' }}><i style={{ width: (100 * done / total) + '%' }} /></div>
          <div class="list">
            {items.map(i => <div key={i.id} class="row">
              <button class={'ck grow' + (store.checked(i.id) ? ' on' : '')} role="checkbox" aria-checked={store.checked(i.id)} onClick={(e) => toggle(i.id, e as any)}>
                <span class="box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                <span class="grow"><span class="t">{i.label}</span>{i.must && <span class="must">MUST</span>}{i.note && <div class="tiny">{i.note}</div>}</span>
              </button>
              {i.custom && <button class="iconbtn" style={{ width: 34, height: 34, background: 'none' }} aria-label={'Remove ' + i.label} onClick={() => { store.delCustom(i.id); toast('Removed'); }}><Icon n="trash" size={18} /></button>}
            </div>)}
            {!items.length && <div class="tiny" style={{ padding: '12px 2px' }}>{f === 'done' ? 'Nothing ticked here yet.' : 'All packed here ✅'}</div>}
          </div>
          <button class="btn ghost sm" style={{ marginTop: 10 }} onClick={() => { setAdd(g.id); setLabel(''); }}><Icon n="plus" size={18} />Add item</button>
          {(g.sourceNote || g.source) && <p class="src">{g.source && <>Source: <a href={g.source.url} target="_blank" rel="noopener">{g.source.label}</a>. </>}{g.sourceNote}</p>}
        </section>;
      })}
      <section class="card">
        <h3>🚫 Leave these at home</h3>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: 'var(--ink2)' }}>{DONT_BRING.map(d => <li key={d}>{d}</li>)}</ul>
      </section>
      <p class="src" style={{ padding: '0 4px' }}>This checklist is general guidance from NYSC camp instructions and past corpers. Your call-up letter and camp officials have the final word.</p>
      <Footer />
    </div>
    <Sheet label="Add item" open={!!add} onClose={() => setAdd(null)}>
      <h3 style={{ fontSize: 19 }}>Add your own item</h3>
      <form onSubmit={e => { e.preventDefault(); if (label.trim()) { store.addCustom(label.trim().slice(0, 80), add!); setAdd(null); haptic(); } }}>
        <input class="inp" style={{ marginTop: 12 }} value={label} onInput={e => setLabel((e.target as HTMLInputElement).value)} placeholder="e.g. Extension box" autoFocus maxLength={80} />
        <button class="btn" style={{ marginTop: 12 }} disabled={!label.trim()}>Add</button>
      </form>
    </Sheet>
  </>;
}
