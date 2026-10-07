import { h } from 'preact';
import { PPA_TIPS, SAED_AREAS, SAED_STEPS, SAED_SOURCES } from '../data/content';
import { Top, Sources, Footer, AdSlot } from '../ui';

export default function Guides({ arg }: { arg: string }) {
  const tab = arg === 'saed' ? 'saed' : 'ppa';
  return <>
    <Top title={tab === 'saed' ? 'SAED skills guide' : 'PPA tips'} back />
    <div class="wrap">
      <div class="seg"><button class={tab === 'ppa' ? 'on' : ''} onClick={() => (location.hash = '#/guides/ppa')}>🏢 PPA tips</button><button class={tab === 'saed' ? 'on' : ''} onClick={() => (location.hash = '#/guides/saed')}>🛠️ SAED skills</button></div>
      {tab === 'ppa' ? <div class="stagger">
        {PPA_TIPS.map(s => <section key={s.title} class="card"><h3>{s.emoji} {s.title}</h3>
          {s.tips.map(t => <div key={t.t} style={{ marginTop: 12 }}><div style={{ fontWeight: 700 }}>{t.t}</div><div class="sub">{t.d}</div></div>)}</section>)}
        <p class="src" style={{ padding: '0 4px' }}>Practical guidance from corpers' experience. Official rules come from your LGI and the NYSC.</p>
      </div> : <div class="stagger">
        <section class="card"><h3>What is SAED?</h3><p class="sub" style={{ marginTop: 6 }}>Skills Acquisition and Entrepreneurship Development: NYSC's programme that trains corps members in a practical skill in camp and through the service year, so you can earn after POP.</p>
          {SAED_STEPS.map((t, i) => <div key={t.t} class="row" style={{ marginTop: 12, alignItems: 'flex-start' }}><div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--g)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, flex: 'none', fontSize: 14 }}>{i + 1}</div><div><div style={{ fontWeight: 700 }}>{t.t}</div><div class="sub">{t.d}</div></div></div>)}</section>
        <div class="sec"><h2>Skill areas</h2></div>
        <div class="grid2">{SAED_AREAS.map(a => <div key={a.name} class="tile" style={{ minHeight: 0 }}><div class="ic">{a.emoji}</div><div><b>{a.name}</b><small>{a.ideas}</small></div></div>)}</div>
        <section class="card"><h3>💡 How to choose</h3><ul style={{ paddingLeft: 20, margin: '8px 0 0', color: 'var(--ink2)' }}>
          <li>Pick what people around your PPA will pay for every week.</li><li>Prefer low start-up cost: ICT, catering, cosmetology.</li><li>Keep your camp trainer's number and follow up after camp.</li><li>Document your work (photos, clients) from day one.</li></ul></section>
        <Sources src={SAED_SOURCES} note="Skill areas as listed on the NYSC SAED portal and camp announcements; availability varies by state." />
      </div>}
      <AdSlot id="guides" />
      <Footer />
    </div>
  </>;
}
