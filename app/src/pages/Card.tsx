import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as store from '../store';
import { NEXT_CAMP } from '../data/facts';
import { STATES, stateName } from '../data/states';
import { phase, watTime } from '../lib/dates.js';
import { Top, Icon, Footer, toast, haptic } from '../ui';
import { checklistPct } from './Home';

function cardInfo() {
  const pf = store.get().profile; const start = store.campStart(); const ph = phase(start, Date.now());
  const sn = stateName(pf.state); const custom = start !== NEXT_CAMP.start;
  const when = new Date(watTime(start, 12)).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', timeZone: 'Africa/Lagos' });
  const big = ph.kind === 'before' ? String(ph.days) : ph.kind === 'camp' ? 'Day ' + ph.day : ph.kind === 'service' ? 'Month ' + ph.month : 'Done';
  const bigSub = ph.kind === 'before' ? (ph.days === 1 ? 'day to camp' : 'days to camp') : ph.kind === 'camp' ? 'of camp' : ph.kind === 'service' ? 'of service' : 'service year complete';
  return { name: pf.name || 'A proud corper', sn, code: pf.state || '', batch: custom ? 'Corps member' : NEXT_CAMP.label, when, big, bigSub, ck: checklistPct() };
}

async function drawPng(): Promise<Blob> {
  const i = cardInfo(); const W = 1080, H = 1350; const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, W * .6, H); g.addColorStop(0, '#0b8a4f'); g.addColorStop(.6, '#06603a'); g.addColorStop(1, '#043d24'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W, 0, 0, W, 0, 700); rg.addColorStop(0, 'rgba(40,200,120,.55)'); rg.addColorStop(1, 'rgba(40,200,120,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.09)'; for (let yy = 20; yy < H; yy += 36) for (let xx = 20; xx < W; xx += 36) { x.beginPath(); x.arc(xx, yy, 2.2, 0, 7); x.fill(); }
  // flag
  const fx = 80, fy = 90; x.fillStyle = '#008751'; x.fillRect(fx, fy, 40, 80); x.fillStyle = '#fff'; x.fillRect(fx + 40, fy, 40, 80); x.fillStyle = '#008751'; x.fillRect(fx + 80, fy, 40, 80);
  const font = (w: number, s: number) => `${w} ${s}px system-ui, -apple-system, Roboto, sans-serif`;
  x.fillStyle = '#fff'; x.font = font(800, 34); x.fillText('MY CAMP CARD', fx + 150, fy + 52);
  x.font = font(850, 92); wrap(x, i.name, 80, 330, W - 160, 100, 2);
  x.fillStyle = 'rgba(255,255,255,.85)'; x.font = font(600, 44); x.fillText(i.sn ? 'Heading to ' + i.sn + ' camp' : 'Heading to camp', 80, 520);
  x.fillText(i.batch + ' · ' + i.when, 80, 585);
  // big number panel
  roundRect(x, 80, 680, W - 160, 330, 44, 'rgba(255,255,255,.13)');
  x.fillStyle = '#fff'; x.font = font(900, 190); x.fillText(i.big, 130, 900); x.font = font(700, 46); x.fillStyle = 'rgba(255,255,255,.88)'; x.fillText(i.bigSub, 130, 965);
  // checklist bar
  x.font = font(650, 40); x.fillStyle = '#fff'; x.fillText(`Checklist ${i.ck.done}/${i.ck.total} packed`, 80, 1100);
  roundRect(x, 80, 1130, W - 160, 26, 13, 'rgba(255,255,255,.2)'); roundRect(x, 80, 1130, Math.max(26, (W - 160) * i.ck.pct), 26, 13, '#bff5d6');
  x.font = font(700, 36); x.fillStyle = 'rgba(255,255,255,.92)'; x.fillText('NYSC Companion · free corper app', 80, 1240);
  x.font = font(500, 28); x.fillStyle = 'rgba(255,255,255,.65)'; x.fillText(location.host + ' · Not affiliated with the NYSC', 80, 1290);
  return new Promise(r => c.toBlob(b => r(b!), 'image/png'));
}
function roundRect(x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number, fill: string) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); x.fillStyle = fill; x.fill(); }
function wrap(x: CanvasRenderingContext2D, t: string, X: number, Y: number, maxW: number, lh: number, maxLines: number) {
  const words = t.split(' '); let line = '', n = 0;
  for (const w of words) { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { x.fillText(line, X, Y + n * lh); line = w; if (++n >= maxLines) return; } else line = test; }
  x.fillText(line, X, Y + n * lh);
}

export default function Card() {
  const [, f] = useState(0);
  const i = cardInfo();
  const link = location.origin + '/c/' + (i.code || 'NG') + (store.get().profile.name ? '?n=' + encodeURIComponent(store.get().profile.name!) : '');
  const text = `${store.get().profile.name ? 'I\'m' : 'I\'m'} heading to ${i.sn ? i.sn + ' camp' : 'NYSC camp'}${i.big && /\d/.test(i.big) && !i.big.includes(' ') ? ' in ' + i.big + ' days' : ''} 🇳🇬 Get your free camp checklist & countdown: ${link}`;
  const wa = () => { haptic(); location.href = 'https://wa.me/?text=' + encodeURIComponent(text); };
  const img = async () => {
    haptic();
    const b = await drawPng(); const file = new File([b], 'my-camp-card.png', { type: 'image/png' });
    const nav: any = navigator;
    if (nav.canShare && nav.canShare({ files: [file] })) { try { await nav.share({ files: [file], text }); return; } catch { return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'my-camp-card.png'; a.click(); toast('Card saved to your downloads');
  };
  return <>
    <Top title="My Camp card" back />
    <div class="wrap">
      <div class="campcard" aria-label="Your camp card preview">
        <div class="row" style={{ gap: 10 }}><span class="flagdot" style={{ height: 18 }}><i style={{ width: 10 }} /><i style={{ width: 10 }} /><i style={{ width: 10 }} /></span><b style={{ letterSpacing: '.08em', fontSize: 13 }}>MY CAMP CARD</b></div>
        <div style={{ fontSize: 32, fontWeight: 850, marginTop: 26, lineHeight: 1.1, letterSpacing: '-.02em' }}>{i.name}</div>
        <div style={{ opacity: .88, marginTop: 8, fontWeight: 600 }}>{i.sn ? 'Heading to ' + i.sn + ' camp' : 'Heading to camp'}<br />{i.batch} · {i.when}</div>
        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,.13)', borderRadius: 20, padding: '16px 18px' }}>
          <div class="big num">{i.big}</div><div style={{ opacity: .88, fontWeight: 650 }}>{i.bigSub}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 13.5, fontWeight: 650 }}>Checklist {i.ck.done}/{i.ck.total} packed</div>
        <div class="prog" style={{ background: 'rgba(255,255,255,.2)', marginTop: 6 }}><i style={{ width: (i.ck.pct * 100) + '%', background: '#bff5d6' }} /></div>
        <div style={{ marginTop: 12, fontSize: 12, opacity: .7 }}>NYSC Companion · Not affiliated with the NYSC</div>
      </div>
      <label class="field"><span>Name on card</span><input class="inp" value={store.get().profile.name || ''} onInput={e => { store.setProfile({ name: (e.target as HTMLInputElement).value.slice(0, 40) }); f(x => x + 1); }} placeholder="Your first name" /></label>
      <label class="field"><span>Camp state</span><select class="inp" value={store.get().profile.state || ''} onChange={e => { store.setProfile({ state: (e.target as HTMLSelectElement).value }); f(x => x + 1); }}><option value="">Not posted yet</option>{STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
      <button class="btn" style={{ marginTop: 16, background: '#25d366', boxShadow: '0 6px 18px rgba(37,211,102,.35)' }} onClick={wa}><Icon n="share" size={20} />Share on WhatsApp</button>
      <button class="btn ghost" style={{ marginTop: 10 }} onClick={img}>Share as image</button>
      <p class="tiny" style={{ marginTop: 10, textAlign: 'center' }}>The WhatsApp link shows a preview card of your camp state.</p>
      <Footer />
    </div>
  </>;
}
