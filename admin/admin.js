// Admin Dashboard – table management (admin-only mode)
const $ = (s,r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});
function updateRevenue(){ const bookings=Number($('#statBookings')?.textContent||86); const rev=bookings*145; const el=$('#statRevenue'); if(el) el.textContent='฿ '+rev.toLocaleString('th-TH'); }

let requests = [
  { date:'06 ก.ย. 2026', name:'คุณสมชาย', item:'จองคอร์ต 1 • 19:00-20:00', status:'รอยืนยัน' },
  { date:'06 ก.ย. 2026', name:'คุณบีม', item:'จองคอร์ต 3 • บุฟเฟต์ 18:00-21:00', status:'รอยืนยัน' },
  { date:'05 ก.ย. 2026', name:'คุณมายด์', item:'จองคอร์ต 2 • 18:00-19:00', status:'รอยืนยัน' },
  { date:'05 ก.ย. 2026', name:'คุณต้น', item:'จองคอร์ต 5 • 20:00-21:00', status:'ยืนยันแล้ว' },
  { date:'04 ก.ย. 2026', name:'คุณฟ้า', item:'จองคอร์ต 4 • 17:00-18:00', status:'รอยืนยัน' },
  { date:'04 ก.ย. 2026', name:'คุณโอ๊ต', item:'จองคอร์ต 1 • 19:00-20:00', status:'ยกเลิก' },
];

function render(){
  const q = ($('#searchTable').value||'').toLowerCase();
  const f = $('#filterStatus').value;
  const body = $('#adminBody');
  let filtered = requests.filter(r=> (!q || r.name.toLowerCase().includes(q) || r.item.toLowerCase().includes(q)) && (!f || r.status===f));
  body.innerHTML = filtered.map((r,i)=>{
    const idx = requests.indexOf(r);
    const cls = r.status==='รอยืนยัน'?'pending': r.status==='ยืนยันแล้ว'?'confirmed':'cancelled';
    const actions = r.status==='รอยืนยัน'
      ? `<div class="actions"><button class="btn-approve" data-approve="${idx}">อนุมัติ</button><button class="btn-cancel" data-cancel="${idx}">ยกเลิก</button></div>`
      : `<span style="color:var(--muted);font-size:13px">—</span>`;
    return `<tr><td>${r.date}</td><td><strong>${r.name}</strong></td><td>${r.item}</td><td><span class="status ${cls}">${r.status}</span></td><td>${actions}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px">ไม่พบข้อมูลที่ค้นหา</td></tr>`;
  body.querySelectorAll('[data-approve]').forEach(b=> b.addEventListener('click', ()=>{
    const idx = Number(b.dataset.approve); requests[idx].status='ยืนยันแล้ว'; updateStats(); render();
  }));
  body.querySelectorAll('[data-cancel]').forEach(b=> b.addEventListener('click', ()=>{
    const idx = Number(b.dataset.cancel); requests[idx].status='ยกเลิก'; updateStats(); render();
  }));
}

function updateStats(){
  const pending = requests.filter(r=> r.status==='รอยืนยัน').length;
  const el=$('#statPending'); if(el) el.textContent = String(pending);
  updateRevenue();
}

$('#searchTable')?.addEventListener('input', render);
$('#filterStatus')?.addEventListener('change', render);
updateStats();
render();
