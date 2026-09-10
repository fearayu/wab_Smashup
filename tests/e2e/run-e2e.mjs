// SMASHUP Browser E2E (24 checks) — ใช้ puppeteer-core + Edge/Chrome headless
// วิธีรัน (ESM หา node_modules จากตำแหน่งตัวสคริปต์ — ต้องรันจากโฟลเดอร์ที่ติดตั้ง puppeteer-core):
//   1. python -m http.server 4173        (เปิด server จาก root ของโปรเจกต์)
//   2. npm i puppeteer-core               ในโฟลเดอร์ที่วางตัวสคริปต์นี้
//   3. node tests/e2e/run-e2e.mjs
//   -> แก้ path EDGE/CHROME ด้านล่างตามเครื่องที่ใช้ รายงานจะเขียนที่ tests/e2e/e2e-report.txt
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://127.0.0.1:4173';
const OUT = join(__dirname, 'e2e-report.txt');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const results = [];
const now = () => new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
function check(name, cond, extra = '') {
  results.push({ name, ok: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`);
}

function isoLocal(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

let browser;
try {
  browser = await puppeteer.launch({
    executablePath: fs.existsSync(EDGE.replace(/\//g, '\\')) ? EDGE : CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1400,950'],
  });
} catch (e) {
  console.log('LAUNCH FAILED:', e.message);
  process.exit(1);
}

const page = await browser.newPage();
page.setDefaultTimeout(20000);
page.on('dialog', d => d.accept());

async function goto(path) { await page.goto(BASE + path, { waitUntil: 'domcontentloaded' }); }
async function text(sel) { return page.$eval(sel, el => el.textContent.trim()).catch(() => ''); }
async function setVal(sel, val) { await page.$eval(sel, (el, v) => { el.value = v; }, val); }
async function exists(sel) { return page.$(sel).then(Boolean); }
async function sleepU(ms) { await new Promise(r => setTimeout(r, ms)); }

console.log('=== SMASHUP E2E START  ' + now() + '  ===\n');

try {
  // ---------- SCENARIO 1: Flow A — booking board (service-rules) ----------
  await goto('/auth/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  // login player01 (demo) via real UI
  await page.click('.demo-fill[data-user="player01"]');
  await page.click('#submitButton');
  await page.waitForFunction(() => location.pathname.endsWith('index.html'), { timeout: 8000 });
  check('A01 login player01 redirects to home', true);

  await goto('/booking/index.html');
  await page.waitForSelector('.court-btn');
  const btnCount = await page.$$eval('.court-btn', els => els.length);
  check('A02 board renders 39 free cells (13 courts x 3 slots)', btnCount === 39, `got ${btnCount}`);

  const date2 = isoLocal(2);
  await page.evaluate((d) => {
    const b = [...document.querySelectorAll('.date-tab')].find(x => x.dataset.date === d);
    if (b) b.click();
  }, date2);
  await page.waitForSelector('button[data-time="19:00"][data-court="2"]');

  // book court 2 @ 19:00 on +2 day
  await page.click('button[data-time="19:00"][data-court="2"]');
  await page.waitForSelector('#bookingDialog[open]');
  const prefilledName = await page.$eval('#bookName', el => el.value);
  check('A03 dialog prefills name from session', prefilledName === 'player01', prefilledName);
  await page.type('#bookPhone', '0812345678');
  await page.click('#bookSubmit');
  await page.waitForFunction(() => !document.getElementById('bookingDialog').open, { timeout: 8000 });
  const msg = await text('#boardMessage');
  check('A04 booking success message shown', msg.includes('จองสำเร็จ'), msg);
  const stillFree = await page.$$eval('td.reserved', els => els.length);
  check('A05 cell now shows จองแล้ว', stillFree >= 1, `reserved cells=${stillFree}`);

  // duplicate / conflict via same domain call (same court+time+date)
  const conflict = await page.evaluate(async (d) => {
    const R = window.SmashRules; const who = R.session();
    try { await R.bookCourt({ date: d, time: '19:00', court: '2', name: who.name, phone: '0812345678' }, who); return 'no-error'; }
    catch (e) { return e.message; }
  }, date2);
  check('A06 duplicate booking rejected (คอร์ตนี้เพิ่งถูกจอง)', conflict.includes('เพิ่งถูกจอง'), conflict);

  // my-bookings shows the record + cancel
  await goto('/booking/my-bookings.html');
  await page.waitForSelector('.booking-card');
  let cardText = await text('.booking-card');
  check('A07 my-bookings shows คอร์ต 2 · รอตรวจสอบ · ฿130', cardText.includes('คอร์ต 2') && cardText.includes('รอตรวจสอบ') && cardText.includes('130'), cardText.replace(/\n/g, ' '));
  await page.click('.cancel-button');
  await page.waitForFunction(() => document.getElementById('myMessage').textContent.includes('ยกเลิกแล้ว'), { timeout: 8000 });
  cardText = await text('.booking-card');
  check('A08 cancel ผ่าน UI แล้วสถานะเป็นยกเลิกแล้ว', cardText.includes('ยกเลิกแล้ว'), cardText.replace(/\n/g, ' '));

  // board reverts to free
  await goto('/booking/index.html');
  await page.waitForSelector('.court-btn');
  await page.evaluate((d) => { const b = [...document.querySelectorAll('.date-tab')].find(x => x.dataset.date === d); if (b) b.click(); }, date2);
  await page.waitForSelector('button[data-time="19:00"][data-court="2"]');
  const slotBtn = await page.$('button[data-time="19:00"][data-court="2"]');
  const slotClass = slotBtn ? await slotBtn.evaluate(el => el.className) : '';
  check('A09 cancelled slot is free again on board', slotClass.includes('free') || !slotClass.includes('booked'), 'slot class: ' + slotClass);

  // ---------- SCENARIO 2: form.html flow ----------
  await goto('/booking/form.html');
  await page.waitForSelector('#booking-form');
  await setVal('#date', date2);
  await page.select('select[name="time"]', '19:00');
  await page.type('input[name="phone"]', '0812345678');
  await page.click('#booking-form button[type="submit"]');
  await page.waitForFunction(() => document.getElementById('bookingSuccessDialog').open, { timeout: 8000 });
  check('A10 form.html success dialog shown', true);
  await page.click('#bookingStayBtn');
  await goto('/booking/my-bookings.html');
  await page.waitForSelector('.booking-card');
  cardText = await text('.booking-card');
  check('A11 my-bookings shows form booking (คอร์ต 1 · รอยืนยัน · ฿130)', cardText.includes('คอร์ต 1') && cardText.includes('รอยืนยัน') && cardText.includes('130'), cardText.replace(/\n/g, ' '));

  // ---------- SCENARIO 3: Admin dashboard ----------
  await goto('/auth/index.html');
  await page.evaluate(() => localStorage.removeItem('smashup_session_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('.demo-fill[data-user="admin"]');
  await page.click('#submitButton');
  await page.waitForFunction(() => location.pathname.includes('admin/index.html'), { timeout: 8000 });
  await page.waitForSelector('#statPending');
  const statUsers = await text('#statUsers');
  const statPending = await text('#statPending');
  const statRevenue = await text('#statRevenue');
  check('A12 admin statUsers = real registered users', Number(statUsers) >= 1, `users=${statUsers}`);
  check('A13 admin statPending = 1 (form booking รอยืนยัน)', statPending === '1', `pending=${statPending}`);
  check('A14 admin statRevenue starts ฿0 (no confirmed yet)', statRevenue === '฿ 0', statRevenue);

  const approved = await page.evaluate(() => {
    const tr = [...document.querySelectorAll('#adminBody tr')].find(r => r.textContent.includes('จองคอร์ต'));
    if (!tr) return { found: false };
    const btn = tr.querySelector('[data-approve]');
    if (!btn) return { found: true, approve: false };
    btn.click(); return { found: true, approve: true };
  });
  check('A15 admin sees court request row with ยืนยัน button', approved.found && approved.approve);
  await sleepU(800);
  const revenue2 = await text('#statRevenue');
  const pending2 = await text('#statPending');
  const statusCell = await page.evaluate(() => {
    const tr = [...document.querySelectorAll('#adminBody tr')].find(r => r.textContent.includes('จองคอร์ต'));
    return tr ? tr.textContent.includes('ยืนยันแล้ว') : false;
  });
  check('A16 confirm → status ยืนยันแล้ว in admin table', statusCell);
  check('A17 confirm → revenue updates to ฿130', revenue2 === '฿ 130', revenue2);
  check('A18 confirm → pending drops to 0', pending2 === '0', pending2);

  // ---------- SCENARIO 4: Flow B — real matchmaking + invite ----------
  const reg = async (username, email, password) => {
    await goto('/auth/index.html');
    await page.evaluate(() => localStorage.removeItem('smashup_session_v1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    if (!(await page.$('#emailField')).hidden) { } // register mode not active yet
    await page.click('#switchMode');
    await page.type('#username', username);
    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('#submitButton');
    await page.waitForFunction(() => location.pathname.endsWith('index.html'), { timeout: 8000 });
  };
  await reg('pong_a', 'ponga@x.com', 'pass1234');
  await reg('pong_b', 'pongb@x.com', 'pass1234');

  const ids = await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('smashup_users_v1'));
    for (const u of users) {
      if (u.username === 'pong_a' || u.username === 'pong_b') {
        u.profile = { assessment: { version: 2, selfLevel: 'C+' }, distance: 5, availability: '19:00', playFormat: 'double' };
      }
    }
    localStorage.setItem('smashup_users_v1', JSON.stringify(users));
    const get = n => users.find(u => u.username === n).id;
    return { a: get('pong_a'), b: get('pong_b') };
  });
  check('B01 register 2 real users with levels (C+)', !!ids.a && !!ids.b);

  // login pong_a via UI
  await goto('/auth/index.html');
  await page.evaluate(() => localStorage.removeItem('smashup_session_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.type('#username', 'pong_a');
  await page.type('#password', 'pass1234');
  await page.click('#submitButton');
  await page.waitForFunction(() => location.pathname.endsWith('index.html'), { timeout: 8000 });

  await goto('/matching/index.html');
  await page.waitForSelector('#cardGrid .player-card');
  await page.select('#skillLevel', 'advanced');
  await page.select('#matchType', 'double');
  await page.select('#distance', '10');
  await page.click('#searchForm button[type="submit"]');
  await page.waitForFunction(() => document.getElementById('searchMessage').textContent.includes('คน'), { timeout: 8000 });
  const found = await page.evaluate((bid) => {
    const card = [...document.querySelectorAll('#cardGrid .player-card')].find(c => c.dataset.id === bid);
    return card ? { hasInvite: !!card.querySelector('.invite-btn'), badge: card.querySelector('.match-badge') ? card.querySelector('.match-badge').textContent.trim() : '', name: card.querySelector('.card-meta strong').textContent.trim() } : null;
  }, ids.b);
  check('B02 real player pong_b matched with Match % badge', !!found && found.name === 'pong_b', JSON.stringify(found));
  check('B03 invite button present on real card', !!found && found.hasInvite);

  await page.evaluate((bid) => {
    const card = [...document.querySelectorAll('#cardGrid .player-card')].find(c => c.dataset.id === bid);
    card.querySelector('.invite-btn').click();
  }, ids.b);
  await sleepU(400);
  const inviteBtnText = await page.$$eval('.invite-btn', els => els.map(e => e.textContent.trim()).join('|'));
  check('B04 invite sent → button shows ✓ ส่งคำเชิญแล้ว', inviteBtnText.includes('ส่งคำเชิญแล้ว'), inviteBtnText);

  // receive + accept as pong_b
  await goto('/auth/index.html');
  await page.evaluate(() => localStorage.removeItem('smashup_session_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.type('#username', 'pong_b');
  await page.type('#password', 'pass1234');
  await page.click('#submitButton');
  await page.waitForFunction(() => location.pathname.endsWith('index.html'), { timeout: 8000 });

  await goto('/appointments/index.html');
  await page.waitForSelector('#inviteList .invite-card');
  const inviteText = await text('#inviteList .invite-card');
  check('B05 pong_b receives invite from pong_a', inviteText.includes('pong_a'), inviteText.replace(/\n/g, ' '));
  await page.click('#inviteList [data-action="accept"]');
  await page.waitForFunction(() => document.querySelector('#inviteCount').textContent.trim() === '0', { timeout: 8000 });
  await page.click('.tab[data-tab="schedule"]');
  await page.waitForSelector('#scheduleBody tr');
  const sched = await text('#scheduleBody');
  check('B06 accepted → schedule shows pong_a partner + ยืนยันแล้ว', sched.includes('pong_a') && sched.includes('ยืนยันแล้ว'), sched.replace(/\n/g, ' '));
} catch (e) {
  console.log('\n!! E2E ERROR:', e.message);
  if (e.stack) console.log(e.stack.split('\n').slice(0, 4).join('\n'));
  check('SCENARIO_SURVIVED', false, e.message);
}

await browser.close();

const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok);
const lines = [
  'SMASHUP E2E REPORT  ' + now(),
  'BROWSER: headless Edge/Chrome via puppeteer-core',
  `TOTAL: ${results.length}  PASS: ${passed}  FAIL: ${failed.length}`,
  '',
  ...results.map(r => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`),
  ...(failed.length ? ['', 'FAILURES:', ...failed.map(r => ' - ' + r.name)] : ['', 'ALL CHECKS PASSED']),
  '',
];
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log('\n=== summary: ' + passed + '/' + results.length + ' passed ===');
console.log('report written to ' + OUT);
process.exit(failed.length ? 1 : 0);