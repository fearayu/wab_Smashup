function initializeTopicNavigation() {
  const onMatchingPage = window.location.pathname.includes('/matching/');
  const bookingBase = onMatchingPage ? '../booking/' : '';
  const theme = document.createElement('link');
  theme.rel = 'stylesheet';
  theme.href = '../shared/theme.css';
  document.head.append(theme);

  const brand = document.querySelector('.brand');
  if (brand) {
    brand.setAttribute('aria-label', 'SMASHUP หน้าแรก');
    brand.innerHTML = '<span class="brand-mark">SU</span><span><strong>SMASHUP</strong><small>BADMINTON PROJECT</small></span>';
  }
  const sidebar = document.createElement('aside');
  sidebar.className = 'topic-sidebar';
  sidebar.setAttribute('aria-label', 'หัวข้อการใช้งาน');
  sidebar.innerHTML = `
  <a href="${bookingBase}rules.html"><span>▱</span>กฎการใช้สนาม</a>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>จองสนาม</button><div class="sidebar-submenu"><a href="${bookingBase}form.html"><i>▣</i>จองสนามแบดมินตัน</a><a href="${bookingBase}booking-info.html"><i>▦</i>ข้อมูลการจอง</a><a href="${bookingBase}regular-buffet-booking.html"><i>＋</i>จองตีบุฟเฟต์</a><a href="${bookingBase}regular-buffet-info.html"><i>▤</i>ข้อมูลตีบุฟเฟต์</a><a href="${bookingBase}regular-buffet-queue.html"><i>≡</i>คิวตีบุฟเฟต์</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>บุฟเฟ่ต์สำหรับมือใหม่</button><div class="sidebar-submenu"><a href="${bookingBase}beginner-buffet-booking.html"><i>＋</i>จองตีบุฟเฟต์</a><a href="${bookingBase}beginner-buffet-info.html"><i>▤</i>ข้อมูลตีบุฟเฟต์</a><a href="${bookingBase}beginner-buffet-queue.html"><i>≡</i>คิวตีบุฟเฟต์</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>การสมัครแข่งขัน</button><div class="sidebar-submenu"><a href="${bookingBase}tournament.html"><i>🏆</i>สมัครแข่งขัน</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>จองสนามซ้อม</button><div class="sidebar-submenu"><a href="${bookingBase}practice.html"><i>▣</i>จองสนามซ้อม</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>ลงชื่อซื้อของ</button><div class="sidebar-submenu"><a href="${bookingBase}shop.html"><i>＋</i>ลงทะเบียน/ซื้อของ</a></div></div>
  <a href="${bookingBase}my-bookings.html"><span>▣</span>รายการของฉัน</a>
  <a href="${onMatchingPage ? 'player-matching.html' : '../matching/player-matching.html'}"><span>🏸</span>หาคู่เล่น</a>`;
  document.body.prepend(sidebar);

  const header = document.querySelector('.topbar');
  if (header) {
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-toggle';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', 'topicSidebar');
    menuButton.innerHTML = '<span aria-hidden="true">☰</span> เมนู';
    sidebar.id = 'topicSidebar';
    header.append(menuButton);
    menuButton.addEventListener('click', () => {
      const opened = sidebar.classList.toggle('mobile-open');
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.innerHTML = opened ? '<span aria-hidden="true">×</span> ปิดเมนู' : '<span aria-hidden="true">☰</span> เมนู';
    });
    sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.innerHTML = '<span aria-hidden="true">☰</span> เมนู';
    }));
  }

  const layoutStyle = document.createElement('style');
  layoutStyle.textContent = `
    .topbar { min-height: 70px; position: sticky; top: 0; z-index: 10; }
    .topic-sidebar ~ .topic-main { margin-left: 280px; max-width: none; }
    .topic-sidebar ~ .matching-main { margin-left: 280px; }
    @media (max-width: 900px) { .topic-sidebar ~ .topic-main, .topic-sidebar ~ .matching-main { margin-left: 248px; } }
    @media (max-width: 760px) { .topic-sidebar ~ .topic-main, .topic-sidebar ~ .matching-main { margin-left: 0; } }
    .mobile-menu-toggle { display: none; }
    .horizontal-hint { color: #607681; display: none; font-size: 12px; margin: 0 0 8px; }
    @media (max-width: 760px) { .topbar .back { display: none; } .mobile-menu-toggle { align-items: center; background: #126f9e; border: 0; border-radius: 6px; color: #fff; display: inline-flex; font: 500 13px 'Kanit', sans-serif; gap: 6px; padding: 9px 11px; width: auto; } .topic-sidebar { display: none !important; } .topic-sidebar.mobile-open { display: flex !important; } .horizontal-hint { display: block; } }
  `;
  document.head.append(layoutStyle);

  document.querySelectorAll('.table-scroll, .schedule-scroll, .history-scroll').forEach((scrollArea) => {
    if (!scrollArea.previousElementSibling?.classList.contains('horizontal-hint')) scrollArea.insertAdjacentHTML('beforebegin', '<p class="horizontal-hint">↔ เลื่อนซ้าย–ขวาเพื่อดูข้อมูลทั้งหมด</p>');
  });

  const authScript = document.createElement('script');
  authScript.src = '../shared/auth-ui.js';
  document.body.append(authScript);

  const currentPage = `${window.location.pathname.split('/').pop() || 'index.html'}${window.location.search}`;
  sidebar.querySelectorAll('a[href]').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
      const parentGroup = link.closest('.sidebar-group');
      if (parentGroup) {
        parentGroup.classList.add('is-open');
        parentGroup.querySelector('.group-title').setAttribute('aria-expanded', 'true');
      }
    }
  });

  sidebar.querySelectorAll('.group-title').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.sidebar-group');
      const isOpen = !group.classList.contains('is-open');
      sidebar.querySelectorAll('.sidebar-group.is-open').forEach((openGroup) => {
        openGroup.classList.remove('is-open');
        openGroup.querySelector('.group-title').setAttribute('aria-expanded', 'false');
      });
      group.classList.toggle('is-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTopicNavigation);
} else {
  initializeTopicNavigation();
}
