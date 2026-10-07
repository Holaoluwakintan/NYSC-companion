// Pure date helpers (West Africa Time = UTC+1, no DST). Unit-tested in test/dates.test.mjs.
export const WAT = 60 * 60 * 1000;
export const DAY = 86400000;
/** epoch ms of a WAT wall-clock date "YYYY-MM-DD" at hh:mm */
export function watTime(date, hh = 0, mm = 0) { const [y, m, d] = date.split('-').map(Number); return Date.UTC(y, m - 1, d, hh, mm) - WAT; }
/** "YYYY-MM-DD" of an epoch ms in WAT */
export function watDate(ms) { const d = new Date(ms + WAT); return d.toISOString().slice(0, 10); }
export function watDow(ms) { return new Date(ms + WAT).getUTCDay(); }
export function addDays(date, n) { return watDate(watTime(date, 12) + n * DAY); }
export function daysBetween(a, b) { return Math.round((watTime(b, 12) - watTime(a, 12)) / DAY); }

/** countdown parts to a target ms */
export function countdown(target, now) {
  let s = Math.max(0, Math.floor((target - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
  return { d, h, m, s, done: target <= now };
}

/** where the corper is in the year: before camp, in camp (day n of 21), or after camp (month n of service) */
export function phase(campStart, now, campDays = 21) {
  const start = watTime(campStart, 0);
  if (now < start) return { kind: 'before', days: Math.ceil((start - now) / DAY) };
  const day = Math.floor((now - start) / DAY) + 1;
  if (day <= campDays) return { kind: 'camp', day, of: campDays };
  const end = watTime(campStart, 0) + campDays * DAY;
  const months = Math.floor((now - end) / (30.44 * DAY)) + 1;
  if (months > 12) return { kind: 'done', month: months };
  return { kind: 'service', month: months };
}

/** next date (YYYY-MM-DD, WAT) that falls on weekday dow (0=Sun), today included */
export function nextDow(dow, now) { const today = watDate(now); const diff = (dow - watDow(now) + 7) % 7; return addDays(today, diff); }

/** "YYYY-MM" for a WAT ms */
export function monthKey(ms) { return watDate(ms).slice(0, 7); }
export function monthLabel(key) { const [y, m] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, 15)).toLocaleString('en-NG', { month: 'long', year: 'numeric', timeZone: 'UTC' }); }
/** service months after camp: list of "YYYY-MM" keys from the month after camp closes, for n months */
export function serviceMonths(campStart, n = 11, campDays = 21) {
  const end = addDays(campStart, campDays);
  let [y, m] = end.split('-').map(Number);
  const out = [];
  for (let i = 0; i < n; i++) { m++; if (m > 12) { m = 1; y++; } out.push(y + '-' + String(m).padStart(2, '0')); }
  return out;
}
/** clearance usually runs in the first days of each month (LGAs set the exact window) */
export function clearanceStatus(key, cleared, now) {
  if (cleared) return 'done';
  const cur = monthKey(now);
  if (key > cur) return 'upcoming';
  if (key < cur) return 'missed';
  const day = Number(watDate(now).slice(8, 10));
  return day <= 10 ? 'due' : 'late';
}

// ---- calendar export ----
const pad = n => String(n).padStart(2, '0');
function icsStamp(ms) { const d = new Date(ms); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
/** events: [{uid, title, date (YYYY-MM-DD), hh, mm, mins, rrule?, desc?, alarmMin?}] */
export function ics(events, stampMs) {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NYSC Companion//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const e of events) {
    const st = watTime(e.date, e.hh || 9, e.mm || 0);
    L.push('BEGIN:VEVENT', 'UID:' + e.uid + '@nysc-companion', 'DTSTAMP:' + icsStamp(stampMs), 'DTSTART:' + icsStamp(st), 'DTEND:' + icsStamp(st + (e.mins || 60) * 60000), 'SUMMARY:' + esc(e.title));
    if (e.desc) L.push('DESCRIPTION:' + esc(e.desc));
    if (e.rrule) L.push('RRULE:' + e.rrule);
    if (e.alarmMin) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(e.title), 'TRIGGER:-PT' + e.alarmMin + 'M', 'END:VALARM');
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n') + '\r\n';
}
/** Google Calendar "add event" link */
export function gcalLink(e) {
  const st = watTime(e.date, e.hh || 9, e.mm || 0); const en = st + (e.mins || 60) * 60000;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: icsStamp(st) + '/' + icsStamp(en), details: e.desc || '', ctz: 'Africa/Lagos' });
  if (e.rrule) q.set('recur', 'RRULE:' + e.rrule);
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

// ---- money ----
export function naira(n) { return '₦' + Math.round(n).toLocaleString('en-NG'); }
/** totals for a month key: { in, out, left, byCat } */
export function monthTotals(list, key) {
  const t = { in: 0, out: 0, left: 0, byCat: {} };
  for (const e of list) {
    if (!e || e.del || !e.date || e.date.slice(0, 7) !== key) continue;
    const a = Math.abs(Number(e.amt) || 0);
    if (e.type === 'in') t.in += a; else { t.out += a; t.byCat[e.cat] = (t.byCat[e.cat] || 0) + a; }
  }
  t.left = t.in - t.out; return t;
}
