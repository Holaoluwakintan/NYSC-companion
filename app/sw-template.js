// NYSC Companion service worker: precache the app shell + data, network-first for HTML, cache-first for assets, never cache /api.
const V = 'nysc-__VERSION__';
const PRE = __PRECACHE__;
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/c/')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('/', cp)); return res; }).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: u.pathname.startsWith('/data/') }).then(hit => hit || fetch(r).then(res => { if (res.ok && (u.pathname.startsWith('/assets/') || u.pathname.startsWith('/data/') || u.pathname.startsWith('/icons/'))) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('/#/cds'))); });
