// Optional Google sign-in (Supabase Auth on the Blossom project; data in schema `nysc`, owner-only RLS). Guests never need it.
import * as C from './lib/auth-core.js';
import { merge, same } from './lib/sync-core.js';
import * as store from './store';
import { APP } from './config';

export const SUPA_URL = 'https://rlbrhpjljjgpqpqjrpkc.supabase.co';
export const SUPA_KEY = 'sb_publishable_NT2VXfEUwWEEdcuft2VdDA_9DXSaMq4'; // publishable: safe in the browser, RLS guards data
const env = {
  url: SUPA_URL, key: SUPA_KEY, fetch: (u: string, o?: RequestInit) => fetch(u, o), storage: localStorage,
  now: () => Date.now(), subtle: crypto.subtle, random: (n: number) => crypto.getRandomValues(new Uint8Array(n)),
};
const SYNCED = APP.storageKey + ':synced:v1';
export interface User { id: string; email: string; name: string; avatar: string }
export type SyncState = 'off' | 'syncing' | 'saved' | 'offline' | 'error';
let st: SyncState = 'off';
let lastSynced = +(localStorage.getItem(SYNCED) || 0);
let authError = '';
const subs = new Set<() => void>();
const emit = () => subs.forEach(f => f());
export function subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }
export function user(): User | null { const s = C.loadSession(env); return s ? s.user : null; }
export function syncInfo() { return { state: st, lastSynced, error: authError }; }

let googleOk: boolean | null | undefined;
export async function googleAvailable(): Promise<boolean | null> {
  if (googleOk !== undefined) return googleOk;
  try { const r = await fetch('/api/auth-status'); googleOk = (await r.json()).google; } catch { googleOk = null; }
  return googleOk ?? null;
}
export async function signIn() {
  sessionStorage.setItem(APP.storageKey + ':return', location.hash || '#/');
  location.assign(await C.googleUrl(env, location.origin + '/'));
}
export async function handleRedirect(): Promise<boolean> {
  if (!/[?&](code|error|error_description)=/.test(location.search)) return false;
  const res = await C.handleCallback(env, location.search);
  const back = sessionStorage.getItem(APP.storageKey + ':return') || '#/me';
  history.replaceState(null, '', location.pathname + back);
  if (res && res.error) authError = res.error;
  if (res && res.session) await syncNow();
  emit(); return true;
}
export async function signOut() {
  await pushNow().catch(() => null);
  await C.signOut(env);
  localStorage.removeItem(SYNCED); lastSynced = 0;
  store.reset(); st = 'off'; emit();
}
export async function deleteCloud() { await C.rpc(env, 'nysc_delete_my_data'); await signOut(); }

let busy: Promise<void> | null = null;
export function syncNow(): Promise<void> {
  if (!user()) return Promise.resolve();
  return busy || (busy = (async () => {
    st = 'syncing'; emit();
    try {
      const cloud = await C.rpc(env, 'nysc_get_state');
      const local = store.get();
      const merged = cloud && cloud.data ? merge(local, cloud.data) : local;
      if (!same(merged, local)) store.replace(merged);
      if (!cloud || !cloud.data || !same(merged, cloud.data)) await C.rpc(env, 'nysc_put_state', { p_data: merged });
      lastSynced = Date.now(); localStorage.setItem(SYNCED, String(lastSynced)); st = 'saved';
    } catch (e: any) {
      st = !navigator.onLine ? 'offline' : (e && e.status === 401 ? 'off' : 'error');
    } finally { busy = null; emit(); }
  })());
}
async function pushNow() { if (user()) await C.rpc(env, 'nysc_put_state', { p_data: store.get() }); }
let timer: any = 0;
export function initSync() {
  store.onSave(() => { if (!user()) return; clearTimeout(timer); timer = setTimeout(syncNow, 4000); });
  addEventListener('online', () => syncNow());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) { clearTimeout(timer); timer = 0; syncNow(); } });
  if (user()) syncNow();
}
