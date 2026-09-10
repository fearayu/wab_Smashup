// Admin Dashboard – real data from localStorage (demo mode). No fabricated figures.
const $ = (s,r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

const BOOKINGS_KEY='smashup_bookings_v1';
const BUFFET_KEY='smashup_buffet_bookings_v1';
const SERVICE_KEY='smashup_service_requests_v1';
const USERS_KEY='smashup_users_v1';

function readList(key){ try{ const v=JSON.parse(localStorage.getItem(key)); return Array.isArray(v)?v:[]; }catch{ return []; } }
function escapeHtml(v){ return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function getBookings(){ return readList(BOOKINGS_KEY); }
function getBuffetBookings(){ return readList(BUFFET_KEY); }
function getServiceRequests(){ return readList(SERVICE_KEY); }
function getUsers(){ return readList(USERS_KEY); }

function formatDateShort(iso){
  try{
    if(!iso) return '—';
    if(String(iso).includes('ก.')) return iso; // already Thai
    const d=new Date(String(iso).slice(0,10)+'T00:00:00');
    const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${String(d.getFullYear()+543).slice(-4)}`;
  }catch{ return iso; }
}

// Only real records, no mock fallback rows.
function getAllRequests(){
  const court = getBookings().map(b=>({
    id:b.id, date:formatDateShort(b.dateThai||b.date), name:b.name||b.nick||'—',
    item: b.item || `จองคอร์ต ${b.court||b.courts||''} ${b.time||''}`,
    status:b.status, price:Number(b.amount||b.price||0), type:b.type||'court', raw:b
  }));
  const buffet = getBuffetBookings().map(b=>({
    id:b.id, date:formatDateShort(b.date||b.createdAt), name:b.name||'—',
    item:`ตีบุฟเฟต์ ${b.session||''}${b.level?' • ระดับ '+b.level:''}`,
    status:b.status, price:Number(b.amount||0), type:'buffet', raw:b
  }));
  const service = getServiceRequests().map(b=>({
    id:b.id, date:formatDateShort(b.date||b.createdAt), name:b.name||'—',
    item:(b.service||'')+' '+(b.event||b.item||b.category||''),
    status:b.status, price:Number(b.amount||0), type:'service', raw:b
  }));
  return [...court, ...buffet, ...service];
}

let requests=getAllRequests();

function updateStats(){
  const all=getAllRequests();
  const realPending=all.filter(r=>['รอยืนยัน','รอตรวจสอบ','รอตรวจสอบการชำระเงิน','รอชำระเงิน'].includes(r.status));
  const todayStr=new Date().toISOString().split('T')[0];
  const todayBookings=getBookings().filter(b=>(b.date===todayStr)||((b.createdAt||'').startsWith(todayStr)));
  const revenue=getBookings().filter(b=>b.status==='ยืนยันแล้ว').reduce((sum,b)=>sum+(Number(b.amount||b.price)||0),0);
  const users=getUsers().filter(u=>u.role!=='admin').length;
  const elPending=$('#statPending'), elBookings=$('#statBookings'), elRevenue=$('#statRevenue'), elUsers=$('#statUsers');
  if(elPending) elPending.textContent=String(realPending.length);
  if(elBookings) elBookings.textContent=String(todayBookings.length);
  if(elRevenue) elRevenue.textContent='฿ '+revenue.toLocaleString('th-TH');
  if(elUsers) elUsers.textContent=String(users);
}

function render(){
  requests=getAllRequests();
  const q = ($('#searchTable')?.value||'').toLowerCase();
  const f = $('#filterStatus')?.value||'';
  const body = $('#adminBody');
  if(!body) return;
  let filtered = requests.filter(r=> (!q || (r.name||'').toLowerCase().includes(q) || (r.item||'').toLowerCase().includes(q) || (r.id&&r.id.toLowerCase().includes(q))) && (!f || r.status===f));
  body.innerHTML = filtered.map((r)=>{
    const pending = ['รอยืนยัน','รอตรวจสอบ','รอตรวจสอบการชำระเงิน','รอชำระเงิน'].includes(r.status);
    const cls = pending?'pending': (r.status==='ยืนยันแล้ว'||r.status==='ดำเนินการแล้ว')?'confirmed':'cancelled';
    const actions = pending
      ? `<div class="actions"><button class="btn-approve" data-approve="${r.id}" data-type="${r.type}">ยืนยัน</button><button class="btn-cancel" data-cancel="${r.id}" data-type="${r.type}">ยกเลิก</button></div>`
      : `<span class="status ${cls}" style="font-size:12px">${r.status}</span>`;
    const typeBadge = r.type==='buffet' ? '<span style="background:#fff7e6;color:#b7790f;border:1px solid #ffe2a8;padding:2px 6px;border-radius:999px;font:600 11px Kanit;margin-left:6px">บุฟเฟต์</span>'
      : r.type==='service' ? '<span style="background:#f3f0ff;color:#6d28d9;border:1px solid #ddd6fe;padding:2px 6px;border-radius:999px;font:600 11px Kanit;margin-left:6px">บริการ</span>'
      : '<span style="background:#eaf2ff;color:#1683b4;border:1px solid #cfe2f5;padding:2px 6px;border-radius:999px;font:600 11px Kanit;margin-left:6px">คอร์ต</span>';
    return `<tr><td>${r.date}</td><td><strong>${escapeHtml(r.name)}</strong>${typeBadge}<br><small style="color:var(--muted);font-size:11px">${escapeHtml(r.id||'')}</small></td><td>${escapeHtml(r.item)}<br><small style="color:var(--muted)">฿${r.price||0}</small></td><td><span class="status ${cls}">${escapeHtml(r.status)}</span></td><td>${actions}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px">ยังไม่มีรายการ — ข้อมูลจะปรากฏเมื่อผู้ใช้จองคอร์ต บุฟเฟต์ หรือส่งคำขอบริการ</td></tr>`;

  body.querySelectorAll('[data-approve]').forEach(b=> b.addEventListener('click', ()=>{
    const id=b.dataset.approve || b.dataset.id;
    const key = b.dataset.type==='buffet'?BUFFET_KEY : b.dataset.type==='service'?SERVICE_KEY : BOOKINGS_KEY;
    const list=readList(key); const target=list.find(x=>x.id===id);
    if(!target){ alert('ไม่พบรายการจริงในพื้นที่จัดเก็บ — ข้อมูลสาธิตไม่ถูกแสดงอีกต่อไป'); updateStats(); render(); return; }
    if(target.status==='ดำเนินการแล้ว'){ alert('รายการดำเนินการเสร็จแล้ว'); return; }
    target.status = b.dataset.type==='service' ? 'ดำเนินการแล้ว' : 'ยืนยันแล้ว';
    target.history=[...(target.history||[]),{action:'status',from:'',to:target.status,actor:'admin',at:new Date().toISOString()}];
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event('smashup-data'));
    updateStats(); render();
  }));
  body.querySelectorAll('[data-cancel]').forEach(b=> b.addEventListener('click', ()=>{
    const id=b.dataset.cancel || b.dataset.id;
    const key = b.dataset.type==='buffet'?BUFFET_KEY : b.dataset.type==='service'?SERVICE_KEY : BOOKINGS_KEY;
    const list=readList(key); const target=list.find(x=>x.id===id);
    if(!target){ alert('ไม่พบรายการจริงในพื้นที่จัดเก็บ — ข้อมูลสาธิตไม่ถูกแสดงอีกต่อไป'); updateStats(); render(); return; }
    target.status='ยกเลิกแล้ว';
    target.cancelReason='ผู้ดูแลยกเลิก';
    target.history=[...(target.history||[]),{action:'status',from:'',to:'ยกเลิกแล้ว',actor:'admin',at:new Date().toISOString()}];
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event('smashup-data'));
    updateStats(); render();
  }));
}

$('#searchTable')?.addEventListener('input', render);
$('#filterStatus')?.addEventListener('change', render);
// live update if another tab changes bookings
window.addEventListener('storage', (e)=>{ if(e.key===BOOKINGS_KEY || e.key===BUFFET_KEY || e.key===SERVICE_KEY) { render(); updateStats(); } });
window.addEventListener('smashup-data', ()=>{ render(); updateStats(); });

updateStats();
render();
// poll occasionally for same-tab updates from the shared domain layer
setInterval(()=>{ const n=getAllRequests().length; if(n!==requests.length) { render(); updateStats(); } }, 1500);