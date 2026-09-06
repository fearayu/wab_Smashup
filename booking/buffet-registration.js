// Buffet Registration – queue logic
const $ = (s,r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));

const STORAGE = 'smashup_buffet_queue_v1';

// slot cards sync with select
document.querySelectorAll('.slot-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    document.querySelectorAll('.slot-card').forEach(c=> c.classList.remove('active'));
    card.classList.add('active');
    $('#slotSelect').value = card.dataset.slot;
    saveDraft();
  });
});
$('#slotSelect').addEventListener('change', ()=>{
  document.querySelectorAll('.slot-card').forEach(c=> c.classList.toggle('active', c.dataset.slot===$('#slotSelect').value));
  saveDraft();
});
$('#levelSelect').addEventListener('change', saveDraft);
$('#nickName').addEventListener('input', saveDraft);

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
    numEl.textContent='—'; numEl.classList.remove('has-queue');
    stateEl.textContent='ยังไม่ได้ลงทะเบียน';
    detailEl.textContent='เลือกรอบเวลาและกดลงทะเบียน ระบบจะออกเลขคิวให้ทันที';
    metaSlot.textContent='—'; metaLevel.textContent='—';
    cancelBtn.hidden=true;
    return;
  }
  numEl.textContent = String(q.number).padStart(2,'0');
  numEl.classList.add('has-queue');
  stateEl.textContent='กำลังรอเรียกคิว';
  detailEl.textContent = `คุณ ${q.nick||'—'} ลงทะเบียนแล้ว • จะถูกเรียกตามลำดับคิว`;
  metaSlot.textContent = q.slot;
  metaLevel.textContent = q.levelLabel||q.level||'—';
  cancelBtn.hidden=false;
}

$('#buffetForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const slot = $('#slotSelect').value;
  const level = $('#levelSelect').value;
  const nick = $('#nickName').value.trim();
  const msg = $('#formMessage');
  if(!slot || !level){ msg.textContent='กรุณาเลือกรอบเวลาและระดับฝีมือ'; msg.className='form-message error'; return; }
  // generate queue number 01-20
  const existing = loadQueue();
  const number = existing ? existing.number : Math.floor(Math.random()*12)+1 + 4; // 05+ mock
  const levelLabel = level==='beginner'?'มือใหม่': level==='intermediate'?'ระดับกลาง':'ระดับสูง';
  const queue = { number: number<=20?number:5, slot, level, levelLabel, nick: nick||'ผู้ลงทะเบียน', at: new Date().toISOString() };
  saveQueue(queue);
  msg.textContent = `ลงทะเบียนสำเร็จ! คุณได้คิวที่ ${String(queue.number).padStart(2,'0')} • รอบ ${slot}`;
  msg.className='form-message success';
  renderQueue();
  // also push to buffet-queue waiting list if exists
  try{
    const w = JSON.parse(localStorage.getItem('smashup_buffet_queue')||'[]');
    w.push({ name: nick||'ผู้ลงทะเบียน', slot, level });
    localStorage.setItem('smashup_buffet_queue', JSON.stringify(w));
  }catch{}
});

$('#cancelQueue').addEventListener('click', ()=>{
  localStorage.removeItem(STORAGE);
  $('#formMessage').textContent='ยกเลิกคิวแล้ว'; $('#formMessage').className='form-message';
  renderQueue();
});

loadDraft();
renderQueue();
