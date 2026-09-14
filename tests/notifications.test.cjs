// Notifications module tests (Node)
const path = require('path');

let store = {};
global.localStorage = {
  getItem: (k) => (store[k] !== undefined ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.crypto = require('crypto');

const N = require(path.join(__dirname, '..', 'shared', 'notifications.js'));

let pass = 0, fail = 0;
function assert(name, cond) { if (cond) { pass++; console.log('PASS: ' + name); } else { fail++; console.log('FAIL: ' + name); } }

const me = { id: 'user-a', name: 'แอ้ม' };

const n1 = N.create({ userId: me.id, title: 'ส่งคำขอยืนยันการจอง', body: 'คอร์ต 1 19:00', type: 'booking' });
assert('create returns notification', n1 && n1.id && n1.title === 'ส่งคำขอยืนยันการจอง');
assert('new notification is unread', n1.read === false);

N.create({ userId: me.id, title: 'คุณได้รับคำเชิญ', type: 'invite' });
N.create({ userId: 'user-b', title: 'สำหรับคนอื่น', type: 'system' });

assert('forUser only returns own notifications', N.forUser(me.id).length === 2);
assert('unreadCount counts unread only', N.unreadCount(me.id) === 2);
assert('other users have own count', N.unreadCount('user-b') === 1);

N.markRead(n1.id, me.id);
assert('markRead marks single read', N.forUser(me.id).find(n => n.id === n1.id).read === true && N.unreadCount(me.id) === 1);

try { N.markRead(n1.id, 'user-b'); assert('cross-user markRead blocked', false); } catch (e) { assert('cross-user markRead blocked', true); }

let changed = N.markAllRead(me.id);
assert('markAllRead returns changed flag', changed === true);
assert('markAllRead clears all own unread', N.unreadCount(me.id) === 0);
assert('markAllRead does not touch others', N.unreadCount('user-b') === 1);

try { N.create({ title: 'ไม่มีผู้รับ' }); assert('create requires userId', false); } catch (e) { assert('create requires userId', true); }
try { N.create({ userId: me.id, title: '', body: 'x' }); assert('create requires title', false); } catch (e) { assert('create requires title', true); }

N.create({ userId: me.id, title: 'tournament', type: 'tournament', link: '../booking/tournament.html' });
assert('custom type accepted', N.forUser(me.id).some(n => n.type === 'tournament' && n.link === '../booking/tournament.html'));

// clear(userId): removes the user's own notifications (unread + feed).
N.create({ userId: me.id, title: 'to-clear-1' });
N.create({ userId: me.id, title: 'to-clear-2' });
N.create({ userId: 'user-z', title: 'other-user' });
assert('setup: other user has a notification', N.forUser('user-z').length === 1);
N.clear(me.id);
assert('clear wipes own feed', N.forUser(me.id).length === 0);
assert('clear resets own unread count', N.unreadCount(me.id) === 0);

// clear for a user with no notifications must not throw.
assert('clear for empty user does not throw', (() => { try { N.clear('ghost-user'); return true; } catch { return false; } })());

// clear(userId) is per-user: clearing one user must NOT touch another user's feed.
assert('clear keeps other users intact', N.forUser('user-z').length === 1);
assert('clear count reflects own removed', N.clear('user-z') === 1);
assert('clear removes that user too', N.forUser('user-z').length === 0);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);