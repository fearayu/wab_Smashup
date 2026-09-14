(function () {
  const header = document.querySelector('.site-header, .booking-header, .topbar, .app-topbar');
  if (!header || header.querySelector('.notify-bell')) return;
  let slot = header.querySelector('.topbar-right, .header-right, .admin-topbar-right');
  if (!slot) {
    slot = document.createElement('div');
    slot.className = 'topbar-right';
    header.append(slot);
  }
  if (slot.querySelector('.notify-bell')) return;
  if (!document.querySelector('script[src*="notifications.js"], script[src*="notifications"]')) return;

  let open = false;

  function currentUser() { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } }
  function authUrl() {
    const path = location.pathname.replace(/\\/g, '/');
    const base = /\/(booking|matching|appointments|admin)\//.test(path) ? '../auth/index.html' : 'auth/index.html';
    return base;
  }
  function fmtTime(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const today = new Date();
      const sameDay = d.toDateString() === today.toDateString();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      if (sameDay) return `${hh}:${mm} น.`;
      return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${hh}:${mm} น.`;
    } catch { return ''; }
  }
  function typeIcon(type) {
    return type === 'invite' ? '◈' : type === 'tournament' ? '🏆' : type === 'booking' ? '▦' : 'ℹ';
  }

  function renderButtons() {
    const N = window.SmashNotify;
    if (!N) return;
    const user = currentUser();
    const count = user ? N.unreadCount(user.id) : 0;
    countEl.textContent = count > 99 ? '99+' : String(count);
    bell.setAttribute('aria-label', user && count ? `การแจ้งเตือน ${count} รายการที่ยังไม่ได้อ่าน` : 'การแจ้งเตือน');
    if (count > 0) bell.classList.add('has-unread'); else bell.classList.remove('has-unread');
  }

  function renderPanel() {
    const N = window.SmashNotify;
    if (!N) return;
    const user = currentUser();
    const list = user ? N.forUser(user.id).slice(0, 30) : [];
    if (!list.length) {
      panelItems.innerHTML = '<div class="notify-empty">ยังไม่มีการแจ้งเตือน</div>';
    } else {
      panelItems.innerHTML = list.map(n => {
        const isNew = !n.read;
        return '<a class="notify-item' + (isNew ? ' unread' : '') + '" href="' + (n.link ? n.link.replace(/"/g, '&quot;') : '#') + '" data-id="' + n.id + '">' +
          '<span class="notify-icon">' + typeIcon(n.type) + '</span>' +
          '<span class="notify-text"><b>' + String(n.title).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) + '</b>' +
          (n.body ? '<span>' + String(n.body).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) + '</span>' : '') +
          '<small>' + fmtTime(n.createdAt) + '</small></span></a>';
      }).join('');
    }
    const empty = !user || !list.length;
    emptyEl.hidden = true;
    markBtn.style.display = empty ? 'none' : '';
    if (user && list.length && !list.some(n => !n.read)) markBtn.style.display = 'none';
  }

  function panelRefresh() {
    renderPanel();
    renderButtons();
  }

  const bell = document.createElement('button');
  bell.type = 'button';
  bell.className = 'notify-bell';
  bell.setAttribute('aria-haspopup', 'dialog');
  bell.innerHTML = '<span class="notify-icon-bell" aria-hidden="true">◉</span><span class="notify-count" role="status" aria-live="polite">0</span>';
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    const user = currentUser();
    if (!user) { location.href = authUrl(); return; }
    open = !open;
    panel.hidden = !open;
    if (open) renderPanel();
  });

  const countEl = bell.querySelector('.notify-count');

  const panel = document.createElement('div');
  panel.className = 'notify-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');

  const panelHead = document.createElement('div');
  panelHead.className = 'notify-head';
  panelHead.innerHTML = '<strong>การแจ้งเตือน</strong>';

  const markBtn = document.createElement('button');
  markBtn.type = 'button';
  markBtn.textContent = 'อ่านทั้งหมด';
  markBtn.addEventListener('click', () => {
    const user = currentUser();
    if (!user || !window.SmashNotify) return;
    try { window.SmashNotify.markAllRead(user.id); renderPanel(); renderButtons(); } catch {}
  });
  panelHead.append(markBtn);

  const panelItems = document.createElement('div');
  panelItems.className = 'notify-items';

  const emptyEl = document.createElement('div');

  panel.append(panelHead, panelItems, emptyEl);

  // mark read on click + navigate
  panelItems.addEventListener('click', (e) => {
    const user = currentUser();
    const item = e.target.closest('.notify-item');
    if (!item || !user || !window.SmashNotify) return;
    const id = item.dataset.id;
    try { window.SmashNotify.markRead(id, user.id); } catch {}
    renderButtons();
    if (item.getAttribute('href') === '#' || !item.getAttribute('href')) e.preventDefault();
  });

  slot.append(bell, panel);

  document.addEventListener('click', (e) => {
    if (open && !e.target.closest('.notify-panel') && !e.target.closest('.notify-bell')) {
      open = false; panel.hidden = true;
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { open = false; panel.hidden = true; } });
  window.addEventListener('storage', (e) => { if (e.key === 'smashup_notifications_v1' || e.key === 'smashup_session_v1') { renderButtons(); if (open) renderPanel(); } });
  window.addEventListener('smashup-notify', () => { renderButtons(); if (open) renderPanel(); });

  const style = document.createElement('style');
  style.textContent = `
.notify-bell{position:relative;background:none;border:0;color:#595651;cursor:pointer;font-size:18px;width:36px;height:36px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-left:6px}
.notify-bell:hover{background:rgba(244,81,30,.08)}
.notify-icon-bell{line-height:1}
.notify-count{position:absolute;top:-2px;right:-4px;background:#dc2626;color:#fff;font:700 10px/1 'Kanit',sans-serif;min-width:16px;height:16px;border-radius:99px;display:flex;align-items:center;justify-content:center;padding:0 3px}
.notify-panel{position:absolute;top:calc(100% + 8px);right:12px;width:340px;max-width:92vw;background:#fff;border:1px solid #eee7e0;border-radius:14px;box-shadow:0 16px 44px rgba(20,15,10,.16);z-index:1200;overflow:hidden}
.notify-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #f0ebe5}
.notify-head strong{font:700 14px 'Kanit',sans-serif;color:#0f2f4a}
.notify-head button{background:none;border:0;color:var(--orange,#f4511e);font:600 12px 'Kanit',sans-serif;cursor:pointer}
.notify-items{max-height:340px;overflow-y:auto}
.notify-item{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid #f6f1ec;text-decoration:none;color:inherit}
.notify-item:hover{background:#fcf8f3}
.notify-item.unread{background:#fef3ec}
.notify-icon{flex:0 0 30px;width:30px;height:30px;border-radius:8px;background:var(--orange,#f4511e);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px}
.notify-text{display:flex;flex-direction:column;gap:2px}
.notify-text b{font:600 13px 'Kanit',sans-serif;color:#241e18}
.notify-text span{font:400 12px 'Kanit',sans-serif;color:#7a746d}
.notify-text small{font:400 11px 'Kanit',sans-serif;color:#b3aca3}
.notify-empty{padding:28px 16px;text-align:center;color:#8f8880;font-size:13px}
@media(max-width:600px){.notify-panel{position:fixed;top:56px;right:8px;left:8px;width:auto}}
`;
  document.head.append(style);

  renderButtons();
})();