// Tournament module tests (Node)
const path = require('path');
let store = {};
global.localStorage = {
  getItem: (k) => (store[k] !== undefined ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.crypto = require('crypto');
const T = require(path.join(__dirname, '..', 'shared', 'tournament.js'));
let pass = 0, fail = 0;
function assert(name, cond) { if (cond) { pass++; console.log('PASS: ' + name); } else { fail++; console.log('FAIL: ' + name); } }
const me = { id: 'user-a', name: 'แอ้ม', level: 'B' };
const u2 = { id: 'user-b', name: 'ปอนด์', level: 'C' };
const u3 = { id: 'user-c', name: 'เจมส์', level: 'B+' };
const u4 = { id: 'user-d', name: 'แนน', level: 'A' };

// Create tournament
const t = T.create({ name: 'SMASHUP TEST CHAMP', event: 'SMASHUP CHAMPIONSHIP #1' });
assert('create returns tournament', t && t.id && t.status === 'registration');
assert('create assigns name', t.name === 'SMASHUP TEST CHAMP');
assert('create assigns categories', t.categories.includes('ชายเดี่ยว'));

try { T.create({ name: 'dup', event: 'SMASHUP CHAMPIONSHIP #1' }); assert('duplicate event blocked', false); } catch { assert('duplicate event blocked', true); }

// Register players
const r1 = T.register(t.id, { category: 'ชายเดี่ยว', level: 'B' }, me);
assert('register creates reg', r1 && r1.userId === 'user-a' && r1.status === 'registered');

const r2 = T.register(t.id, { category: 'ชายเดี่ยว', level: 'C' }, u2);
const r3 = T.register(t.id, { category: 'ชายเดี่ยว', level: 'B+' }, u3);
const r4 = T.register(t.id, { category: 'ชายเดี่ยว', level: 'A' }, u4);
const fresh = T.getById(t.id);
assert('4 registrations count', fresh.registrations.filter(r => r.category === 'ชายเดี่ยว' && r.status !== 'cancelled').length === 4);

try { T.register(t.id, { category: 'ชายเดี่ยว', level: 'B' }, me); assert('duplicate reg blocked', false); } catch { assert('duplicate reg blocked', true); }
try { T.register('nonexistent', { category: 'ชายเดี่ยว' }, me); assert('unknown tournament blocked', false); } catch { assert('unknown tournament blocked', true); }

// Cancel registration
const cancelled = T.cancelRegistration(t.id, r2.id, u2);
assert('cancel sets status', cancelled.status === 'cancelled');
assert('cancel reduces active count', T.getById(t.id).registrations.filter(r => r.category === 'ชายเดี่ยว' && r.status !== 'cancelled').length === 3);

// Build bracket (3 players → pad to 4)
const rounds = T.buildBracket(t.id, 'ชายเดี่ยว');
assert('buildBracket creates rounds', Array.isArray(rounds) && rounds.length === 2);
assert('status changes to in-progress', T.getById(t.id).status === 'in-progress');
assert('round 0 has 2 matches', rounds[0].matches.length === 2);

// Find a match with two players and set winner
const m0 = rounds[0].matches.find(m => m.player1 && m.player2);
assert('find match with two players', !!m0);
if (m0) {
  const winSlot = m0.player1.id === 'user-a' ? 1 : 2;
  T.setWinner(t.id, 'ชายเดี่ยว', m0.round, m0.position, winSlot, '21-15, 21-18');
  // re-read from fresh storage since mutate replaces objects
  const freshRounds = T.getById(t.id).brackets['ชายเดี่ยว'];
  const freshM = freshRounds[m0.round].matches[m0.position];
  assert('setWinner updates match', freshM.winnerSlot === winSlot && freshM.score === '21-15, 21-18');
  // Winner should be propagated to final
  const finalMatch = freshRounds[freshRounds.length - 1].matches[0];
  assert('winner propagated to final', finalMatch.player1 != null || finalMatch.player2 != null);
}

// Set final winner too to complete tournament
const freshRounds2 = T.getById(t.id).brackets['ชายเดี่ยว'];
const finalM = freshRounds2[freshRounds2.length - 1].matches[0];
if (finalM && finalM.player1 && finalM.player2) {
  T.setWinner(t.id, 'ชายเดี่ยว', finalM.round, finalM.position, 1, '21-18, 21-19');
}
const ranks = T.rankings(t.id, 'ชายเดี่ยว');
assert('rankings returns array', Array.isArray(ranks));
assert('rankings has entries after final', ranks.length >= 1);
assert('rankings includes winner', ranks.some(r => r.rank === 1));

// BYE handling
const t2 = T.create({ name: 'BYE TEST', event: 'OPEN DOUBLES DAY' });
T.register(t2.id, { category: 'หญิงเดี่ยว', level: 'C' }, me);
T.register(t2.id, { category: 'หญิงเดี่ยว', level: 'B' }, u2);
T.register(t2.id, { category: 'หญิงเดี่ยว', level: 'A' }, u4);
// 3 players → 4 slots → 1 BYE
const rounds2 = T.buildBracket(t2.id, 'หญิงเดี่ยว');
assert('BYE round has match with BYE', rounds2[0].matches.some(m => m.score === 'BYE'));

// Invalid operations
try { T.setWinner(t.id, 'ชายเดี่ยว', 99, 0, 1); assert('invalid round blocked', false); } catch { assert('invalid round blocked', true); }
try { T.buildBracket(t.id, 'คู่混淆'); assert('invalid category blocked', false); } catch { assert('invalid category blocked', true); }

// Level-based seeding: top players must not meet in the first round
const t3 = T.create({ name: 'SEED TEST', event: 'SMASHUP CHAMPIONSHIP #1' });
['A', 'B+', 'C', 'C', 'C', 'C'].forEach((lv, i) => {
  T.register(t3.id, { category: 'ชายเดี่ยว', level: lv }, { id: 'u-seed-' + i, name: 'P' + i });
});
const rounds3 = T.buildBracket(t3.id, 'ชายเดี่ยว');
const firstRound3 = rounds3[0].matches;
const mIdxA = firstRound3.findIndex(m => (m.player1 && m.player1.level === 'A') || (m.player2 && m.player2.level === 'A'));
const mIdxB = firstRound3.findIndex(m => (m.player1 && m.player1.level === 'B+') || (m.player2 && m.player2.level === 'B+'));
assert('top seed (A) placed in first-round match', mIdxA >= 0);
assert('second seed (B+) placed in first-round match', mIdxB >= 0);
assert('top seeds drawn into different first-round matches', mIdxA >= 0 && mIdxB >= 0 && mIdxA !== mIdxB);
assert('top seed (A) occupies seed slot 0', firstRound3[0].player1 && firstRound3[0].player1.level === 'A');
assert('seedOrder(8) standard layout', JSON.stringify(T.seedOrder(8)) === JSON.stringify([0, 7, 4, 3, 2, 5, 6, 1]));
assert('rankOf known/unknown levels', T.rankOf('A') > T.rankOf('C') && T.rankOf('') === 0);

// Same-level players still build a valid bracket
// finish t2 (OPEN DOUBLES DAY) first to free the event path
const seated = T.getById(t2.id).brackets['หญิงเดี่ยว'];
const twoPlayer = seated[0].matches.find(m => m.player1 && m.player2);
if (twoPlayer) { T.setWinner(t2.id, 'หญิงเดี่ยว', twoPlayer.round, twoPlayer.position, 1, '21-0,21-0'); }
const seatedFinal = T.getById(t2.id).brackets['หญิงเดี่ยว'];
const f2 = seatedFinal[seatedFinal.length - 1].matches[0];
if (f2 && f2.player1 && f2.player2) { T.setWinner(t2.id, 'หญิงเดี่ยว', f2.round, f2.position, 1, '21-0,21-0'); }
assert('bye tournament completed (event slot freed)', T.getById(t2.id).status === 'completed');

const t4 = T.create({ name: 'SAME LEVEL', event: 'OPEN DOUBLES DAY' });
T.register(t4.id, { category: 'คู่ผสม', level: 'B' }, { id: 'x1', name: 'X1' });
T.register(t4.id, { category: 'คู่ผสม', level: 'B' }, { id: 'x2', name: 'X2' });
const rounds4 = T.buildBracket(t4.id, 'คู่ผสม');
assert('same-level bracket built', rounds4[0].matches.length === 1);

// Exact skill-level grouping: a B bracket must not contain C players.
T.setWinner(t4.id, 'คู่ผสม', 0, 0, 1, '21-0,21-0');
assert('same-level tournament completed before grouped test', T.getById(t4.id).status === 'completed');
const t6 = T.create({ name: 'GROUPED LEVEL TEST', event: 'OPEN DOUBLES DAY' });
T.register(t6.id, { category: 'ชายเดี่ยว', level: 'B' }, { id: 'b1', name: 'B1' });
T.register(t6.id, { category: 'ชายเดี่ยว', level: 'B' }, { id: 'b2', name: 'B2' });
T.register(t6.id, { category: 'ชายเดี่ยว', level: 'C' }, { id: 'c1', name: 'C1' });
T.register(t6.id, { category: 'ชายเดี่ยว', level: 'C' }, { id: 'c2', name: 'C2' });
const groupedB = T.buildBracket(t6.id, 'ชายเดี่ยว', 'B');
const groupedPlayers = groupedB[0].matches.flatMap(m => [m.player1, m.player2]).filter(Boolean);
assert('grouped bracket uses a separate key', !!T.getById(t6.id).brackets['ชายเดี่ยว::B']);
assert('grouped bracket contains only selected level', groupedPlayers.length === 2 && groupedPlayers.every(p => p.level === 'B'));
T.setWinner(t6.id, 'ชายเดี่ยว::B', 0, 0, 1, '21-0,21-0');
assert('grouped bracket can complete independently', T.getById(t6.id).status === 'completed');

// --- State machine hardening: once the bracket exists, registration is locked ---

// cancelRegistration after buildBracket must be rejected (was a runaway state hole).
const openReg = T.getById(t3.id).registrations.find(r => r.status === 'registered');
let cancelAfterBracketErr = '';
try { T.cancelRegistration(t3.id, openReg.id, { id: openReg.userId }); } catch (e) { cancelAfterBracketErr = e.message; }
assert('cancel after buildBracket rejected', /หลังจากจัดสาย/.test(cancelAfterBracketErr));
assert('rejected cancel leaves registration intact', T.getById(t3.id).registrations.find(r => r.id === openReg.id).status === 'registered');

// register after buildBracket must be rejected too.
let lateRegErr = '';
try { T.register(t3.id, { category: 'หญิงเดี่ยว', level: 'C' }, { id: 'u-late', name: 'Late' }); } catch (e) { lateRegErr = e.message; }
assert('register after buildBracket rejected', /ปิดรับสมัครแล้ว/.test(lateRegErr));

// setWinner on a BYE match (only one side populated) must be rejected.
const byeMatch = T.getById(t2.id).brackets['หญิงเดี่ยว'][0].matches.find(m => m.score === 'BYE');
assert('BYE match present in t2 bracket', !!byeMatch);
let byeErr = '';
try { T.setWinner(t2.id, 'หญิงเดี่ยว', byeMatch.round, byeMatch.position, 1, '21-0'); } catch (e) { byeErr = e.message; }
assert('setWinner on BYE match rejected', /ยังไม่มีผู้เล่นครบ/.test(byeErr));

// 1 player is not enough to build a bracket.
T.setWinner(t4.id, 'คู่ผสม', 0, 0, 1, '21-0,21-0');
assert('t4 completed (event slot freed)', T.getById(t4.id).status === 'completed');
const t5 = T.create({ name: 'ONE PLAYER', event: 'OPEN DOUBLES DAY' });
T.register(t5.id, { category: 'ชายเดี่ยว', level: 'C' }, { id: 'solo', name: 'Solo' });
let soloErr = '';
try { T.buildBracket(t5.id, 'ชายเดี่ยว'); } catch (e) { soloErr = e.message; }
assert('1-player buildBracket rejected', /ผู้สมัครไม่พอจัดสาย/.test(soloErr));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);