import { h, type ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { APP, FLAGS } from './config';
import type { Src } from './data/facts';

const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  check: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',
  wallet: 'M3 7a2 2 0 0 1 2-2h12v4M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 7h16a1 1 0 0 1 1 1v3m0 0h-4a2 2 0 0 0 0 4h4',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  back: 'M15 18l-6-6 6-6',
  chev: 'M9 6l6 6-6 6',
  pin: 'M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3',
  share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13',
  plus: 'M12 5v14M5 12h14',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  cal: 'M3 9h18M7 3v4M17 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  x: 'M18 6 6 18M6 6l12 12',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  ext: 'M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
};
export function Icon({ n, size }: { n: string; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size || 24} height={size || 24} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={P[n]} /></svg>;
}

export function Top({ title, back, right }: { title: string; back?: boolean; right?: ComponentChildren }) {
  const [sc, setSc] = useState(false);
  useEffect(() => { const f = () => setSc(scrollY > 4); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  return <header class={'top' + (sc ? ' scrolled' : '')}>
    {back && <button class="iconbtn" aria-label="Back" onClick={() => (history.length > 1 ? history.back() : (location.hash = '#/'))}><Icon n="back" /></button>}
    <h1>{title}</h1>{right}
  </header>;
}

export function Ring({ pct, size = 64, stroke = 7, label, light }: { pct: number; size?: number; stroke?: number; label?: ComponentChildren; light?: boolean }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const [p, setP] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setP(pct)); return () => cancelAnimationFrame(t); }, [pct]);
  return <div class="ring" style={{ width: size, height: size }}>
    <svg width={size} height={size}>
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color={light ? '#fff' : '#0f9d58'} /><stop offset="1" stop-color={light ? '#bff5d6' : '#34d399'} /></linearGradient></defs>
      <circle class="bgc" cx={size / 2} cy={size / 2} r={r} stroke-width={stroke} />
      <circle class="fg" cx={size / 2} cy={size / 2} r={r} stroke-width={stroke} stroke-dasharray={c} stroke-dashoffset={c * (1 - Math.max(0, Math.min(1, p)))} />
    </svg>
    <div class="lab" style={{ fontSize: size > 70 ? 18 : 14 }}>{label ?? Math.round(pct * 100) + '%'}</div>
  </div>;
}

export function Sources({ src, verified, note }: { src?: Src[]; verified?: boolean; note?: string }) {
  if (!src || !src.length) return note ? <p class="src">{note}</p> : null;
  return <p class="src">{verified === true ? <span class="badge ok">✓ Verified</span> : verified === false ? <span class="badge warn">Unverified</span> : null}{' '}
    Source{src.length > 1 ? 's' : ''}: {src.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noopener">{s.label}</a></span>)}{note ? <><br />{note}</> : null}</p>;
}

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ComponentChildren; label?: string }) {
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [open]);
  if (!open) return null;
  return createPortal(<><div class="scrim" onClick={onClose} /><div class="sheet" role="dialog" aria-modal="true" aria-label={label || 'Dialog'}><div class="grab" />{children}</div></>, document.body);
}

let toastSet: ((t: { msg: string; act?: string; fn?: () => void } | null) => void) | null = null;
export function toast(msg: string, act?: string, fn?: () => void) { toastSet && toastSet({ msg, act, fn }); }
export function ToastHost() {
  const [t, setT] = useState<{ msg: string; act?: string; fn?: () => void } | null>(null);
  useEffect(() => { toastSet = setT; }, []);
  useEffect(() => { if (!t) return; const id = setTimeout(() => setT(null), 3600); return () => clearTimeout(id); }, [t]);
  if (!t) return null;
  return <div class="toast" role="status">{t.msg}{t.act && <button onClick={() => { t.fn && t.fn(); setT(null); }}>{t.act}</button>}</div>;
}

export function reduced() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
export function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 26) {
  if (reduced()) return;
  const w = document.createElement('div'); w.className = 'confetti'; w.style.left = x + 'px'; w.style.top = y + 'px';
  const cols = ['#0f9d58', '#34d399', '#ffffff', '#e8b931', '#0a7a45'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    s.style.background = cols[i % cols.length]; s.style.setProperty('--x', Math.cos(a) * d + 'px'); s.style.setProperty('--y', Math.sin(a) * d - 40 + 'px'); s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    if (cols[i % cols.length] === '#ffffff') s.style.boxShadow = '0 0 0 1px rgba(0,0,0,.08)';
    w.appendChild(s);
  }
  document.body.appendChild(w); setTimeout(() => w.remove(), 1000);
}
export function haptic(ms = 10) { try { navigator.vibrate && navigator.vibrate(ms); } catch { /* */ } }

export function Skeleton({ n = 4 }: { n?: number }) {
  return <div class="wrap" aria-busy="true" aria-label="Loading">
    <div class="sk" style={{ height: 30, width: '55%', marginTop: 8 }} />
    {Array.from({ length: n }, (_, i) => <div key={i} class="sk skc" />)}
  </div>;
}

export function Footer() {
  return <footer class="foot"><b>{APP.disclaimer}</b><br />Made with 💚 for corpers · Free & works offline<br /><a href="#/about">About & sources</a> · <a href="#/privacy">Privacy</a></footer>;
}

/** Ad slot hook: renders nothing while FLAGS.ads is off. */
export function AdSlot({ id }: { id: string }) {
  if (!FLAGS.ads) return null;
  return <div class="card adslot" data-slot={id} aria-label="Sponsored" />;
}
export function PremiumTeaser() {
  return <div class="card premium">
    <div class="row"><div style={{ fontSize: 28 }}>👑</div><div class="grow"><h3>Companion Premium</h3><div style={{ opacity: .85, fontSize: 14 }}>PPA & lodge reviews, CV builder for POP, jobs board, WhatsApp alerts.</div></div></div>
    <div style={{ marginTop: 12 }}><span class="badge" style={{ background: 'rgba(255,224,138,.16)', color: '#ffe08a' }}>Coming soon</span></div>
  </div>;
}
