const buffetStorageKey = 'smashup_buffet_bookings_v1';
const buffetForm = document.querySelector('#buffetForm');
const buffetDate = document.querySelector('#buffetDate');
const shuttleSelect = buffetForm.elements.shuttle;
const buffetPrice = document.querySelector('#buffetPrice');
const buffetMessage = document.querySelector('#buffetMessage');
const currentMember = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
const BUFFET_CAPACITY = 30;
const BUFFET_BOOKING_WINDOW_DAYS = 7;
function updateBuffetPrice() { buffetPrice.textContent = `฿ ${(60 + Number(shuttleSelect.value || 0)).toLocaleString('th-TH')}`; }
buffetDate.min = new Date().toISOString().split('T')[0];
const buffetLastDate = new Date(); buffetLastDate.setDate(buffetLastDate.getDate() + BUFFET_BOOKING_WINDOW_DAYS); buffetDate.max = buffetLastDate.toISOString().split('T')[0];
buffetDate.value = buffetDate.min;
if (currentMember && !document.querySelector('#buffetName').value) document.querySelector('#buffetName').value = currentMember.name;
shuttleSelect.addEventListener('change', updateBuffetPrice);
buffetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!currentMember) { buffetMessage.className = 'form-message error'; buffetMessage.innerHTML = 'กรุณา <a href="../auth/login.html?next=../booking/regular-buffet-booking.html">เข้าสู่ระบบ</a> ก่อนลงชื่อ'; return; }
  const data = Object.fromEntries(new FormData(buffetForm));
  const bookings = (() => { try { return JSON.parse(localStorage.getItem(buffetStorageKey)) || []; } catch { return []; } })();
  const sameSession = bookings.filter((booking) => booking.date === data.date && booking.session === data.session && booking.status !== 'ยกเลิกแล้ว');
  if (sameSession.some((booking) => booking.ownerId === currentMember.id)) { buffetMessage.className = 'form-message error'; buffetMessage.textContent = 'คุณลงชื่อในรอบนี้แล้ว กรุณาเลือกรอบหรือวันอื่น'; return; }
  if (sameSession.length >= BUFFET_CAPACITY) { buffetMessage.className = 'form-message error'; buffetMessage.textContent = 'รอบนี้เต็มแล้ว กรุณาเลือกรอบอื่น หรือติดต่อพนักงานเพื่อลงคิวรอ'; return; }
  bookings.push({ id: crypto.randomUUID(), ...data, amount: 60 + Number(data.shuttle), ownerId: currentMember.id, createdAt: new Date().toISOString(), status: 'รอตรวจสอบการชำระเงิน', paymentStatus: 'รอชำระเงิน' });
  localStorage.setItem(buffetStorageKey, JSON.stringify(bookings));
  buffetMessage.className = 'form-message success';
  buffetMessage.textContent = `ลงชื่อเรียบร้อย คุณ ${data.name} ได้รับสิทธิ์ในรอบ ${data.session} กรุณารอการตรวจสอบชำระเงิน`;
  buffetForm.reset(); buffetDate.value = buffetDate.min; if (currentMember) document.querySelector('#buffetName').value = currentMember.name; updateBuffetPrice();
});
updateBuffetPrice();
