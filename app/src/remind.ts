// In-app reminders: when the app opens on a CDS day or during the clearance window, show one local notification per day.
// (No push server: real alarms come from the calendar export on the CDS screen.)
import * as store from './store';
import { watDate, watDow, monthKey, clearanceStatus, phase } from './lib/dates.js';

export function dueToday(now = Date.now()): string[] {
  const s = store.get(); const pf = s.profile; const out: string[] = [];
  const ph = phase(store.campStart(), now);
  if (ph.kind === 'service' || ph.kind === 'camp') {
    if (pf.cdsDay != null && watDow(now) === pf.cdsDay && ph.kind === 'service') out.push('Today is your CDS day' + (pf.cdsGroup ? ' (' + pf.cdsGroup + ')' : '') + '. Don\'t miss it!');
    const mk = monthKey(now); const st = clearanceStatus(mk, store.cleared(mk), now);
    if (ph.kind === 'service' && (st === 'due' || st === 'late')) out.push('Monthly clearance: have you done ' + new Date(now).toLocaleString('en-NG', { month: 'long' }) + '\'s yet?');
  }
  return out;
}
export async function notifyIfDue() {
  const set = store.getSettings(); const today = watDate(Date.now());
  if (!set.notify || set.lastNotified === today || !('Notification' in window) || Notification.permission !== 'granted') return;
  const msgs = dueToday(); if (!msgs.length) return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const body = msgs.join('\n');
    if (reg) await reg.showNotification('NYSC Companion', { body, icon: '/icons/icon-192.png', badge: '/icons/badge-96.png', tag: 'daily' });
    else new Notification('NYSC Companion', { body, icon: '/icons/icon-192.png' });
    store.setSettings({ lastNotified: today });
  } catch { /* */ }
}
