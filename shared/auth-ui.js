(function () {
  const SESSION_KEY = 'smashup_session_v1';
  const session = (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } })();
  const isNested = /\/(booking|matching|appointments|admin)\//.test(location.pathname.replace(/\\/g, '/'));
  const authUrl = `${isNested ? '../' : ''}auth/index.html`;
  const header = document.querySelector('.site-header, .booking-header, .topbar, .app-topbar');
  if (!header || header.querySelector('.auth-link')) return;
  const control = document.createElement('div');
  control.className = 'auth-link';
  if (session?.name) {
    control.innerHTML = `<span>สวัสดี, ${escapeHtml(session.name)}</span><button type="button">ออกจากระบบ</button>`;
    control.querySelector('button').addEventListener('click', () => { localStorage.removeItem(SESSION_KEY); location.reload(); });
  } else {
    control.innerHTML = `<a href="${authUrl}">เข้าสู่ระบบ</a>`;
  }
  const slot = header.querySelector('.topbar-right');
  if (slot) slot.append(control); else header.append(control);
  const style = document.createElement('style');
  style.textContent = `.auth-link{align-items:center;display:flex;gap:10px;margin-left:14px;white-space:nowrap}.auth-link a,.auth-link button{background:var(--orange,#f4511e);border:0;border-radius:8px;color:#fff;cursor:pointer;font:600 13px 'Kanit',sans-serif;padding:8px 12px;text-decoration:none}.auth-link a:hover,.auth-link button:hover{background:var(--orange-hover,#e34714)}.auth-link span{color:#595651;font-size:13px}@media(max-width:760px){.auth-link span{display:none}.auth-link{margin-left:6px}}`;
  document.head.append(style);
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
})();