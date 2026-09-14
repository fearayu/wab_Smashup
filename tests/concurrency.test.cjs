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

  const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return R.localDate(d); };
  const admin = { id: 'admin-1', role: 'admin' };

  // 5. Buffet last-seat race: after 29 seats, two users race for seat 30.
  const bDate = plusDays(5), bSession = '11:00–14:00';
  for (let i = 0; i < 29; i++) {
    const seatUser = { id: 'seat-' + i, role: 'user' };
    login(seatUser);
    await R.bookBuffet({ date: bDate, session: bSession, name: 'Seat ' + i, phone: '0812345678', shuttle: '0' }, seatUser);
  }
  const seatA = { id: 'seat-29a', role: 'user' };
  const seatB = { id: 'seat-29b', role: 'user' };
  login(seatA);
  const raceA = R.bookBuffet({ date: bDate, session: bSession, name: 'Race A', phone: '0812345678', shuttle: '0' }, seatA);
  login(seatB);
  const raceB = R.bookBuffet({ date: bDate, session: bSession, name: 'Race B', phone: '0812345678', shuttle: '0' }, seatB);
  const seatResults = await Promise.allSettled([raceA, raceB]);
  const seatWins = seatResults.filter(r => r.status === 'fulfilled');
  const seatLosses = seatResults.filter(r => r.status === 'rejected');
  assert.equal(seatWins.length, 1, 'exactly one 30th-seat buffet request wins');
  assert.equal(seatLosses.length, 1, 'the other 30th-seat request is rejected');
  assert.match(String(seatLosses[0].reason.message), /เต็ม|30/, 'loser gets the full-session message');
  assert.equal(R.list(R.keys.buffet).filter(x => x.date === bDate && x.session === bSession && x.status !== 'ยกเลิกแล้ว').length, 30, 'session lands at exactly 30 seats');

  // 6. Admin confirmation re-checks court conflict against data written outside the UI flow.
  const cDate = plusDays(3);
  login(u);
  const cFirst = await R.bookCourt({ date: cDate, time: '17:00', court: 'A', name: 'ทดสอบ', phone: '081-234-5678' }, u);
  const courtRaw = JSON.parse(localStorage.getItem(R.keys.court));
  courtRaw.push({ ...courtRaw.find(x => x.id === cFirst.id), id: 'ghost-court-1', ownerId: 'ghost', status: 'รอตรวจสอบ' });
  R.write(R.keys.court, courtRaw);
  login(admin);
  await assert.rejects(
    R.setStatus('court', cFirst.id, 'ยืนยันแล้ว', admin),
    /ชนกับรายการอื่น/,
    'admin confirm rejects a court booking that now conflicts with another record'
  );

  // 7. Admin cannot confirm a buffet booking into an already-full session.
  const fDate = plusDays(4), fSession = '19:00–22:00';
  const fullList = [];
  for (let i = 0; i < 30; i++) {
    fullList.push({ id: 'full-' + i, name: 'Full ' + i, phone: '0812345678', date: fDate, session: fSession, level: '', shuttle: '0', ownerId: 'full-user-' + i, status: 'ยืนยันแล้ว', createdAt: new Date().toISOString() });
  }
  fullList.push({ id: 'full-late', name: 'Late', phone: '0812345678', date: fDate, session: fSession, level: '', shuttle: '0', ownerId: 'full-user-late', status: 'รอตรวจสอบ', createdAt: new Date().toISOString() });
  R.write(R.keys.buffet, fullList);
  await assert.rejects(
    R.setStatus('buffet', 'full-late', 'ยืนยันแล้ว', admin),
    /เต็ม/,
    'admin confirm rejects a 31st buffet seat'
  );

  // 8. Cancellation is still allowed while >=2h before start, even after admin confirmation.
  const xDate = plusDays(5);
  login(u);
  const xBook = await R.bookCourt({ date: xDate, time: '19:00', court: 'B', name: 'ทดสอบ', phone: '081-234-5678' }, u);
  login(admin);
  await R.setStatus('court', xBook.id, 'ยืนยันแล้ว', admin);
  login(u);
  const xCancelled = await R.cancel('court', xBook.id, u);
  assert.equal(xCancelled.status, 'ยกเลิกแล้ว', 'cancel succeeds >2h before start (documents current window)');

  console.log('PASS: concurrent booking + buffet last-seat reject the loser; ownership, cancel/rebook, admin conflict/full guards and cancel window hold');
})().catch(e => { console.error(e); process.exit(1); });