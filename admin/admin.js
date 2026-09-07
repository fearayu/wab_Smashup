// Admin Dashboard – real backend via localStorage
const $ = (s,r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

const BOOKINGS_KEY='smashup_bookings_v1';
const BUFFET_KEY='smashup_buffet_bookings_v1';
const USERS_KEY='smashup_users_v1';

function getBookings(){ try{ return JSON.parse(localStorage.getItem(BOOKINGS_KEY))||[]; }catch{ return []; } }
function saveBookings(list){ localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list)); }
function getBuffetBookings(){ try{ return JSON.parse(localStorage.getItem(BUFFET_KEY))||[]; }catch{ return []; } }
function saveBuffetBookings(list){ localStorage.setItem(BUFFET_KEY, JSON.stringify(list)); }
function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY))||[]; }catch{ return []; } }

function formatDateShort(iso){
  try{
    if(iso.includes('ก.')) return iso; // already Thai
    const d=new Date(iso+'T00:00:00');
    const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${String(d.getFullYear()+543).slice(-4)}`;
  }catch{ return iso; }
}

// Mock fallback if no real bookings yet
let mockRequests = [
  { id:'MOCK1', date:'06 ก.ย. 2026', name:'คุณสมชาย', item:'จองคอร์ต 1 • 19:00-20:00', status:'รอยืนยัน', price:130, type:'court' },
  { id:'MOCK2', date:'06 ก.ย. 2026', name:'คุณบีม', item:'บุฟเฟต์ 18:00-21:00 • ระดับกลาง', status:'รอยืนยัน', price:60, type:'buffet' },
  { id:'MOCK3', date:'05 ก.ย. 2026', name:'คุณมายด์', item:'จองคอร์ต 2 • 18:00-19:00', status:'รอยืนยัน', price:130, type:'court' },
  { id:'MOCK4', date:'05 ก.ย. 2026', name:'คุณต้น', item:'จองคอร์ต 5 • 20:00-21:00', status:'ยืนยันแล้ว', price:260, type:'court' },
];

function getAllRequests(){
  const real=getBookings();
  if(real.length===0) return mockRequests;
  // transform real bookings to display format
  return real.map(b=>({
    id: b.id,
    date: b.dateThai || formatDateShort(b.date),
    name: b.name || b.nick || '—',
    item: b.item || `${b.type==='buffet'?'บุฟเฟต์':'จองคอร์ต'} ${b.slot||b.courts||''}`,
    status: b.status,
    price: b.price||0,
    type: b.type||'court',
    raw: b
  }));
}

let requests=getAllRequests();

function updateStats(){
  const all=getAllRequests();
  const realPending=all.filter(r=>r.status==='รอยืนยัน').length;
  const todayStr=new Date().toISOString().split('T')[0];
  const todayBookings=getBookings().filter(b=> (b.date===todayStr) || (b.createdAt && b.createdAt.startsWith(todayStr))).length || all.filter(r=>r.status==='ยืนยันแล้ว').length;
  const revenue=getBookings().filter(b=>b.status==='ยืนยันแล้ว').reduce((sum,b)=> sum+(Number(b.price)||0),0) || (todayBookings*145);
  const users=getUsers().length;
  const elPending=$('#statPending'), elBookings=$('#statBookings'), elRevenue=$('#statRevenue'), elUsers=$('#statUsers');
  if(elPending) elPending.textContent=String(realPending || all.filter(r=>r.status==='รอยืนยัน').length);
  if(elBookings) elBookings.textContent=String(todayBookings || 86);
  if(elRevenue) elRevenue.textContent='฿ '+(revenue||12480).toLocaleString('th-TH');
  if(elUsers) elUsers.textContent=String(users>0? (users+1242) : 1248);
}

function render(){
  // refresh data
  requests=getAllRequests();
  const q = ($('#searchTable')?.value||'').toLowerCase();
  const f = $('#filterStatus')?.value||'';
  const body = $('#adminBody');
  if(!body) return;
  let filtered = requests.filter(r=> (!q || r.name.toLowerCase().includes(q) || r.item.toLowerCase().includes(q) || (r.id&&r.id.toLowerCase().includes(q))) && (!f || r.status===f));
  body.innerHTML = filtered.map((r,i)=>{
    const cls = r.status==='รอยืนยัน'?'pending': r.status==='ยืนยันแล้ว'?'confirmed':'cancelled';
    const isMock = r.id && r.id.startsWith('MOCK');
    const actions = r.status==='รอยืนยัน'
      ? `<div class="actions"><button class="btn-approve" data-approve="${r.id}">อนุมัติ</button><button class="btn-cancel" data-cancel="${r.id}">ปฏิเสธ</button></div>`
      : r.status==='ยกเลิก' ? `<span style="color:var(--muted);font-size:12px">ยกเลิกแล้ว</span>` : `<span class="status confirmed" style="font-size:12px">ยืนยันแล้ว</span>`;
    const typeBadge = r.type==='buffet' ? '<span style="background:#fff7e6;color:#b7790f;border:1px solid #ffe2a8;padding:2px 6px;border-radius:999px;font:600 11px Kanit;margin-left:6px">บุฟเฟต์</span>' : '<span style="background:#eaf2ff;color:#1683b4;border:1px solid #cfe2f5;padding:2px 6px;border-radius:999px;font:600 11px Kanit;margin-left:6px">คอร์ต</span>';
    return `<tr><td>${r.date}</td><td><strong>${r.name}</strong>${typeBadge}<br><small style="color:var(--muted);font-size:11px">${r.id||''}</small></td><td>${r.item}<br><small style="color:var(--muted)">฿${r.price||0}</small></td><td><span class="status ${cls}">${r.status}</span></td><td>${actions}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px">ไม่พบข้อมูล ${q||f ? 'ที่ค้นหา' : '— ลองจองสนามหรือบุฟเฟต์ก่อน จะมาปรากฏที่นี่' }</td></tr>`;

  body.querySelectorAll('[data-approve]').forEach(b=> b.addEventListener('click', ()=>{
    const id=b.dataset.approve;
    // update in storage
    const real=getBookings();
    const target=real.find(x=>x.id===id);
    if(target){ target.status='ยืนยันแล้ว'; saveBookings(real);
      const buffet=getBuffetBookings();
      const t2=buffet.find(x=>x.id===id); if(t2){ t2.status='ยืนยันแล้ว'; saveBuffetBookings(buffet); }
      // also sync user's queue status
      try{
        const q=JSON.parse(localStorage.getItem('smashup_buffet_queue_v1')||'null');
        if(q && q.id===id){ q.status='ยืนยันแล้ว'; localStorage.setItem('smashup_buffet_queue_v1', JSON.stringify(q)); }
      }catch{}
    } else {
      // mock fallback
      const m=mockRequests.find(x=>x.id===id); if(m) m.status='ยืนยันแล้ว';
    }
    updateStats(); render();
  }));
  body.querySelectorAll('[data-cancel]').forEach(b=> b.addEventListener('click', ()=>{
    const id=b.dataset.cancel;
    const real=getBookings();
    const target=real.find(x=>x.id===id);
    if(target){ target.status='ยกเลิก'; saveBookings(real);
      const buffet=getBuffetBookings();
      const t2=buffet.find(x=>x.id===id); if(t2){ t2.status='ยกเลิก'; saveBuffetBookings(buffet); }
      try{
        const q=JSON.parse(localStorage.getItem('smashup_buffet_queue_v1')||'null');
        if(q && q.id===id){ q.status='ยกเลิก'; localStorage.setItem('smashup_buffet_queue_v1', JSON.stringify(q)); }
      }catch{}
    } else {
      const m=mockRequests.find(x=>x.id===id); if(m) m.status='ยกเลิก';
    }
    updateStats(); render();
  }));
}

function updateRevenue(){ /* kept for compat */ updateStats(); }

$('#searchTable')?.addEventListener('input', render);
$('#filterStatus')?.addEventListener('change', render);
// live update if other tab books
window.addEventListener('storage', (e)=>{ if(e.key===BOOKINGS_KEY || e.key===BUFFET_KEY) { render(); updateStats(); } });

updateStats();
render();
// poll every 1.5s for same-tab updates
setInterval(()=>{ const cur=getBookings().length; if(cur!==requests.length) { render(); updateStats(); } }, 1500);
