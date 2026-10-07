import test from 'node:test'; import assert from 'node:assert/strict';
import { watTime, watDate, countdown, phase, nextDow, serviceMonths, clearanceStatus, ics, gcalLink, monthTotals, naira, addDays } from '../src/lib/dates.js';
test('WAT is UTC+1', () => { assert.equal(new Date(watTime('2026-11-04', 7)).toISOString(), '2026-11-04T06:00:00.000Z'); assert.equal(watDate(Date.parse('2026-11-03T23:30:00Z')), '2026-11-04'); });
test('countdown to camp from Oct 7 2026 noon WAT', () => {
  const c = countdown(watTime('2026-11-04', 7), watTime('2026-10-07', 12));
  assert.equal(c.d, 27); assert.equal(c.h, 19); assert.equal(c.done, false);
  assert.equal(countdown(1, 2).done, true);
});
test('phase: before, in camp, service, done', () => {
  assert.deepEqual(phase('2026-11-04', watTime('2026-11-03', 12)), { kind: 'before', days: 1 });
  assert.equal(phase('2026-11-04', watTime('2026-11-04', 9)).day, 1);
  assert.equal(phase('2026-11-04', watTime('2026-11-24', 9)).day, 21);
  assert.deepEqual(phase('2026-11-04', watTime('2026-12-10', 9)), { kind: 'service', month: 1 });
  assert.equal(phase('2026-11-04', watTime('2028-01-10', 9)).kind, 'done');
});
test('next CDS day', () => { // Oct 7 2026 is a Wednesday
  assert.equal(nextDow(3, watTime('2026-10-07', 10)), '2026-10-07');
  assert.equal(nextDow(4, watTime('2026-10-07', 10)), '2026-10-08');
  assert.equal(nextDow(1, watTime('2026-10-07', 10)), '2026-10-12');
});
test('service months start the month after camp closes', () => { const m = serviceMonths('2026-11-04', 11); assert.equal(m[0], '2026-12'); assert.equal(m[10], '2027-10'); assert.equal(m.length, 11); assert.equal(addDays('2026-11-04', 20), '2026-11-24'); });
test('clearance status', () => {
  const now = watTime('2027-01-05', 10);
  assert.equal(clearanceStatus('2027-01', false, now), 'due'); assert.equal(clearanceStatus('2027-01', true, now), 'done');
  assert.equal(clearanceStatus('2026-12', false, now), 'missed'); assert.equal(clearanceStatus('2027-02', false, now), 'upcoming');
  assert.equal(clearanceStatus('2027-01', false, watTime('2027-01-15', 10)), 'late');
});
test('ics + google calendar links', () => {
  const t = ics([{ uid: 'cds', title: 'CDS: Health, group', date: '2026-12-02', hh: 9, mins: 180, rrule: 'FREQ=WEEKLY;BYDAY=WE', alarmMin: 720 }], Date.UTC(2026, 9, 7));
  assert.match(t, /BEGIN:VCALENDAR/); assert.match(t, /DTSTART:20261202T080000Z/); assert.match(t, /RRULE:FREQ=WEEKLY;BYDAY=WE/); assert.match(t, /SUMMARY:CDS: Health\\, group/); assert.match(t, /TRIGGER:-PT720M/);
  assert.ok(t.endsWith('\r\n'));
  const g = gcalLink({ uid: 'x', title: 'Clearance', date: '2026-12-01', hh: 8 }); assert.match(g, /dates=20261201T070000Z%2F20261201T080000Z/);
});
test('budget totals', () => {
  const t = monthTotals([{ type: 'in', amt: 77000, date: '2026-12-01' }, { type: 'out', amt: 15000, cat: 'rent', date: '2026-12-03' }, { type: 'out', amt: 2000, cat: 'rent', date: '2026-12-09' }, { type: 'out', amt: 999, cat: 'food', date: '2027-01-01' }, { type: 'out', amt: 50, cat: 'food', date: '2026-12-02', del: true }], '2026-12');
  assert.deepEqual(t, { in: 77000, out: 17000, left: 60000, byCat: { rent: 17000 } });
  assert.equal(naira(77000), '₦77,000');
});
