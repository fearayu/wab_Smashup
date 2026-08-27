const nav = document.querySelector('.main-nav');
const menuToggle = document.querySelector('.menu-toggle');
const dateInput = document.querySelector('#date');
const courtsInput = document.querySelector('#courts');
const timeInput = document.querySelector('#time');
const estimate = document.querySelector('#estimate');
const bookingForm = document.querySelector('#booking-form');
const successMessage = document.querySelector('#booking-success');
const homeView = document.querySelector('#home-view');
const contentView = document.querySelector('#content-view');
const viewLinks = document.querySelectorAll('[data-view]');

const today = new Date();
dateInput.min = today.toISOString().split('T')[0];

actionMenu();
updateEstimate();

function actionMenu() {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
  viewLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const view = link.dataset.view;
      showView(view, link.getAttribute('href'));
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function showView(view, target) {
  const isHome = view === 'home';
  homeView.classList.toggle('is-visible', isHome);
  contentView.classList.toggle('is-visible', !isHome);
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  history.replaceState(null, '', target || (isHome ? '#home' : '#booking'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (target && target !== '#home' && target !== '#booking') {
    requestAnimationFrame(() => document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' }));
  }
}

function updateEstimate() {
  const courtCount = Number(courtsInput.value || 0);
  estimate.textContent = `฿ ${(courtCount * 180).toLocaleString('th-TH')}`;
}

courtsInput.addEventListener('change', updateEstimate);
bookingForm.addEventListener('input', () => { successMessage.textContent = ''; });

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const formattedDate = new Date(`${formData.get('date')}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  successMessage.textContent = `รับข้อมูลแล้ว คุณ ${formData.get('name')} จองวันที่ ${formattedDate} เวลา ${formData.get('time')} จำนวน ${formData.get('courts')} คอร์ต เราจะติดต่อกลับเร็ว ๆ นี้`;
  bookingForm.reset();
  dateInput.min = today.toISOString().split('T')[0];
  estimate.textContent = '฿ 0';
});

const navLinks = document.querySelectorAll('.main-nav > a:not(.nav-cta)');
const sections = document.querySelectorAll('.content-view section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => observer.observe(section));

window.addEventListener('popstate', () => showView(window.location.hash === '#home' ? 'home' : 'content', window.location.hash));
