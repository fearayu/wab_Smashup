function initializeTopicNavigation() {
  const brand = document.querySelector('.brand');
  if (brand) {
    brand.setAttribute('aria-label', 'SMASHUP หน้าแรก');
    brand.innerHTML = '<span class="brand-mark">SU</span><span><strong>SMASHUP</strong><small>BADMINTON PROJECT</small></span>';
  }
  const sidebar = document.createElement('aside');
  sidebar.className = 'topic-sidebar';
  sidebar.setAttribute('aria-label', 'หัวข้อการใช้งาน');
  sidebar.innerHTML = `
  <a href="rules.html"><span>▱</span>กฎการใช้สนาม</a>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>จองสนาม</button><div class="sidebar-submenu"><a href="form.html"><i>▣</i>จองสนามแบดมินตัน</a><a href="booking-info.html"><i>▦</i>ข้อมูลการจอง</a><a href="buffet-booking.html"><i>＋</i>จองตีบุฟเฟต์</a><a href="buffet-info.html"><i>▤</i>ข้อมูลตีบุฟเฟต์</a><a href="buffet-queue.html"><i>≡</i>คิวตีบุฟเฟต์</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>บุฟเฟ่ต์สำหรับมือใหม่</button><div class="sidebar-submenu"><a href="buffet-booking.html?audience=beginner"><i>＋</i>จองตีบุฟเฟต์</a><a href="buffet-info.html?audience=beginner"><i>▤</i>ข้อมูลตีบุฟเฟต์</a><a href="buffet-queue.html?audience=beginner"><i>≡</i>คิวตีบุฟเฟต์</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>การสมัครแข่งขัน</button><div class="sidebar-submenu"><a href="tournament.html"><i>🏆</i>สมัครแข่งขัน</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>จองสนามซ้อม</button><div class="sidebar-submenu"><a href="practice.html"><i>▣</i>จองสนามซ้อม</a></div></div>
  <div class="sidebar-group"><button class="group-title" type="button" aria-expanded="false"><span>⌄</span>ลงชื่อซื้อของ</button><div class="sidebar-submenu"><a href="shop.html"><i>＋</i>ลงทะเบียน/ซื้อของ</a></div></div>
  <a href="../matching/index.html"><span>🏸</span>หาคู่เล่น</a>`;
  document.body.prepend(sidebar);

  const layoutStyle = document.createElement('style');
  layoutStyle.textContent = `
    .topic-sidebar ~ .topic-main { margin-left: 280px; max-width: none; }
    @media (max-width: 900px) { .topic-sidebar ~ .topic-main { margin-left: 248px; } }
    @media (max-width: 760px) { .topic-sidebar ~ .topic-main { margin-left: 0; } }
  `;
  document.head.append(layoutStyle);

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
