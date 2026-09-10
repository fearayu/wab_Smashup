// Concurrency: two "simultaneous" requests for the same court + time must not both succeed.
// In Node there is no Web Locks API, so the domain layer falls back to reading the latest
// records and re-validating before every write — deterministic here. In a real browser,
// Web Locks (`navigator.locks`) additionally serializes writes across tabs of one origin.
const assert = require('node:assert/strict');
Object.defineProperty(global, 'navigator', { value: {}, configurable: true });
const memory = new Map();
global.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => { memory.set(k, String(v)); },
};
require('../shared/player-levels.js');
const R = require('../shared/service-rules.js');

const u = { id: 'user-a', role: 'user' };
const other = { id: 'user-b', role: 'user' };
const login = s => localStorage.setItem('smashup_session_v1', JSON.stringify(s));

const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 2);
const date = R.localDate(tomorrow);
const base = { date, time: '17:00', court: 'A', name: 'ทดสอบ', phone: '081-234-5678' };

(async () => {
  login(u);

  // 1. Two identical bookings fired "at the same time" by the same user: exactly one wins.
  const results = await Promise.allSettled([R.bookCourt(base, u), R.bookCourt(base, u)]);
  const ok = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');
  assert.equal(ok.length, 1, 'only one of the concurrent bookings should succeed');
  assert.equal(rejected.length, 1, 'the loser must be rejected');
  assert.match(String(rejected[0].reason.message), /เพิ่งถูกจอง|ถูกจอง/, 'loser gets a conflict message');

  // 2. A different user trying the same court/time right after is rejected too.
  login(other);
  await assert.rejects(R.bookCourt(base, other), /เพิ่งถูกจอง|ถูกจอง/, 'second user cannot take the same slot');

  // The winner owns the record and can prove it via the ownership helper.
  login(u);
  const mine = R.own('court', u);
  assert.equal(mine.length, 1, 'owner sees exactly one booking');
  assert.equal(mine[0].ownerId, 'user-a');

  // 3. Other courts / times on the same date remain bookable.
  const free = await R.bookCourt({ ...base, court: 'B', time: '19:00' }, u);
  assert.ok(free.id, 'adjacent slot stays bookable');

  // 4. After the winner cancels, the slot is bookable again (court-conflict re-checked on write).
  await R.cancel('court', mine[0].id, u);
  login(other);
  const reclaimed = await R.bookCourt(base, other);
  assert.ok(reclaimed.id, 'slot becomes bookable again after cancellation');
  assert.equal(reclaimed.ownerId, 'user-b');

  console.log('PASS: concurrent identical booking rejects the loser; ownership + cancel/rebook revalidation hold');
})().catch(e => { console.error(e); process.exit(1); });