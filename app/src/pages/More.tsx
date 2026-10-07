import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Top, Icon, Footer, PremiumTeaser, toast } from '../ui';

let deferred: any = null;
addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); deferred = e; });

const ITEMS: [string, string, string, string][] = [
  ['#/camps', '🏕️', 'Camp guides', 'All 37 orientation camps'],
  ['#/timeline', '🗓️', 'Batch & stream timeline', '2026 dates and your service year'],
  ['#/cds', '🤝', 'CDS planner & clearance', 'Weekly CDS, monthly clearance, reminders'],
  ['#/guides/ppa', '🏢', 'PPA tips', 'Before and after posting'],
  ['#/guides/saed', '🛠️', 'SAED skills guide', 'Pick a skill that pays'],
  ['#/faq', '🧨', 'FAQ & myth busters', 'What corpers get wrong'],
  ['#/card', '🪪', 'My Camp card', 'Share on WhatsApp'],
  ['#/me', '⚙️', 'Me & settings', 'Sync, dark mode, backup'],
  ['#/about', 'ℹ️', 'About & sources', 'Where every fact comes from'],
];

export default function More() {
  const [can, setCan] = useState(!!deferred);
  useEffect(() => { const f = () => setCan(true); addEventListener('beforeinstallprompt', f); return () => removeEventListener('beforeinstallprompt', f); }, []);
  const standalone = matchMedia('(display-mode: standalone)').matches;
  return <>
    <Top title="More" />
    <div class="wrap">
      {!standalone && <section class="card row" style={{ background: 'linear-gradient(120deg,var(--card),var(--gl))' }}>
        <div style={{ fontSize: 30 }}>📲</div><div class="grow"><h3>Install the app</h3><div class="sub">Opens like an app, works offline, no Play Store needed.</div></div>
        <button class="btn sm" onClick={async () => { if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; setCan(false); } else toast('In Chrome: tap ⋮ then “Add to Home screen”.'); }}>{can ? 'Install' : 'How'}</button>
      </section>}
      <div class="card list stagger" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {ITEMS.map(([href, e, t, s]) => <a key={href} class="li" href={href} style={{ color: 'inherit' }}><div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--gl)', display: 'grid', placeItems: 'center', fontSize: 21, flex: 'none' }}>{e}</div><div class="grow"><div class="t">{t}</div><div class="tiny">{s}</div></div><span class="chev"><Icon n="chev" /></span></a>)}
      </div>
      <PremiumTeaser />
      <Footer />
    </div>
  </>;
}
