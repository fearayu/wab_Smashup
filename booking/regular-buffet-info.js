const buffetInfoStorageKey = 'smashup_buffet_bookings_v1';
const buffetInfoToday = new Date().toISOString().split('T')[0];
const dateFilter = document.querySelector('#infoDate');
const searchFilter = document.querySelector('#infoSearch');
const tableRows = document.querySelector('#buffetRows');
function allBuffetBookings() { try { return JSON.parse(localStorage.getItem(buffetInfoStorageKey)) || []; } catch { return []; } }
function renderBuffetInfo() {
  const query = searchFilter.value.trim().toLowerCase();
  const visible = allBuffetBookings().filter((booking) => (!dateFilter.value || booking.date === dateFilter.value) && (!query || booking.name.toLowerCase().includes(query)));
  tableRows.innerHTML = visible.map((booking, index) => { const status = booking.status || 'รอยืนยัน'; const tone = status === 'ยืนยันแล้ว' ? 'confirmed' : 'pending'; return `<tr><td>${index + 1}</td><td><b>${booking.name}</b></td><td>${booking.session}</td><td>${booking.level}</td><td>${Number(booking.shuttle) ? `เพิ่ม ${booking.shuttle} บาท` : 'นำมาเอง'}</td><td><span class="status ${tone}">${status}</span></td><td>฿ ${Number(booking.amount || 60).toLocaleString('th-TH')}</td></tr>`; }).join('');
  document.querySelector('#buffetEmpty').hidden = visible.length > 0;
  document.querySelector('#infoMessage').textContent = visible.length ? `พบ ${visible.length} ผู้เล่นในรอบที่เลือก` : 'ไม่พบข้อมูลผู้เล่น';
  document.querySelector('#totalPlayers').textContent = visible.length;
  document.querySelector('#confirmedPlayers').textContent = visible.filter((item) => item.status === 'ยืนยันแล้ว').length;
  document.querySelector('#pendingPlayers').textContent = visible.filter((item) => item.status !== 'ยืนยันแล้ว').length;
}
dateFilter.value = buffetInfoToday;
dateFilter.addEventListener('change', renderBuffetInfo);
searchFilter.addEventListener('input', renderBuffetInfo);
document.querySelector('#clearInfo').addEventListener('click', () => { dateFilter.value = buffetInfoToday; searchFilter.value = ''; renderBuffetInfo(); });
renderBuffetInfo();
