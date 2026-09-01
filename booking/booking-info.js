const STORAGE_KEY = 'smashup_bookings_v1';
const courtTotal = 13;
const today = new Date().toISOString().split('T')[0];
const sampleBookings = [
  { date: today, time: '11:00–12:00', court: '3', name: 'ทีม Smash', phone: '081-234-5678', status: 'ยืนยันแล้ว', amount: 130 },
  { date: today, time: '17:00–18:00', court: 'A', name: 'กานต์', phone: '089-456-1234', status: 'รอยืนยัน', amount: 130 },
  { date: today, time: '19:00–20:00', court: '7', name: 'พีรพล', phone: '086-888-4200', status: 'ยืนยันแล้ว', amount: 130 }
];
const dateInput = document.querySelector('#bookingDate');
const searchInput = document.querySelector('#bookingSearch');
const rows = document.querySelector('#bookingRows');
const emptyState = document.querySelector('#emptyState');
const resultMessage = document.querySelector('#resultMessage');
function savedBookings() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function renderBookings() {
  const selectedDate = dateInput.value;
  const query = searchInput.value.trim().toLowerCase();
  const visible = [...sampleBookings, ...savedBookings()].filter((booking) => (!selectedDate || booking.date === selectedDate) && (!query || `${booking.name} ${booking.phone}`.toLowerCase().includes(query)));
  rows.innerHTML = visible.map((booking) => { const state = booking.status === 'ยืนยันแล้ว' ? 'confirmed' : 'pending'; return `<tr><td>${booking.time}</td><td><b>คอร์ต ${booking.court}</b></td><td>${booking.name}</td><td>${booking.phone}</td><td><span class="status ${state}">${booking.status}</span></td><td>฿ ${Number(booking.amount).toLocaleString('th-TH')}</td></tr>`; }).join('');
  emptyState.hidden = visible.length > 0;
  resultMessage.textContent = visible.length ? `พบ ${visible.length} รายการตามเงื่อนไขที่เลือก` : 'ไม่พบรายการจอง';
  const booked = new Set(visible.map((booking) => booking.court)).size;
  document.querySelector('#bookedCount').textContent = booked;
  document.querySelector('#availableCount').textContent = Math.max(0, courtTotal - booked);
  document.querySelector('#pendingCount').textContent = visible.filter((booking) => booking.status === 'รอยืนยัน').length;
}
dateInput.value = today;
dateInput.addEventListener('change', renderBookings);
searchInput.addEventListener('input', renderBookings);
document.querySelector('#refreshList').addEventListener('click', renderBookings);
document.querySelector('#clearFilters').addEventListener('click', () => { dateInput.value = today; searchInput.value = ''; renderBookings(); });
renderBookings();
