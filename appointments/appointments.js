// Appointments – real localStorage backend
const $ = (s, r = document) => r.querySelector(s);

const apptScript = document.createElement('script');
apptScript.src = '../shared/appointments.js';
document.head.append(apptScript);

$('#menuToggle')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));

function fmtDateThai(date) {
  try {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = new Date(date + 'T00:00:00');
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  } catch { return date; }
}

let App = null;

function renderInvites() {
  App = App || window.SmashAppointments;
  if (!App) return;
  App.resolveIds();
  const invites = App.myReceived();
  const count = $('#inviteCount');
  const list = $('#inviteList');
  count.textContent = String(invites.length);
  $('#inviteEmpty').hidden = invites.length !== 0;
  list.innerHTML = invites.map(inv => {
    return `<article class="invite-card" data-id="${inv.id}">
      <div class="invite-avatar">${(inv.senderName || '?').charAt(0).toUpperCase()}</div>
      <div class="invite-info"><strong>${App.escape ? App.escape(inv.senderName || '') : inv.senderName || ''}</strong>
        <span>${fmtDateThai(inv.date)} • ${App.escape ? App.escape(inv.time || '') : inv.time || ''}</span>
        <div class="invite-meta"><span>📍 ${App.escape ? App.escape(inv.court || '') : inv.court || ''}</span>${inv.note ? `<span>📝 ${App.escape ? App.escape(inv.note) : inv.note}</span>` : ''}</div></div>
      <div class="invite-actions"><button class="btn-primary" data-action="accept">ตอบรับ</button><button class="btn-secondary" data-action="decline">ปฏิเสธ</button></div>
    </article>`;
  }).join('');

  list.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.invite-card').dataset.id;
      const action = btn.dataset.action;
      try {
        const me = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
        App.respond(id, action, me);
        window.dispatchEvent(new Event('smashup-data'));
        renderInvites(); renderSchedule();
      } catch (e) {
        alert(e.message);
      }
    });
  });
}

function scheduleStatusBadge(status) {
  if (status === 'accepted') return '<span class="badge green">ยืนยันแล้ว</span>';
  if (status === 'pending') return '<span class="badge orange">รอยืนยัน</span>';
  if (status === 'declined') return '<span class="badge gray">ปฏิเสธแล้ว</span>';
  if (status === 'cancelled' || status === 'auto-cancelled') return '<span class="badge gray">ยกเลิกแล้ว</span>';
  return '<span class="badge gray">' + (status || '') + '</span>';
}

function renderSchedule() {
  App = App || window.SmashAppointments;
  if (!App) return;
  const tbody = $('#scheduleBody');
  const rows = App.mySchedule();
  tbody.innerHTML = rows.map(row => {
    const me = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
    const partner = row.senderId === me?.id ? row.receiverName : row.senderName;
    return `<tr><td>${fmtDateThai(row.date)}</td><td>${row.time}</td><td>${row.court}</td><td>${partner || ''}</td><td>${scheduleStatusBadge(row.status)}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px">ยังไม่มีนัดหมาย — ส่งคำเชิญจากแบบฟอร์มด้านล่าง</td></tr>`;
}

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    const target = tab.dataset.tab;
    document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
    const panel = target === 'invites' ? $('#panel-invites') : $('#panel-schedule');
    panel.hidden = false; panel.classList.remove('active'); void panel.offsetWidth; panel.classList.add('active');
  });
});

// Send invitation form
$('#sendForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  App = App || window.SmashAppointments;
  if (!App) return;
  const me = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
  if (!me) { alert('กรุณาเข้าสู่ระบบก่อนส่งคำเชิญ'); return; }
  const data = Object.fromEntries(new FormData(e.target));
  try {
    App.send(data, me);
    e.target.reset();
    $('#sendFormMessage').hidden = false;
    $('#sendFormMessage').className = 'form-message success';
    $('#sendFormMessage').textContent = 'ส่งคำเชิญแล้ว — รอผู้รับตอบรับ · แสดงในตารางนัดหมายของฉัน';
    window.dispatchEvent(new Event('smashup-data'));
    renderSchedule();
  } catch (err) {
    $('#sendFormMessage').hidden = false;
    $('#sendFormMessage').className = 'form-message error';
    $('#sendFormMessage').textContent = err.message;
  }
});

window.addEventListener('smashup-data', () => { renderInvites(); renderSchedule(); });
window.addEventListener('storage', (e) => { if (e.key === 'smashup_appointments_v1') { renderInvites(); renderSchedule(); } });

apptScript.onload = () => { renderInvites(); renderSchedule(); };

const dateInput = $('input[name="date"]');
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];
  dateInput.value = dateInput.min;
}