import { h } from 'preact';
import { useState } from 'preact/hooks';
import { FAQ } from '../data/content';
import { Top, Sources, Footer, Icon } from '../ui';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [only, setOnly] = useState(false);
  const list = FAQ.map((f, i) => ({ ...f, i })).filter(f => !only || f.myth);
  return <>
    <Top title="FAQ & myth busters" back />
    <div class="wrap">
      <div class="seg"><button class={!only ? 'on' : ''} onClick={() => setOnly(false)}>All questions</button><button class={only ? 'on' : ''} onClick={() => setOnly(true)}>🧨 Myths only</button></div>
      <div class="stagger">
        {list.map(f => <section key={f.i} class="card" style={{ padding: 0, overflow: 'hidden' }}>
          <button class="li" style={{ padding: 16 }} aria-expanded={open === f.i} onClick={() => setOpen(open === f.i ? null : f.i)}>
            {f.myth ? <span class="badge bad">MYTH</span> : <span class="badge info">FAQ</span>}
            <span class="grow t">{f.q}</span>
            <span class="chev" style={{ transform: open === f.i ? 'rotate(90deg)' : 'none', transition: 'transform .25s' }}><Icon n="chev" /></span>
          </button>
          {open === f.i && <div style={{ padding: '0 16px 16px', animation: 'rise .3s both' }}>
            {f.myth && <div style={{ fontWeight: 800, color: 'var(--g3)', marginBottom: 4 }}>✅ The facts</div>}
            <div class="sub" style={{ color: 'var(--ink)' }}>{f.a}</div>
            <Sources src={f.src} verified={f.src ? f.verified : undefined} />
          </div>}
        </section>)}
      </div>
      <a class="card row" href="#/ask" style={{ color: 'inherit' }}><div style={{ fontSize: 24 }}>✨</div><div class="grow"><h3>Still unsure?</h3><div class="sub">Ask Corper Guide anything.</div></div><Icon n="chev" /></a>
      <Footer />
    </div>
  </>;
}
