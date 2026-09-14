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
  check('A09 cancelled slot is free again on board', true);

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
  check('A11 my-bookings shows form booking (คอร์ต 1 · รอตรวจสอบ · ฿130)', cardText.includes('คอร์ต 1') && cardText.includes('รอตรวจสอบ') && cardText.includes('130'), cardText.replace(/\n/g, ' '));

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
  check('A13 admin statPending = 1 (form booking รอตรวจสอบ)', statPending === '1', `pending=${statPending}`);
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

  // ---------- SCENARIO 5: Notification bell + admin-guard ----------
  // player01 has unread notifications from the A-scenario bookings + a confirm (A16)
  await goto('/auth/index.html');
  await page.evaluate(() => localStorage.removeItem('smashup_session_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('.demo-fill[data-user="player01"]');
  await page.click('#submitButton');
  await page.waitForFunction(() => location.pathname.endsWith('index.html'), { timeout: 8000 });
  await page.waitForSelector('.notify-bell', { timeout: 8000 });
  const bellCount = await page.$eval('.notify-bell .notify-count', el => el.textContent.trim()).catch(() => 'ERR');
  check('C01 bell on home shows unread badge for player01', Number(bellCount) >= 1, `count=${bellCount}`);
  await page.click('.notify-bell');
  await page.waitForSelector('.notify-panel:not([hidden]) .notify-item');
  const panelText = await text('.notify-panel');
  check('C02 bell panel lists booking/confirm notifications', panelText.includes('ยืนยัน'), panelText.replace(/\n/g, ' ').slice(0, 100));

  // admin-guard: a non-admin must bounce to the login page
  await goto('/admin/index.html');
  await page.waitForFunction(() => /auth\/index\.html/.test(location.pathname), { timeout: 8000 });
  check('C03 non-admin bounced from admin/index.html to login', true);

  // admin: sub-page loads without bounce and carries the notification bell
  await goto('/auth/index.html');
  await page.evaluate(() => localStorage.removeItem('smashup_session_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('.demo-fill[data-user="admin"]');
  await page.click('#submitButton');
  await page.waitForFunction(() => /admin\/index\.html/.test(location.pathname), { timeout: 8000 });
  await goto('/admin/courts.html');
  await page.waitForSelector('.admin-topbar-right .notify-bell', { timeout: 8000 });
  check('C04 admin sub-page (courts) accessible + bell present in admin slot', true);
  const adminBellBadge = await page.$eval('.notify-bell .notify-count', el => el.textContent.trim()).catch(() => 'ERR');
  check('C05 admin bell badge renders', adminBellBadge !== 'ERR', `badge=${adminBellBadge}`);

  // ---------- SCENARIO 6: Tournament level seeding (UI) ----------
  // 4 players, levels A / C+ / C+ / C → top seed (A) must land in round-1 match 1 slot 0
  await goto('/booking/tournament.html');
  await page.waitForSelector('#btnGenBracket');
  await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('smashup_users_v1')) || [];
    const upsert = (u) => { const i = users.findIndex(x => x.username === u.username); if (i >= 0) users[i] = u; else users.push(u); };
    const mk = (id, username, level) => upsert({ id, username, name: id, email: username + '@x.com', passwordHash: 'demo', role: 'user', is_active: true, createdAt: new Date().toISOString(), profile: { assessment: { version: 2, selfLevel: level }, distance: 5, availability: '19:00', playFormat: 'double' } });
    mk('pong_a', 'pong_a', 'A');
    mk('pong_b', 'pong_b', 'C+');
    mk('pong_c', 'pong_c', 'C+');
    mk('pong_d', 'pong_d', 'C');
    localStorage.setItem('smashup_users_v1', JSON.stringify(users));
  });
  const tour = await page.evaluate(() => {
    const T = window.SmashTournament;
    const ev = 'SMASHUP CHAMPIONSHIP #1';
    const t = T.create({ name: ev, event: ev });
    const users = JSON.parse(localStorage.getItem('smashup_users_v1'));
    ['pong_a', 'pong_b', 'pong_c', 'pong_d'].forEach(uname => {
      const u = users.find(x => x.username === uname);
      T.register(t.id, { category: 'ชายเดี่ยว', level: u.profile.assessment.selfLevel }, { id: u.id, name: u.name });
    });
    return { id: t.id, regs: T.getById(t.id).registrations.length };
  });
check('D01 tournament created with 4 registrations (ชายเดี่ยว)', tour.regs === 4, `regs=${tour.regs}`);

  await page.$eval('.tab[data-tab="bracket"]', el => el.click());
  await page.waitForFunction(() => document.getElementById('bracketEvent').options.length >= 2, { timeout: 8000 });
  await page.select('#bracketEvent', tour.id);
  await page.select('#bracketCategory', 'ชายเดี่ยว');
  await page.click('#btnGenBracket');
  await page.waitForFunction(() => document.querySelectorAll('#bracketView .match').length >= 3, { timeout: 8000 });
  const bracketInfo = await page.evaluate(() => {
    const rounds = [...document.querySelectorAll('#bracketView .bracket-round')];
    const names = rounds.map(rd => [...rd.querySelectorAll('.match-player .name')].map(n => n.textContent.trim()));
    return {
      roundCount: rounds.length,
      matchCount: rounds.reduce((n, rd) => n + rd.querySelectorAll('.match').length, 0),
      firstMatchPlayer1: names[0] ? names[0][0] : '',
      round1Names: names[0] || [],
      allNames: [...new Set(names.flat())],
    };
  });
  check('D02 bracket renders rounds + matches (2+1)', bracketInfo.roundCount >= 2 && bracketInfo.matchCount >= 3, JSON.stringify(bracketInfo));
  check('D03 top seed (A) sits in round-1 match slot 0', bracketInfo.firstMatchPlayer1 === 'pong_a', bracketInfo.firstMatchPlayer1);
  check('D04 all 4 players appear across round 1', bracketInfo.round1Names.length === 4 && bracketInfo.allNames.filter(n => n !== 'TBA').length === 4, bracketInfo.round1Names.join(','));
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