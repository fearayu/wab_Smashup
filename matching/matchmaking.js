// Matchmaking – Vanilla JS (real registered users + real invitations, rule-based scoring)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

$('#menuToggle')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));

const coreScript = document.createElement('script');
coreScript.src = '../shared/match-core.js';
document.head.append(coreScript);

const apptScript = document.createElement('script');
apptScript.src = '../shared/appointments.js';
document.head.append(apptScript);

function getUsers() { try { const l = JSON.parse(localStorage.getItem('smashup_users_v1')); return Array.isArray(l) ? l : []; } catch { return []; } }
function getSession() { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } }
function levelOf(u) { const a = u.profile && u.profile.assessment; return (a && (a.confirmedLevel || a.selfLevel)) || ''; }
function distanceOf(u) { const d = u.profile && u.profile.distance; return (Number.isFinite(Number(d)) && Number(d) >= 0) ? Number(d) : null; }
function timeOf(u) { return (u.profile && (u.profile.availability || u.profile.playTime)) || ''; }

// Build candidate pool from registered, non-admin, non-banned users only.
// Demo players are only appended when there are no registered candidates at all,
// and they are clearly marked as demo data that cannot be invited.
function buildPool() {
  const me = getSession();
  const pool = [];
  getUsers().forEach(u => {
    if (u.role === 'admin') return;
    if (me && (u.id === me.id || u.username === me.id || u.username === me.name)) return;
    if (u.deleted || u.is_active === false) return;
    const level = levelOf(u);
    const name = u.username || u.name || u.email || 'ผู้เล่น';
    pool.push({
      id: u.id,
      username: u.username || name,
      name,
      level,
      bucket: '',
      label: '',
      levelSource: null,
      distanceKm: distanceOf(u),
      distanceLabel: distanceOf(u) == null ? 'ไม่ระบุระยะทาง' : distanceOf(u) + ' กม.',
      time: timeOf(u),
      format: (u.profile && u.profile.playFormat) || 'double',
      fake: false
    });
  });

  if (pool.length === 0) {
    const demo = [
      { name: 'คุณบีม', level: 'P', time: '19:00', format: 'single' },
      { name: 'คุณต้น', level: 'N', time: '18:30', format: 'double' },
      { name: 'คุณมายด์', level: 'C+', time: '20:00', format: 'single' },
      { name: 'คุณโอ๊ต', level: 'P+', time: '19:30', format: 'double' },
    ];
    demo.forEach(d => pool.push({ id: 'demo-' + d.name, username: d.name, name: d.name, level: d.level, bucket: '', label: '', levelSource: null, distanceKm: null, distanceLabel: 'ข้อมูลสาธิต', time: d.time, format: d.format, fake: true }));
  }
  return pool;
}

function badgeClass(p) { return p.m >= 85 ? 'high' : p.m >= 75 ? 'mid' : ''; }

const SCORE_HINT = 'คะแนน = ระดับ 70% + เวลาที่สะดวก 15% + ระยะทาง 15% เป็นค่าทดลอง ไม่ใช่โอกาสนัดหมายสำเร็จและไม่ใช่ AI';
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function render(list) {
  const grid = $('#cardGrid');
  const count = $('#resultCount');
  if (count) count.textContent = `${list.length} คน`;
  grid.innerHTML = list.map(p => {
    const src = p.levelSource ? (p.levelSource.source === 'organizer-confirmed' ? 'ผู้จัดยืนยัน' : 'ประเมินเอง') : 'ยังไม่ยืนยัน';
    const reasons = (p.reasons || []).map(r => `<span class="chip">${r}</span>`).join('');
    const badge = p.fake ? `<div class="match-badge"><strong>สาธิต</strong><small style="font:400 10px Kanit">ข้อมูลตัวอย่าง</small></div>`
      : `<div class="match-badge ${badgeClass(p)}">${p.m}%<br><small style="font:400 10px Kanit">ตรงกัน</small></div>`;
    return `
    <article class="player-card" data-id="${p.id}">
      <div class="card-top">
        <div class="avatar">${p.name.charAt(0)}</div>
        <div class="card-meta"><strong>${p.name}</strong><small>${p.label || ''}${p.level ? ' • ' + p.level : ''} • ${p.levelSource ? src : 'ยังไม่ยืนยันระดับ'}${p.fake ? ' • สาธิต' : ''}</small></div>
        ${badge}
      </div>
      <div class="card-details">
        ${p.level ? `<span class="chip level">${p.level} — ${p.bucketLabel || ''}</span>` : ''}
        <span class="chip">เวลา ${p.time || 'ไม่ระบุ'}</span>
        <span class="chip">${p.distanceLabel}</span>
        <span class="chip">${p.format === 'single' ? 'เดี่ยว' : 'คู่'}</span>
        ${reasons}
        <span class="chip muted">${SCORE_HINT}</span>
      </div>
      ${p.fake
        ? `<button type="button" class="btn-primary" disabled>ข้อมูลสาธิต — ไม่สามารถส่งคำเชิญ</button>`
        : `<button type="button" class="btn-primary invite-btn" data-id="${esc(p.id)}" data-name="${esc(p.name)}">ส่งคำเชิญ</button>`}
    </article>`;
  }).join('');

  grid.querySelectorAll('.invite-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const me = getSession();
      if (!me) { alert('กรุณาเข้าสู่ระบบก่อนส่งคำเชิญ'); return; }
      const App = window.SmashAppointments;
      if (!App) { alert('ระบบคำเชิญยังโหลดไม่เสร็จ กรุณาโหลดหน้าใหม่'); return; }
      const date = new Date().toISOString().split('T')[0];
      try {
        App.send({ receiverId: btn.dataset.id, receiverName: btn.dataset.name, date, time: '19:00', court: 'คอร์ต 1 • SMASHUP', note: 'ส่งจากหน้าหาคู่เล่น' }, me);
        btn.textContent = '✓ ส่งคำเชิญแล้ว';
        btn.disabled = true;
        alert('ส่งคำเชิญแล้ว — ผู้เล่นตอบรับในหน้า "นัดหมายของฉัน"');
      } catch (e) { alert(e.message); }
    });
  });
}

function filtered() {
  const core = window.SmashMatch;
  if (!core) return [];
  const skill = $('#skillLevel').value;
  const dist = $('#distance').value;
  const me = getSession();
  const myProfile = me ? getUsers().find(u => u.id === me.id || u.username === me.id) : null;
  const myLevel = myProfile ? levelOf(myProfile) : '';
  const myTime = myProfile ? timeOf(myProfile) : ($('#playDateTime')?.value || '');
  const myFormat = (myProfile && myProfile.profile && myProfile.profile.playFormat) || '';
  const chosenFormat = $('#matchType')?.value || '';

  // Reference level for scoring: the logged-in user's real level if present,
  // otherwise the representative level of the selected filter bucket.
  const refLevel = core.levelRank(myLevel) ? myLevel : (skill ? { beginner: 'N', intermediate: 'P', advanced: 'C+' }[skill] : '');

  return buildPool()
    .filter(p => chosenFormat ? (p.format || 'double') === chosenFormat : true)
    .filter(p => myFormat ? (p.format || 'double') === myFormat : true)
    .filter(p => skill ? core.bucket(p.level) === skill : true)
    .filter(p => !dist || p.distanceKm == null || p.distanceKm <= Number(dist))
    .map(p => {
      const res = core.scoreCandidate(refLevel || p.level, myTime || null, dist || '', {
        level: p.level,
        time: p.time,
        distanceKm: p.distanceKm,
      });
      const b = core.bucket(p.level);
      return {
        ...p,
        bucket: b,
        bucketLabel: b ? core.BUCKET_LABEL[b] : 'ยังไม่ระบุ',
        levelSource: p.fake ? { source: 'none', label: '' } : core.levelSource(getUsers().find(u => u.id === p.id)),
        m: res.total,
        ...res,
      };
    })
    .sort((a, b) => b.m - a.m)
    .slice(0, 8);
}

$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const skill = $('#skillLevel').value;
  const msg = $('#searchMessage');
  if (!skill) { msg.textContent = 'กรุณาเลือกระดับฝีมือก่อนค้นหา'; msg.className = 'form-message error'; return; }
  msg.textContent = 'กำลังค้นหาผู้เล่นที่ตรงกับเงื่อนไขของคุณ...';
  msg.className = 'form-message';
  setTimeout(() => {
    const list = filtered();
    const sort = $('#sortBy').value;
    if (sort === 'level') list.sort((a, b) => coreRank(b) - coreRank(a));
    else list.sort((a, b) => b.m - a.m);
    render(list);
    msg.textContent = `พบ ${list.length} คนที่ตรงกับเงื่อนไข · ${SCORE_HINT}`;
    $('#resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
});

function coreRank(p) { const r = window.SmashMatch && window.SmashMatch.levelRank(p.level); return r || 0; }

$('#sortBy').addEventListener('change', () => {
  const list = filtered();
  const sort = $('#sortBy').value;
  if (sort === 'level') list.sort((a, b) => coreRank(b) - coreRank(a));
  else list.sort((a, b) => b.m - a.m);
  render(list);
});

function initialList() {
  const core = window.SmashMatch;
  if (!core) return [];
  return buildPool().map(p => {
    const res = core.scoreCandidate(p.level || 'P', p.time, '', { level: p.level || 'P', time: p.time, distanceKm: p.distanceKm });
    return { ...p, bucket: core.bucket(p.level || 'P'), bucketLabel: core.BUCKET_LABEL[core.bucket(p.level || 'P')], levelSource: p.fake ? { source: 'none', label: '' } : core.levelSource(getUsers().find(u => u.id === p.id)), m: res.total, ...res };
  }).sort((a, b) => b.m - a.m);
}

// wait for both scripts then initial render
function boot() { render(initialList()); }
coreScript.onload = () => { if (window.SmashAppointments) boot(); };
apptScript.onload = () => { if (window.SmashMatch) boot(); };

// persist search filters
try {
  const s = JSON.parse(localStorage.getItem('smashup_matchmaking_search_v1') || 'null');
  if (s) { $('#skillLevel').value = s.skillLevel || ''; $('#matchType').value = s.matchType || ''; $('#playDateTime').value = s.playDateTime || ''; $('#distance').value = s.distance || ''; }
} catch { }
['skillLevel', 'matchType', 'playDateTime', 'distance'].forEach(id => $('#' + id)?.addEventListener('change', () => {
  localStorage.setItem('smashup_matchmaking_search_v1', JSON.stringify({
    skillLevel: $('#skillLevel').value, matchType: $('#matchType').value, playDateTime: $('#playDateTime').value, distance: $('#distance').value
  }));
}));