// API mode seam: demo and API paths are separated, with NO silent fallback.
// In API mode a failed request must throw loudly and must never write to localStorage.
const assert = require('node:assert/strict');
const mem = new Map();
const writes = [];
global.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { writes.push(k); mem.set(k, String(v)); },
  removeItem: (k) => { mem.delete(k); },
};
delete global.fetch; // clean slate — no global fetch stub noise

const SmashApi = require('../shared/api.js');

(async () => {
  // 1. Default mode (no baseUrl, no forcing) = demo. isApi() false.
  assert.equal(SmashApi.isApi(), false, 'defaults to demo mode');
  assert.equal(SmashApi.mode(), 'demo');

  // 2. Demo-mode request → refused loudly, never faked against localStorage.
  await assert.rejects(SmashApi.request('/bookings'), /โหมดเดโม/, 'demo-mode request refused rather than silently faking');
  assert.equal(writes.length, 0, 'nothing written during refused demo request');

  // 3. Turn on API mode via the documented config keys.
  localStorage.setItem('smashup_api_mode', 'api');
  localStorage.setItem('smashup_api_base_url', 'https://smashup.example.dev/api');
  assert.equal(SmashApi.isApi(), true, 'API mode via localStorage config');

  // 4. Failing transport (offline) → throws AND leaves localStorage untouched.
  writes.length = 0;
  global.fetch = async () => { throw new Error('net::ERR_CONNECTION_REFUSED'); };
  await assert.rejects(SmashApi.request('/bookings', { method: 'POST', body: { court: 'A' } }), /ไม่ได้บันทึกข้อมูลในเครื่อง/, 'offline throws loud message');
  assert.equal(writes.length, 0, 'API failure must not write any localStorage');

  // 5. Server 500 → throws with server-provided message.
  writes.length = 0;
  global.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: { message: 'ยืนยันไม่ได้: คอร์ตถูกจองแล้ว' } }) });
  await assert.rejects(SmashApi.request('/bookings'), /ยืนยันไม่ได้/, 'server message surfaced');
  assert.equal(writes.length, 0, 'no localStorage on 500 either');

  // 6. Success returns the server payload untouched, and does not mirror into localStorage.
  writes.length = 0;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 'BK-99', status: 'ยืนยันแล้ว' }) });
  const res = await SmashApi.request('/bookings', { method: 'POST', body: { court: 'A' } });
  assert.ok(res, 'success returns payload');
  assert.equal(res.id, 'BK-99');
  assert.equal(writes.length, 0, 'source of truth = server, nothing mirrored locally');

  console.log('PASS: demo/API separation, loud failure, no localStorage writes in API mode');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });