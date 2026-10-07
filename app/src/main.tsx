import { render, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { lazy, Suspense } from 'preact/compat';
import './styles.css';
import * as store from './store';
import * as auth from './auth';
import { Icon, ToastHost, Skeleton } from './ui';
import Home from './pages/Home';
import { notifyIfDue } from './remind';

const pages: Record<string, any> = {
  checklist: lazy(() => import('./pages/Checklist')),
  camps: lazy(() => import('./pages/Camps')),
  timeline: lazy(() => import('./pages/Timeline')),
  money: lazy(() => import('./pages/Money')),
  guides: lazy(() => import('./pages/Guides')),
  faq: lazy(() => import('./pages/Faq')),
  cds: lazy(() => import('./pages/Cds')),
  ask: lazy(() => import('./pages/Ask')),
  card: lazy(() => import('./pages/Card')),
  me: lazy(() => import('./pages/Me')),
  more: lazy(() => import('./pages/More')),
  about: lazy(() => import('./pages/About')),
  privacy: lazy(() => import('./pages/About')),
};

export function parse(hash: string) {
  const [path, qs] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  return { name: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : '', q: new URLSearchParams(qs || '') };
}

function applyTheme() {
  const t = store.getSettings().theme;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#07120c' : '#f5f7f5');
}

const NAV = [['', 'home', 'Home'], ['checklist', 'check', 'Checklist'], ['ask', 'spark', 'Ask AI'], ['money', 'wallet', 'Money'], ['more', 'grid', 'More']];

function App() {
  const [r, setR] = useState(parse(location.hash));
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => { setR(parse(location.hash)); scrollTo(0, 0); };
    addEventListener('hashchange', f);
    const u1 = store.subscribe(() => { applyTheme(); force(x => x + 1); });
    const u2 = auth.subscribe(() => force(x => x + 1));
    const mq = matchMedia('(prefers-color-scheme: dark)'); const mf = () => applyTheme(); mq.addEventListener && mq.addEventListener('change', mf);
    return () => { removeEventListener('hashchange', f); u1(); u2(); };
  }, []);
  const P = pages[r.name];
  const navKey = r.name === 'privacy' || r.name === 'about' || r.name === 'me' || ['camps', 'timeline', 'guides', 'faq', 'cds', 'card'].includes(r.name) ? 'more' : r.name;
  return <>
    <main key={r.name + '/' + r.arg} class="page">
      {P ? <Suspense fallback={<Skeleton />}><P arg={r.arg} q={r.q} route={r.name} /></Suspense> : <Home />}
    </main>
    <nav class="nav" aria-label="Main">
      {NAV.map(([k, ic, label]) => <a key={k} href={'#/' + k} class={(navKey === k ? 'on' : '') + (k === 'ask' ? ' ask' : '')} aria-current={navKey === k ? 'page' : undefined}><Icon n={ic} /><span>{label}</span></a>)}
    </nav>
    <ToastHost />
  </>;
}

(async () => {
  applyTheme();
  try { await auth.handleRedirect(); } catch { /* */ }
  const root = document.getElementById('app')!; root.textContent = '';
  render(<App />, root);
  auth.initSync();
  setTimeout(notifyIfDue, 2500);
  if ('serviceWorker' in navigator && location.hostname !== 'localhost') addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => null));
})();
