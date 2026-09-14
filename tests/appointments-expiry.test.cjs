// Appointment invite expiry (7-day TTL) pipeline tests (Node)
// Appointments are created pending with expiresAt = +7d; normalize() lazily flips
// a past-due pending record to 'auto-cancelled' on every read, so the expired invite
// must disappear from the receiver's pending feed but stay visible in listAll().
const path = require('path');

let store = {};
global.localStorage = {
  getItem: (k) => (store[k] !== undefined ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.crypto = require('crypto');

const App = require(path.join(__dirname, '..', 'shared', 'appointments.js'));

const me = { id: 'user-a', name: 'แอ้ม', role: 'user' };
const receiver = { id: 'user-b', username: 'player01', name: 'player01', role: 'user' };
const receiver2 = { id: 'user-c', username: 'player03', name: 'player03', role: 'user' };

let pass = 0, fail = 0;
function assert(name, cond) { if (cond) { pass++; console.log('PASS: ' + name); } else { fail++; console.log('FAIL: ' + name); } }

store['smashup_session_v1'] = JSON.stringify(me);
store['smashup_users_v1'] = JSON.stringify([
  { id: 'user-b', username: 'player01', name: 'player01' },
  { id: 'user-c', username: 'player03', name: 'player03' },
]);

// --- Seed a real invite, then age it past its TTL ---
const inv = App.send({ receiverName: 'player01', date: '2026-10-01', time: '19:00', court: 'คอร์ต 1' }, me);
assert('seed invite is pending with a future expiry', inv.status === 'pending' && new Date(inv.expiresAt) > new Date());

const past = new Date(Date.now() - 1).toISOString();
const seededRaw = JSON.parse(store['smashup_appointments_v1']);
seededRaw.find(a => a.id === inv.id).expiresAt = past;
store['smashup_appointments_v1'] = JSON.stringify(seededRaw);

// normalize() flips only the expired pending record, with the documented reason.
const aged = JSON.parse(store['smashup_appointments_v1']).find(a => a.id === inv.id);
const normalized = App.normalize(aged);
assert('normalize flips expired pending to auto-cancelled', normalized.status === 'auto-cancelled');
assert('normalize sets cancelReason (7 วัน)', normalized.cancelReason === 'หมดเวลารอการตอบรับ (7 วัน)');
assert('normalize stamps cancelledAt', !!normalized.cancelledAt);

// normalize() must leave future pending / non-pending records untouched.
assert('normalize keeps non-expired pending', App.normalize({ ...aged, expiresAt: new Date(Date.now() + 60000).toISOString() }).status === 'pending');
assert('normalize ignores accepted records', App.normalize({ status: 'accepted', expiresAt: past }).status === 'accepted');

// listAll() still surfaces the record, now auto-cancelled.
const all = App.listAll();
const inAll = all.find(a => a.id === inv.id);
assert('listAll keeps the expired invite', !!inAll);
assert('listAll reports auto-cancelled status', inAll.status === 'auto-cancelled');

// --- Receiver's pending feed excludes the expired invite ---
store['smashup_session_v1'] = JSON.stringify(receiver);
assert('myReceived excludes expired invite', App.myReceived().every(a => a.id !== inv.id));
assert('myReceived is empty after expiry', App.myReceived().length === 0);
assert('mySchedule excludes expired invite', App.mySchedule().every(a => a.id !== inv.id));

// --- Control: a fresh invite still flows through pending/schedule ---
store['smashup_session_v1'] = JSON.stringify(me);
const live = App.send({ receiverName: 'player03', date: '2026-10-02', time: '18:00', court: 'คอร์ต 2' }, me);
store['smashup_session_v1'] = JSON.stringify(receiver2);
assert('fresh invite appears in myReceived', App.myReceived().some(a => a.id === live.id));
assert('fresh invite appears in mySchedule', App.mySchedule().some(a => a.id === live.id));
assert('expired invite still absent from other feed', App.myReceived().every(a => a.id !== inv.id));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
