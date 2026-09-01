const QUEUE_STORAGE_KEY = 'smashup_buffet_queue_v1';
const BUFFET_BOOKING_STORAGE_KEY = 'smashup_buffet_bookings_v1';
const queueList = document.querySelector('#queueList');
const waitingList = document.querySelector('#waitingList');
const historyList = document.querySelector('#historyList');
const waitingForm = document.querySelector('#waitingForm');
const queueCount = document.querySelector('#queueCount');
const waitingCount = document.querySelector('#waitingCount');

const initialState = () => ({ slots: Array.from({ length: 30 }, () => null), waiting: [], history: [] });
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY));
    if (!saved || !Array.isArray(saved.slots) || saved.slots.length !== 30) return initialState();
    return { slots: saved.slots, waiting: saved.waiting || [], history: saved.history || [] };
  } catch { return initialState(); }
}

function syncRegisteredPlayers() {
  let registrations = [];
  try { registrations = JSON.parse(localStorage.getItem(BUFFET_BOOKING_STORAGE_KEY)) || []; } catch { registrations = []; }
  const knownIds = new Set([...state.waiting, ...state.slots.filter(Boolean)].map((player) => player.registrationId).filter(Boolean));
  registrations.filter((booking) => booking.status === 'ยืนยันแล้ว').forEach((booking, index) => {
    const registrationId = booking.id || booking.createdAt || `${booking.date}-${booking.session}-${booking.name}-${index}`;
    if (!knownIds.has(registrationId)) {
      state.waiting.push({ name: booking.name, shuttle: Number(booking.shuttle) ? 1 : 0, level: booking.level, session: booking.session, registrationId });
    }
  });
}

function saveState() { localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }

function assignPlayer(slotIndex, playerIndex = 0) {
  const player = state.waiting.splice(playerIndex, 1)[0];
  if (!player) return;
  state.slots[slotIndex] = { ...player, court: '—' };
  state.history.unshift({ queue: slotIndex + 1, name: player.name, shuttle: player.shuttle, court: '—', time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) });
  state.history = state.history.slice(0, 12);
  saveState(); render();
}

function render() {
  const assigned = state.slots.filter(Boolean).length;
  queueCount.textContent = `${assigned} / 30 คิว`;
  waitingCount.textContent = `${state.waiting.length} คน`;
  queueList.innerHTML = state.slots.map((player, index) => `<div class="queue-row${player ? ' is-assigned' : ''}"><span class="queue-number">${index + 1}</span><span class="queue-player">${player ? escapeHtml(player.name) : '—'}</span><button class="queue-shuttle" type="button" data-slot="${index}" ${player ? '' : 'disabled'}>${player ? `${player.shuttle} ลูก` : '—'}</button><button class="queue-court" type="button" data-slot="${index}" ${player ? '' : 'disabled'}>${player ? player.court : '—'}</button></div>`).join('');
  waitingList.innerHTML = state.waiting.length ? state.waiting.map((player, index) => `<div class="waiting-item"><span>${escapeHtml(player.name)} <small>· ${player.shuttle} ลูก</small></span><small>รอจัดคิว</small><button class="assign-button" type="button" data-waiting="${index}">จัดคิว</button></div>`).join('') : '<p class="empty-state">ไม่พบข้อมูล</p>';
  historyList.innerHTML = state.history.length ? state.history.map((item, index) => `<tr><td>${index + 1}</td><td>${item.queue}</td><td>${escapeHtml(item.name)}</td><td>${item.shuttle}</td><td>${item.court}</td><td>${item.time}</td></tr>`).join('') : '<tr><td colspan="6" class="empty-state">ยังไม่มีประวัติ</td></tr>';
}

waitingForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#playerName').value.trim();
  if (!name) return;
  state.waiting.push({ name, shuttle: Number(document.querySelector('#shuttleCount').value) });
  saveState(); waitingForm.reset(); render();
});

waitingList.addEventListener('click', event => {
  const button = event.target.closest('[data-waiting]');
  if (!button) return;
  const emptySlot = state.slots.findIndex(slot => !slot);
  if (emptySlot >= 0) assignPlayer(emptySlot, Number(button.dataset.waiting));
});

queueList.addEventListener('click', event => {
  const button = event.target.closest('[data-slot]');
  if (!button || button.disabled) return;
  const slot = state.slots[Number(button.dataset.slot)];
  if (button.classList.contains('queue-shuttle')) { slot.shuttle = (slot.shuttle + 1) % 4; }
  else { slot.court = slot.court === '—' ? '1' : String(Number(slot.court) + 1 > 13 ? 1 : Number(slot.court) + 1); }
  saveState(); render();
});

document.querySelector('#refreshQueue').addEventListener('click', () => { syncRegisteredPlayers(); saveState(); render(); });
syncRegisteredPlayers();
saveState();
render();
