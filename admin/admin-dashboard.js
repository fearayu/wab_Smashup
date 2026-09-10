const $=(s,r=document)=>r.querySelector(s);
$('#menuToggle')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

const BOOKINGS_KEY='smashup_bookings_v1';
const BUFFET_KEY='smashup_buffet_bookings_v1';
const SERVICE_KEY='smashup_service_requests_v1';
const USERS_KEY='smashup_users_v1';

function readList(key){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:[]}catch{return[]}}
function getBookings(){return readList(BOOKINGS_KEY)}
function getBuffetBookings(){return readList(BUFFET_KEY)}
function getServiceRequests(){return readList(SERVICE_KEY)}
function getUsers(){return readList(USERS_KEY)}

function updateStats(){
  const allBookings=getBookings();
  const allBuffet=getBuffetBookings();
  const allService=getServiceRequests();
  const pending=[...allBookings,...allBuffet,...allService].filter(r=>['รอยืนยัน','รอตรวจสอบ','รอตรวจสอบการชำระเงิน','รอชำระเงิน'].includes(r.status));
  if($('#courtTotal'))$('#courtTotal').textContent=String(allBookings.length);
  if($('#pendingTotal'))$('#pendingTotal').textContent=String(pending.length);
  if($('#buffetTotal'))$('#buffetTotal').textContent=String(allBuffet.length);
  if($('#serviceTotal'))$('#serviceTotal').textContent=String(allService.length);
}

function renderBookings(){
  const body=$('#adminBookingRows');if(!body)return;
  const bookings=getBookings();
  const q=($('#adminBookingSearch')?.value||'').toLowerCase();
  let list=bookings.filter(b=>!q||(b.name||'').toLowerCase().includes(q)||(b.id||'').toLowerCase().includes(q));
  body.innerHTML=list.map(b=>{
    const pending=['รอยืนยัน','รอตรวจสอบ','รอตรวจสอบการชำระเงิน','รอชำระเงิน'].includes(b.status);
    const cls=pending?'pending':b.status==='ยืนยันแล้ว'?'confirmed':'cancelled';
    const actions=pending?`<div class="actions"><button class="btn-approve" data-approve="${b.id}">ยืนยัน</button><button class="btn-cancel" data-cancel="${b.id}">ยกเลิก</button></div>`:`<span class="status ${cls}" style="font-size:12px">${b.status}</span>`;
    return `<tr><td>${b.dateThai||b.date||'—'}</td><td>คอร์ต ${b.courts||b.court||''} ${b.time||''}</td><td>${b.name||'—'}</td><td>${b.phone||'—'}</td><td>฿${b.amount||b.price||0}</td><td><span class="status ${cls}">${b.status}</span></td><td>${actions}</td></tr>`;
  }).join('')||`<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:28px">ยังไม่มีรายการจองสนาม</td></tr>`;
  body.querySelectorAll('[data-approve]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.approve;const list=readList(BOOKINGS_KEY);const t=list.find(x=>x.id===id);
    if(t){t.status='ยืนยันแล้ว';t.history=[...(t.history||[]),{action:'status',to:'ยืนยันแล้ว',actor:'admin',at:new Date().toISOString()}];localStorage.setItem(BOOKINGS_KEY,JSON.stringify(list));}
    renderBookings();updateStats();
  }));
  body.querySelectorAll('[data-cancel]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.cancel;const list=readList(BOOKINGS_KEY);const t=list.find(x=>x.id===id);
    if(t){t.status='ยกเลิกแล้ว';t.cancelReason='ผู้ดูแลยกเลิก';t.history=[...(t.history||[]),{action:'status',to:'ยกเลิกแล้ว',actor:'admin',at:new Date().toISOString()}];localStorage.setItem(BOOKINGS_KEY,JSON.stringify(list));}
    renderBookings();updateStats();
  }));
}

function renderBuffet(){
  const body=$('#adminBuffetRows');if(!body)return;
  const items=getBuffetBookings();
  body.innerHTML=items.map(b=>`<div class="managed-record"><span>${b.name||'—'} — ${b.session||''}${b.level?' ระดับ '+b.level:''}</span><span class="status">${b.status}</span></div>`).join('')||`<p style="text-align:center;color:var(--muted);padding:28px">ยังไม่มีรายการตีบุฟเฟต์</p>`;
}

function renderServices(){
  const body=$('#adminServiceRows');if(!body)return;
  const items=getServiceRequests();
  body.innerHTML=items.map(b=>`<div class="managed-record"><span>${b.name||'—'} — ${b.service||''} ${b.event||b.item||b.category||''}</span><span class="status">${b.status}</span></div>`).join('')||`<p style="text-align:center;color:var(--muted);padding:28px">ยังไม่มีคำขอบริการ</p>`;
}

function renderEmployees(){
  const body=$('#adminEmployeeRows');if(!body)return;
  body.innerHTML=`<p style="text-align:center;color:var(--muted);padding:28px">ยังไม่มีข้อมูลพนักงาน</p>`;
}

document.querySelectorAll('[data-go-screen]').forEach(btn=>btn.addEventListener('click',()=>{
  const target=btn.dataset.goScreen;
  document.querySelectorAll('.admin-nav').forEach(n=>{n.classList.remove('active');if(n.dataset.screen===target)n.classList.add('active')});
  document.querySelectorAll('.admin-screen').forEach(p=>p.hidden=p.dataset.screenPanel!==target);
  if($('#screenTitle'))$('#screenTitle').textContent=target==='bookings'?'จัดการจองสนาม':target==='buffet'?'ตีบุฟเฟต์':target==='services'?'คำขอบริการ':'ภาพรวม';
}));

document.querySelectorAll('.admin-nav').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.admin-nav').forEach(n=>n.classList.remove('active'));
  btn.classList.add('active');
  const screen=btn.dataset.screen;
  document.querySelectorAll('.admin-screen').forEach(p=>p.hidden=p.dataset.screenPanel!==screen);
  if($('#screenTitle'))$('#screenTitle').textContent=btn.textContent.trim();
}));

$('#adminRefresh')?.addEventListener('click',()=>{renderBookings();updateStats()});
$('#buffetRefresh')?.addEventListener('click',()=>{renderBuffet();updateStats()});
$('#serviceRefresh')?.addEventListener('click',()=>{renderServices();updateStats()});
$('#employeeRefresh')?.addEventListener('click',renderEmployees);

$('#adminBookingSearch')?.addEventListener('input',renderBookings);
window.addEventListener('storage',e=>{if([BOOKINGS_KEY,BUFFET_KEY,SERVICE_KEY].includes(e.key)){renderBookings();renderBuffet();renderServices();updateStats()}});
window.addEventListener('smashup-data',()=>{renderBookings();renderBuffet();renderServices();updateStats()});

updateStats();
renderBookings();
renderBuffet();
renderServices();
renderEmployees();
