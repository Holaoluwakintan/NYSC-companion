import test from 'node:test'; import assert from 'node:assert/strict';
import { merge, same, blank, setFlag, isFlagOn, normalize } from '../src/lib/sync-core.js';
test('flags: newer toggle wins on both sides', () => {
  const a = { ...blank(), check: { callup: 100, padlock: -300 } };
  const b = { ...blank(), check: { callup: -200, padlock: 250, nin: 50 } };
  const m = merge(a, b);
  assert.equal(isFlagOn(m.check, 'callup'), false); // unticked later on b
  assert.equal(isFlagOn(m.check, 'padlock'), false); // unticked later on a
  assert.equal(isFlagOn(m.check, 'nin'), true);
});
test('records: tombstones and newer edits win, merge is symmetric', () => {
  const a = { ...blank(), budget: { x: { type: 'out', amt: 500, cat: 'food', date: '2026-12-01', ts: 10 }, y: { type: 'in', amt: 77000, cat: 'Allawee', date: '2026-12-01', ts: 5 } } };
  const b = { ...blank(), budget: { x: { type: 'out', amt: 500, cat: 'food', date: '2026-12-01', ts: 20, del: true }, z: { type: 'out', amt: 100, cat: 'data', date: '2026-12-02', ts: 7 } } };
  const m1 = merge(a, b), m2 = merge(b, a);
  assert.equal(m1.budget.x.del, true); assert.ok(m1.budget.y); assert.ok(m1.budget.z);
  assert.ok(same(m1, m2));
});
test('profile: last edit wins; merge is idempotent', () => {
  const a = { ...blank(), profile: { ts: 5, name: 'Ada', state: 'LA' } };
  const b = { ...blank(), profile: { ts: 9, name: 'Ada O', state: 'KW' } };
  const m = merge(a, b); assert.equal(m.profile.state, 'KW');
  assert.ok(same(merge(m, b), m)); assert.ok(same(merge(m, m), m));
});
test('normalize tolerates junk', () => { const n = normalize({ check: 'x', budget: null }); assert.deepEqual(n.check, {}); assert.deepEqual(n.budget, {}); assert.deepEqual(normalize(null), blank()); });
test('setFlag signs the timestamp', () => { const m = setFlag({}, 'a', true, 7); assert.equal(m.a, 7); assert.equal(setFlag(m, 'a', false, 8).a, -8); });
