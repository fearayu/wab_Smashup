const MY_BOOKING_KEY = 'smashup_bookings_v1';
const myContainer = document.querySelector('#myBookings');
const myEmpty = document.querySelector('#myEmpty');
const myMessage = document.querySelector('#myMessage');
const currentSession = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
function loadMyBookings() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)) || []; } catch { return []; } }
function canCancel(booking) { const start = new Date(`${booking.date}T${booking.time || '00:00'}:00`).getTime(); return booking.status !== 'ยกเลิกแล้ว' && Number.isFinite(start) && start - Date.now() >= 2 * 60 * 60 * 1000; }
function renderMyBookings() {
  if (!currentSession) { myContainer.innerHTML = ''; myEmpty.hidden = false; myEmpty.textContent = 'กรุณาเข้าสู่ระบบเพื่อดูรายการของคุณ'; myMessage.textContent = ''; return; }
  const mine = loadMyBookings().filter((booking) => booking.ownerId === currentSession.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  myContainer.innerHTML = mine.map((booking) => { const cancelled = booking.status === 'ยกเลิกแล้ว'; const payment = booking.paymentStatus ? `<small>การชำระเงิน: ${booking.paymentStatus}</small>` : ''; const cancelButton = canCancel(booking) ? `<button class="cancel-button" type="button" data-id="${booking.id}">ยกเลิกการจอง</button>` : (cancelled ? '' : '<small>ยกเลิกได้ก่อนเวลาใช้บริการ 2 ชั่วโมง</small>'); return `<article class="booking-card ${cancelled ? 'cancelled' : ''}"><div class="booking-date">${booking.date}<span>${booking.time} น.</span></div><div class="booking-detail"><b>คอร์ต ${booking.court}</b><span>${booking.name} · ${booking.phone} · ฿ ${Number(booking.amount).toLocaleString('th-TH')}</span>${payment}</div><div><span class="booking-status ${cancelled ? 'cancelled' : 'pending'}">${booking.status}</span>${cancelButton}</div></article>`; }).join('');
  myEmpty.hidden = mine.length > 0; myMessage.textContent = mine.length ? `พบ ${mine.length} รายการ` : '';
}
myContainer.addEventListener('click', (event) => { const button = event.target.closest('[data-id]'); if (!button) return; const bookings = loadMyBookings(); const target = bookings.find((booking) => booking.id === button.dataset.id); if (!target || !canCancel(target)) { myMessage.textContent = 'รายการนี้ยกเลิกไม่ได้ เนื่องจากเหลือเวลาใช้บริการน้อยกว่า 2 ชั่วโมง'; return; } if (!confirm('ยืนยันการยกเลิกการจองนี้?')) return; target.status = 'ยกเลิกแล้ว'; target.cancelReason = 'ผู้ใช้ยกเลิก'; localStorage.setItem(MY_BOOKING_KEY, JSON.stringify(bookings)); myMessage.textContent = 'ยกเลิกการจองเรียบร้อย'; renderMyBookings(); });
renderMyBookings();
