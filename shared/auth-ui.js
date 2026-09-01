(function () {
  const SESSION_KEY = 'smashup_session_v1';
  const session = (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } })();
  const isNested = /\/(booking|matching)\//.test(location.pathname.replace(/\\/g, '/'));
  const authUrl = `${isNested ? '../' : ''}auth/login.html`;
  const adminUrl = `${isNested ? '../' : ''}admin/admin-dashboard.html`;
  const header = document.querySelector('.site-header, .booking-header, .topbar');
  if (!header || header.querySelector('.auth-link')) return;
  const control = document.createElement('div');
  control.className = 'auth-link';
  if (session?.name) { control.innerHTML = `<span>สวัสดี, ${escapeHtml(session.name)}</span>${session.role === 'admin' ? `<a class="admin-return" href="${adminUrl}">หน้าแอดมิน</a>` : ''}<button type="button">ออกจากระบบ</button>`; control.querySelector('button').addEventListener('click', () => { localStorage.removeItem(SESSION_KEY); location.reload(); }); } else { control.innerHTML = `<a href="${authUrl}">เข้าสู่ระบบ</a>`; }
  header.append(control);
  const style = document.createElement('style');
  style.textContent = `.auth-link{align-items:center;display:flex;gap:10px;margin-left:14px;white-space:nowrap}.auth-link a,.auth-link button{background:#1683b4;border:0;border-radius:6px;color:#fff;cursor:pointer;font:500 13px Kanit,sans-serif;padding:8px 11px;text-decoration:none}.auth-link .admin-return{background:#0b3a5b}.auth-link span{color:#595651;font-size:13px}@media(max-width:760px){.auth-link span{display:none}.auth-link{gap:6px;margin-left:6px}.auth-link a,.auth-link button{padding:8px 9px}}`;
  document.head.append(style);
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
})();
