(() => {
  const sidebar = document.querySelector('.topic-sidebar');
  const header = document.querySelector('.booking-header');
  if (!sidebar || !header || document.querySelector('.mobile-menu-toggle')) return;
  const button = document.createElement('button');
  button.className = 'mobile-menu-toggle'; button.type = 'button'; button.setAttribute('aria-expanded', 'false'); button.innerHTML = '☰ เมนู';
  header.append(button);
  const style = document.createElement('style');
  style.textContent = '@media(max-width:760px){.booking-header{gap:8px;padding:14px 16px}.booking-header .back-link{display:none}.mobile-menu-toggle{background:#126f9e;border:0;border-radius:6px;color:#fff;display:inline-flex;font:500 13px Kanit,sans-serif;padding:9px 11px;width:auto}.topic-sidebar{display:none!important}.topic-sidebar.mobile-open{display:flex!important}.horizontal-hint{color:#607681;display:block;font-size:12px;margin:0 0 8px}}@media(min-width:761px){.mobile-menu-toggle{display:none}.horizontal-hint{display:none}}';
  document.head.append(style);
  button.addEventListener('click', () => { const opened = sidebar.classList.toggle('mobile-open'); button.setAttribute('aria-expanded', String(opened)); button.textContent = opened ? '× ปิดเมนู' : '☰ เมนู'; });
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { sidebar.classList.remove('mobile-open'); button.setAttribute('aria-expanded', 'false'); button.textContent = '☰ เมนู'; }));
  document.querySelectorAll('.table-scroll, .schedule-scroll, .history-scroll').forEach(area => { if (!area.previousElementSibling?.classList.contains('horizontal-hint')) area.insertAdjacentHTML('beforebegin', '<p class="horizontal-hint">↔ เลื่อนซ้าย–ขวาเพื่อดูข้อมูลทั้งหมด</p>'); });
})();
