const authUiScript = document.createElement('script');
authUiScript.src = '../shared/auth-ui.js';
document.head.append(authUiScript);
const themeStyle = document.createElement('link');
themeStyle.rel = 'stylesheet';
themeStyle.href = '../shared/theme.css';
document.head.append(themeStyle);
const formStyle = document.createElement('link');
formStyle.rel = 'stylesheet';
formStyle.href = 'form-compact.css';
document.head.append(formStyle);
const headerStyle = document.createElement('style');
headerStyle.textContent = '.booking-header { min-height: 70px; position: sticky; top: 0; z-index: 10; }';
document.head.append(headerStyle);

const BOOKING_STORAGE_KEY = 'smashup_bookings_v1';
const form = document.querySelector('#booking-form');
const date = document.querySelector('#date');
const estimate = document.querySelector('#estimate');
const success = document.querySelector('#success');
const currentUser = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
const courtNumbers = ['1','2','3','4','5','6','7','8','9','10','11','A','B'];
const BOOKING_WINDOW_DAYS = 7;
const PAYMENT_GRACE_MINUTES = 15;

function getBookings() { try { return JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY)) || []; } catch { return []; } }
function expireUnpaidBookings() { const now = Date.now(); const bookings = getBookings(); let changed = false; bookings.forEach((booking) => { if (booking.status === 'รอตรวจสอบการชำระเงิน' && booking.paymentDueAt && new Date(booking.paymentDueAt).getTime() < now) { booking.status = 'ยกเลิกแล้ว'; booking.cancelReason = 'หมดเวลาชำระเงิน'; changed = true; } }); if (changed) localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings)); return bookings; }
function isCourtAvailable(court, bookingDate, time) { return !getBookings().some((booking) => booking.date === bookingDate && booking.time === time && booking.court === court && booking.status !== 'ยกเลิกแล้ว'); }
function updateCourtOptions() {
  const court = form.elements.court;
  const time = form.elements.time.value;
  const selected = court.value;
  court.innerHTML = '<option value="">เลือกคอร์ต</option>' + courtNumbers.map((number) => `<option value="${number}" ${isCourtAvailable(number, date.value, time) ? '' : 'disabled'}>คอร์ต ${number}${isCourtAvailable(number, date.value, time) ? '' : ' (จองแล้ว)'}</option>`).join('');
  court.value = isCourtAvailable(selected, date.value, time) ? selected : '';
}

if (form && date && estimate && success) {
  expireUnpaidBookings();
  const oldCourtCount = document.querySelector('#courts');
  const field = oldCourtCount.closest('label');
  field.innerHTML = 'คอร์ตที่ต้องการ <b>*</b><select id="court" name="court" required></select>';
  const today = new Date();
  date.min = today.toISOString().split('T')[0];
  const latestBooking = new Date(today); latestBooking.setDate(today.getDate() + BOOKING_WINDOW_DAYS);
  date.max = latestBooking.toISOString().split('T')[0];
  if (currentUser && form.elements.name && !form.elements.name.value) form.elements.name.value = currentUser.name;
  date.addEventListener('change', updateCourtOptions);
  form.elements.time.addEventListener('change', updateCourtOptions);
  updateCourtOptions();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentUser) { success.innerHTML = 'กรุณา <a href="../auth/login.html?next=../booking/form.html">เข้าสู่ระบบ</a> ก่อนส่งคำขอจอง'; return; }
    const data = Object.fromEntries(new FormData(form));
    expireUnpaidBookings();
    if (!isCourtAvailable(data.court, data.date, data.time)) { success.textContent = 'คอร์ตนี้เพิ่งถูกจองไป กรุณาเลือกคอร์ตอื่น'; updateCourtOptions(); return; }
    const bookings = getBookings();
    const paymentDueAt = new Date(Date.now() + PAYMENT_GRACE_MINUTES * 60 * 1000).toISOString();
    bookings.push({ id: crypto.randomUUID(), date: data.date, time: data.time, court: data.court, name: data.name, phone: data.phone, amount: 130, status: 'รอตรวจสอบการชำระเงิน', paymentStatus: 'รอชำระเงิน', paymentDueAt, ownerId: currentUser.id, createdAt: new Date().toISOString() });
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
    success.innerHTML = `ล็อกคอร์ต ${data.court} ชั่วคราวแล้ว โปรดชำระเงินภายใน 15 นาที ดูสถานะได้ที่ <a href="my-bookings.html">รายการของฉัน</a>`;
    form.reset(); date.min = new Date().toISOString().split('T')[0]; if (currentUser) form.elements.name.value = currentUser.name; estimate.textContent = '฿ 130'; updateCourtOptions();
  });
}
