import { h } from 'preact';
import { APP } from '../config';
import { S, CHECKED, DISCLAIMER_AI } from '../data/facts';
import { Top, Footer } from '../ui';

export default function About({ route }: { route: string }) {
  if (route === 'privacy') return <>
    <Top title="Privacy" back />
    <div class="wrap"><section class="card prose">
      <h3>Your data stays yours</h3>
      <p>NYSC Companion works without an account. Your checklist, budget, CDS and clearance records are stored on your phone only.</p>
      <p><b>Optional sign-in:</b> if you sign in with Google, we store your name, email and app data (checklist, budget, reminders) in a private database so you can restore it on another phone. Only you can read it. You can delete it any time from Me & settings.</p>
      <p><b>Ask Corper Guide:</b> your question is sent to Google's Gemini AI to write an answer. Don't share private details such as your state code, phone number or bank details. We keep a daily count per device to prevent abuse, not your questions.</p>
      <p>No ads or trackers are active. {APP.disclaimer}</p>
      <p class="tiny">Last updated {CHECKED}.</p>
    </section><Footer /></div>
  </>;
  const all = Object.values(S);
  return <>
    <Top title="About & sources" back />
    <div class="wrap">
      <section class="card prose">
        <h3>About {APP.name}</h3>
        <p>A free, independent companion for Nigerian corps members: before camp, in camp and through the service year. Built to work offline on any Android phone.</p>
        <p><b>{APP.disclaimer}</b> For official information, use the NYSC website and portal, your call-up letter and your camp officials.</p>
        <p>{DISCLAIMER_AI}</p>
      </section>
      <section class="card">
        <h3>Sources (checked {CHECKED})</h3>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0', fontSize: 14 }}>{all.map(s => <li key={s.url} style={{ marginBottom: 6 }}><a href={s.url} target="_blank" rel="noopener">{s.label}</a></li>)}</ul>
        <p class="tiny" style={{ marginTop: 8 }}>Camp guides list their own sources per camp. “Verified” means an official NYSC statement or two independent reputable sources agree.</p>
      </section>
      <Footer />
    </div>
  </>;
}
