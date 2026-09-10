// Appointments module tests (Node)
const path = require('path');
const fs = require('fs');

let store = {};
global.localStorage = {
  getItem: (k) => (store[k] !== undefined ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.crypto = require('crypto');

const App = require(path.join(__dirname, '..', 'shared', 'appointments.js'));

function json(s) { try { return JSON.parse(s); } catch { return null; } }

const me = { id: 'user-a', name: 'แอ้ม', role: 'user' };
store['smashup_session_v1'] = JSON.stringify(me);

// registered users the invites can be bound to
store['smashup_users_v1'] = JSON.stringify([
  { id: 'user-b', username: 'player01', name: 'player01' },
  { id: 'user-c', username: 'player03', name: 'player03' },
]);

let pass = 0, fail = 0;
function assert(name, cond) { if (cond) { pass++; console.log('PASS: ' + name); } else { fail++; console.log('FAIL: ' + name); } }

// send binds receiver to exact user id (by username)
let a = App.send({ receiverName: 'player01', date: '2026-10-01', time: '19:00', court: 'คอร์ต 1' }, me);
assert('send creates pending appointment', a && a.status === 'pending' && a.senderId === 'user-a');
assert('send binds exact receiverId', a.receiverId === 'user-b');
assert('send sets expiry (+7d)', a.expiresAt && new Date(a.expiresAt) > new Date());

// invitation by explicit receiverId takes precedence
let byId = App.send({ receiverId: 'user-c', receiverName: 'ชื่อปลอม', date: '2026-10-04', time: '18:00', court: 'คอร์ต 1' }, me);
assert('explicit receiverId wins over name', byId.receiverId === 'user-c');

// duplicate rejection (same receiver + same date, even with different time)
let dupErr = '';
try { App.send({ receiverName: 'player01', date: '2026-10-01', time: '20:00', court: 'คอร์ต 2' }, me); } catch (e) { dupErr = e.message; }
assert('duplicate same-day invite rejected', /วันเดียวกัน/.test(dupErr));

// unknown receiver rejected (no name-based fallback)
let unknownErr = '';
try { App.send({ receiverName: 'ไม่มีบัญชีนี้', date: '2026-10-05', time: '19:00', court: 'คอร์ต 1' }, me); } catch (e) { unknownErr = e.message; }
assert('unknown receiver rejected', /ไม่พบบัญชีผู้รับ/.test(unknownErr));

// respond as receiver (user-b)
let me2 = { id: 'user-b', name: 'player01', role: 'user' };
store['smashup_session_v1'] = JSON.stringify(me2);
let accepted = App.respond(a.id, 'accept', me2);
assert('accept works', accepted.status === 'accepted' && accepted.receiverId === 'user-b');

// cannot re-respond
let reErr = '';
try { App.respond(a.id, 'decline', me2); } catch (e) { reErr = e.message; }
assert('re-respond rejected', /ดำเนินการแล้ว/.test(reErr));

// wrong receiver cannot respond even if display name matches another user
store['smashup_session_v1'] = JSON.stringify(me);
let a2 = App.send({ receiverName: 'player03', date: '2026-10-02', time: '18:00', court: 'คอร์ต 2' }, me);
let wrongErr = '';
store['smashup_session_v1'] = JSON.stringify(me2);
try { App.respond(a2.id, 'accept', me2); } catch (e) { wrongErr = e.message; }
assert('wrong receiver rejected', /ไม่ได้ส่งถึงคุณ/.test(wrongErr));
store['smashup_session_v1'] = JSON.stringify(me);

// sender can only cancel own invites
let a3 = App.send({ receiverName: 'player03', date: '2026-10-03', time: '17:00', court: 'คอร์ต 3' }, me);
let cancelOtherErr = '';
store['smashup_session_v1'] = JSON.stringify(me2);
try { App.cancel(a3.id, me2); } catch (e) { cancelOtherErr = e.message; }
assert('cross-user cancel rejected', /เฉพาะคำเชิญ/.test(cancelOtherErr));
store['smashup_session_v1'] = JSON.stringify(me);
let cancelled = App.cancel(a3.id, me);
assert('sender cancel ok', cancelled.status === 'cancelled');

store['smashup_session_v1'] = JSON.stringify(me);

// pending count
let pend = App.myReceived();
assert('myReceived only counts own receiver pending', Array.isArray(pend) && pend.every(x => x.receiverId === 'user-a'));
let stats = App.stats();
assert('stats available', typeof stats.accepted === 'number');

// invalid input guards
let invalidErr = '';
try { App.send({ receiverName: '', date: '2026-10-01', time: '19:00', court: 'คอร์ต 1' }, me); } catch (e) { invalidErr = e.message; }
assert('empty receiver rejected', /ผู้รับ/.test(invalidErr));
let pastErr = '';
try { App.send({ receiverName: 'player01', date: '2020-01-01', time: '19:00', court: 'คอร์ต 1' }, me); } catch (e) { pastErr = e.message; }
assert('past date rejected', /ย้อนหลัง/.test(pastErr));

// unauthenticated
let noAuthErr = '';
try { App.send({ receiverName: 'player01', date: '2026-10-01', time: '19:00', court: 'คอร์ต 1' }, null); } catch (e) { noAuthErr = e.message; }
assert('no session rejected', /เขียนทาง/.test(noAuthErr) || /เข้าสู่ระบบ/.test(noAuthErr));

// legacy record resolution by name still works
store['smashup_appointments_v1'] = JSON.stringify([{ id: 'LEGACY1', senderId: 'user-a', senderName: 'แอ้ม', receiverName: 'player03', receiverId: null, date: '2026-11-01', time: '19:00', court: 'คอร์ต 1', status: 'pending', createdAt: new Date().toISOString() }]);
App.resolveIds();
let legacy = App.listAll().find(x => x.id === 'LEGACY1');
assert('legacy name→id resolution', legacy && legacy.receiverId === 'user-c');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);