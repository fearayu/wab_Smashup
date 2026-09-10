// Buffet Registration – queue logic + real backend to admin
const $ = (s,r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));

const STORAGE = 'smashup_buffet_queue_v1'; // single queue status for current user
const BOOKINGS_KEY = 'smashup_bookings_v1'; // shared with court bookings – admin sees together
const BUFFET_KEY = 'smashup_buffet_bookings_v1'; // dedicated buffet list for reports

function getSession(){ try{ return JSON.parse(localStorage.getItem('smashup_session_v1')); }catch{ return null; } }
function getBookings(){ try{ return JSON.parse(localStorage.getItem(BOOKINGS_KEY))||[]; }catch{ return []; } }
function saveBookings(list){ localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list)); }
function getBuffetBookings(){ try{ return JSON.parse(localStorage.getItem(BUFFET_KEY))||[]; }catch{ return []; } }
function saveBuffetBookings(list){ localStorage.setItem(BUFFET_KEY, JSON.stringify(list)); }

function formatDateThai(iso){
  try{
    const d=new Date(iso+'T00:00:00');
    const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()+543}`;
  }catch{ return iso; }
}

// slot cards sync with select
document.querySelectorAll('.slot-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    document.querySelectorAll('.slot-card').forEach(c=> c.classList.remove('active'));
    card.classList.add('active');
    $('#slotSelect').value = card.dataset.slot;
    saveDraft();
  });
});
$('#slotSelect')?.addEventListener('change', ()=>{
  document.querySelectorAll('.slot-card').forEach(c=> c.classList.toggle('active', c.dataset.slot===$('#slotSelect').value));
  saveDraft();
});
$('#levelSelect')?.addEventListener('change', saveDraft);
$('#nickName')?.addEventListener('input', saveDraft);

function saveDraft(){
  try{ localStorage.setItem(STORAGE+'_draft', JSON.stringify({ slot:$('#slotSelect').value, level:$('#levelSelect').value, nick:$('#nickName').value })); }catch{}
}
function loadDraft(){
  try{
    const d = JSON.parse(localStorage.getItem(STORAGE+'_draft')||'null');
    if(!d) return;
    if(d.slot) { $('#slotSelect').value=d.slot; document.querySelectorAll('.slot-card').forEach(c=> c.classList.toggle('active', c.dataset.slot===d.slot)); }
    if(d.level) $('#levelSelect').value=d.level;
    if(d.nick) $('#nickName').value=d.nick;
  }catch{}
}

function loadQueue(){
  try{ return JSON.parse(localStorage.getItem(STORAGE)||'null'); }catch{ return null; }
}
function saveQueue(q){ localStorage.setItem(STORAGE, JSON.stringify(q)); }

function renderQueue(){
  const q = loadQueue();
  const numEl = $('#queueNumber'), stateEl=$('#queueState'), detailEl=$('#queueDetail');
  const metaSlot=$('#metaSlot'), metaLevel=$('#metaLevel'), cancelBtn=$('#cancelQueue');
  if(!q){
    if(numEl) numEl.textContent='—';
    if(numEl) numEl.classList.remove('has-queue');
    if(stateEl) stateEl.textContent='ยังไม่ได้ลงทะเบียน';
    if(detailEl) detailEl.textContent='เลือกรอบเวลาและกดลงทะเบียน ระบบจะออกเลขคิวให้ทันที';
    if(metaSlot) metaSlot.textContent='—';
    if(metaLevel) metaLevel.textContent='—';
    if(cancelBtn) cancelBtn.hidden=true;
    return;
  }
  if(numEl) { numEl.textContent = String(q.number).padStart(2,'0'); numEl.classList.add('has-queue'); }
  if(stateEl) stateEl.textContent = q.status==='ยืนยันแล้ว' ? 'ยืนยันแล้ว' : q.status==='ยกเลิก' ? 'ยกเลิกแล้ว' : 'กำลังรอเรียกคิว';
  if(detailEl) detailEl.textContent = `คุณ ${q.nick||'—'} ลงทะเบียนแล้ว • จะถูกเรียกตามลำดับคิว`;
  if(metaSlot) metaSlot.textContent = q.slot;
  if(metaLevel) metaLevel.textContent = q.levelLabel||q.level||'—';
  if(cancelBtn) cancelBtn.hidden=false;
  // reflect status color
  if(stateEl) stateEl.style.color = q.status==='ยืนยันแล้ว' ? '#16a34a' : q.status==='ยกเลิก' ? '#dc2626' : '#ffcc8a';
}

$('#buffetForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const session=getSession();
  const slot = $('#slotSelect').value;
  const level = $('#levelSelect').value;
  const nick = $('#nickName').value.trim();
  const msg = $('#formMessage');
  if(!session){ msg.innerHTML='กรุณา <a href="../auth/index.html?next=../booking/buffet-registration.html">เข้าสู่ระบบ</a> ก่อนลงทะเบียน'; msg.className='form-message error'; return; }
  if(!slot || !level){ msg.textContent='กรุณาเลือกรอบเวลาและระดับฝีมือ'; msg.className='form-message error'; return; }
  // queue number: count existing buffet bookings +1
  const buffetList=getBuffetBookings();
  const bookings=getBookings();
  const number = buffetList.length + 1;
  // ensure <=20 otherwise queue but allow
  const levelLabel = level==='beginner'?'มือใหม่': level==='intermediate'?'ระดับกลาง':'ระดับสูง';
  const queue = { number: number, slot, level, levelLabel, nick: nick||session.name, at: new Date().toISOString(), status:'รอยืนยัน', id:'BF'+Date.now().toString(36).toUpperCase() };
  saveQueue(queue);
  // save to buffet dedicated list
  const buffetBooking = { id: queue.id, date: new Date().toISOString().split('T')[0], dateThai: formatDateThai(new Date().toISOString().split('T')[0]), slot, level, levelLabel, nick: nick||session.name, name: nick||session.name, phone: '', price: 60, item: `บุฟเฟต์ ${slot} • ${levelLabel}`, status:'รอยืนยัน', type:'buffet', createdAt: new Date().toISOString(), userId: session.id, userName: session.name, queueNumber: number };
  buffetList.unshift(buffetBooking);
  saveBuffetBookings(buffetList);
  // also push to unified bookings for admin dashboard
  const unified=getBookings();
  unified.unshift(buffetBooking);
  saveBookings(unified);

  // also push to buffet-queue waiting list
  try{
    const QUEUE_KEY='smashup_buffet_queue_v2';
    const w = JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');
    w.push({ name: nick||session.name, slot, level });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(w));
  }catch{}
  msg.innerHTML = `ลงทะเบียนสำเร็จ! คุณได้คิวที่ <strong>${String(queue.number).padStart(2,'0')}</strong> • รอบ ${slot} • <span style="color:#b7790f">รอยืนยัน</span> — ดูสถานะที่ <a href="../admin/index.html" style="color:var(--orange)">หลังบ้าน Admin</a>`;
  msg.className='form-message success';
  renderQueue();
});

$('#cancelQueue')?.addEventListener('click', ()=>{
  const q=loadQueue();
  if(q){
    // update stored bookings to cancelled
    const buffetList=getBuffetBookings();
    const target=buffetList.find(b=>b.id===q.id);
    if(target) { target.status='ยกเลิก'; saveBuffetBookings(buffetList); }
    const unified=getBookings();
    const target2=unified.find(b=>b.id===q.id);
    if(target2) { target2.status='ยกเลิก'; saveBookings(unified); }
  }
  localStorage.removeItem(STORAGE);
  const msg=$('#formMessage');
  if(msg){ msg.textContent='ยกเลิกคิวแล้ว'; msg.className='form-message'; }
  renderQueue();
});

// sync queue status if admin approves elsewhere (listen storage)
window.addEventListener('storage', (e)=>{
  if(e.key===STORAGE || e.key===BUFFET_KEY) renderQueue();
});

loadDraft();
renderQueue();
// If admin updated status, reflect
(function syncStatus(){
  const q=loadQueue();
  if(!q) return;
  const buffetList=getBuffetBookings();
  const found=buffetList.find(b=>b.id===q.id);
  if(found && found.status!==q.status){
    q.status=found.status;
    saveQueue(q);
    renderQueue();
  }
})();
