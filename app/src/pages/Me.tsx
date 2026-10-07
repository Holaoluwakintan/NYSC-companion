import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as store from '../store';
import * as auth from '../auth';
import { NEXT_CAMP } from '../data/facts';
import { STATES } from '../data/states';
import { Top, Icon, Footer, toast } from '../ui';

export default function Me() {
  const u = auth.user(); const si = auth.syncInfo(); const set = store.getSettings(); const pf = store.get().profile;
  const [g, setG] = useState<boolean | null | undefined>(undefined);
  useEffect(() => { auth.googleAvailable().then(setG); }, []);
  const exportData = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(store.get(), null, 1)], { type: 'application/json' })); a.download = 'nysc-companion-backup.json'; a.click(); };
  const importData = (e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; f.text().then(t => { try { store.replace(JSON.parse(t)); toast('Backup restored ✓'); } catch { toast('That file is not a backup.'); } }); };
  return <>
    <Top title="Me & settings" back />
    <div class="wrap">
      <section class="card">
        {u ? <div class="row">{u.avatar ? <img src={u.avatar} width={52} height={52} style={{ borderRadius: 16 }} alt="" referrerpolicy="no-referrer" /> : <div class="ic" style={{ width: 52, height: 52, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'var(--gl)', fontSize: 24 }}>🙂</div>}
          <div class="grow"><h3>{u.name}</h3><div class="tiny">{u.email}</div>
            <div class="tiny" style={{ marginTop: 4 }}>{si.state === 'syncing' ? 'Syncing…' : si.state === 'saved' ? '✓ Synced ' + new Date(si.lastSynced).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : si.state === 'offline' ? 'Offline: will sync when back online' : si.state === 'error' ? 'Sync problem: will retry' : ''}</div></div></div>
          : <><h3>☁️ Back up & sync (optional)</h3><p class="sub" style={{ marginTop: 4 }}>Everything works without an account. Sign in to keep your checklist, budget and reminders if you change phones.</p>
            {g === true && <button class="btn" style={{ marginTop: 12, background: '#fff', color: '#1f2937', border: '1.5px solid var(--line)', boxShadow: 'none' }} onClick={() => auth.signIn()}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Continue with Google</button>}
            {g === false && <p class="tiny" style={{ marginTop: 10 }}>Google sign-in is being switched on. Your data is safe on this phone meanwhile; use Backup below.</p>}
            {g === undefined && <div class="sk" style={{ height: 48, marginTop: 12 }} />}
            {g === null && <p class="tiny" style={{ marginTop: 10 }}>Connect to the internet to sign in.</p>}</>}
        {si.error && <p class="tiny" style={{ color: 'var(--red)', marginTop: 8 }}>{si.error}</p>}
        {u && <div class="grid2"><button class="btn ghost sm" style={{ width: '100%' }} onClick={() => auth.syncNow()}>Sync now</button><button class="btn ghost sm" style={{ width: '100%' }} onClick={() => auth.signOut().then(() => toast('Signed out. Your data stays in your account.'))}>Sign out</button></div>}
      </section>
      <section class="card">
        <h3>🪖 My service</h3>
        <label class="field"><span>First name</span><input class="inp" value={pf.name || ''} onChange={e => store.setProfile({ name: (e.target as HTMLInputElement).value.slice(0, 40) })} /></label>
        <label class="field"><span>State of deployment</span><select class="inp" value={pf.state || ''} onChange={e => store.setProfile({ state: (e.target as HTMLSelectElement).value })}><option value="">Not posted yet</option>{STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
        <label class="field"><span>Camp start date</span><input class="inp" type="date" value={store.campStart()} onChange={e => store.setProfile({ campStart: (e.target as HTMLInputElement).value || NEXT_CAMP.start })} /></label>
        {store.campStart() !== NEXT_CAMP.start && <button class="btn ghost sm" style={{ marginTop: 10 }} onClick={() => store.setProfile({ campStart: NEXT_CAMP.start, batch: NEXT_CAMP.id })}>Reset to {NEXT_CAMP.label} (Nov 4)</button>}
      </section>
      <section class="card">
        <h3>🎨 Appearance</h3>
        <div class="seg" style={{ marginTop: 10 }}>{(['auto', 'light', 'dark'] as const).map(t => <button key={t} class={set.theme === t ? 'on' : ''} onClick={() => store.setSettings({ theme: t })}>{t === 'auto' ? 'Auto' : t === 'light' ? '☀️ Light' : '🌙 Dark'}</button>)}</div>
      </section>
      <section class="card list" style={{ paddingTop: 4, paddingBottom: 4 }}>
        <button class="li" onClick={exportData}><Icon n="share" /><span class="grow t">Download a backup</span></button>
        <label class="li" style={{ cursor: 'pointer' }}><Icon n="plus" /><span class="grow t">Restore a backup</span><input type="file" accept="application/json" class="hide" onChange={importData} /></label>
        <button class="li" onClick={() => { if (confirm('Clear everything on this phone? This cannot be undone.')) { store.reset(); toast('Cleared'); } }}><Icon n="trash" /><span class="grow t" style={{ color: 'var(--red)' }}>Clear data on this phone</span></button>
        {u && <button class="li" onClick={() => { if (confirm('Delete your synced data from the cloud and sign out?')) auth.deleteCloud().then(() => toast('Cloud data deleted')).catch(() => toast('Could not delete: try again online')); }}><Icon n="x" /><span class="grow t" style={{ color: 'var(--red)' }}>Delete my cloud data</span></button>}
      </section>
      <Footer />
    </div>
  </>;
}
