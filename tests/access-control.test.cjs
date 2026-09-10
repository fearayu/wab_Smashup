// Access control & state transitions on the shared domain layer (demo mode).
// Users may only cancel their own records; admin actions require an admin session;
// terminal states cannot be changed; field values are validated server-side-in-miniature.
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
const admin = { id: 'admin', role: 'admin' };
const stranger = { id: 'user-b', role: 'user' };
const login = s => localStorage.setItem('smashup_session_v1', JSON.stringify(s));
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 3);
const date = R.localDate(tomorrow);
const base = { date, time: '18:00', court: '3', name: 'ทดสอบ', phone: '081-234-5678' };

(async () => {
  login(u);
  const court = await R.bookCourt(base, u);
  assert.equal(R.own('court', u).length, 1, 'user sees own bookings');

  // Cross-user write: cancel of another user's record must fail (owner check).
  login(stranger);
  assert.equal(R.own('court', stranger).length, 0, 'stranger sees none of user-a records');
  await assert.rejects(R.cancel('court', court.id, stranger), /เฉพาะรายการ/, 'stranger cannot cancel user-a booking');

  // Session/identity mismatch: passing a different `expected` than the logged-in session.
  login(stranger);
  await assert.rejects(R.cancel('court', court.id, u), /บัญชีเปลี่ยน/, 'identity mismatch rejected');

  // Non-admin cannot run admin status changes.
  await assert.rejects(R.setStatus('court', court.id, 'ยืนยันแล้ว', stranger), /เฉพาะผู้ดูแล/, 'non-admin cannot confirm');

  // Admin flows.
  login(admin);
  const confirmed = await R.setStatus('court', court.id, 'ยืนยันแล้ว', admin);
  assert.equal(confirmed.status, 'ยืนยันแล้ว', 'admin can confirm a court booking');

  // Invalid status values are rejected.
  await assert.rejects(R.setStatus('court', court.id, 'สุ่ม', admin), /เลือกยืนยัน/, 'unknown status rejected');

  // Terminal states: cannot cancel after done, cannot cancel within 2h of start.
  login(u);
  const soon = new Date(Date.now() + 60 * 60 * 1000);
  const list = R.list(R.keys.court);
  const rec = list.find(r => r.id === court.id);
  rec.date = R.localDate(); // start now becomes "today at soon" → < 2h away
  rec.time = String(soon.getHours()).padStart(2, '0') + ':' + String(soon.getMinutes()).padStart(2, '0');
  R.write(R.keys.court, list);
  await assert.rejects(R.cancel('court', court.id, u), /ยกเลิกไม่ได้/, 'booking starting within 2h cannot be cancelled');

  // Admin cannot re-confirm a finished service request.
  login(u);
  const service = await R.requestService({ service: 'ลงชื่อซื้อของ', name: 'ทดสอบ', phone: '0812345678', item: 'ลูกแบดมินตัน', quantity: '2' }, u);
  login(admin);
  await R.setStatus('service', service.id, 'ดำเนินการแล้ว', admin);
  await assert.rejects(R.setStatus('service', service.id, 'ดำเนินการแล้ว', admin), /ดำเนินการเสร็จ/, 'finished request cannot change again');
  login(u);
  await assert.rejects(R.cancel('service', service.id, u), /ยกเลิกไม่ได้/, 'finished service request cannot be cancelled by user');

  // Servers must not trust client-sent amounts/status: amount is derived server-side.
  const c2 = await R.bookCourt({ ...base, court: '4' }, u);
  assert.equal(c2.amount, 130, 'amount comes from the rules, not from the client input');

  console.log('PASS: ownership checks, admin-only transitions, terminal states, derived amount');
})().catch(e => { console.error(e); process.exit(1); });