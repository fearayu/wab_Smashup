const authUiScript = document.createElement('script');
authUiScript.src = '../shared/auth-ui.js';
document.head.append(authUiScript);
const formStyle = document.createElement('link');
formStyle.rel = 'stylesheet';
formStyle.href = 'form-compact.css';
document.head.append(formStyle);

const BOOKINGS_KEY = 'smashup_bookings_v1';
const form = document.querySelector('#booking-form');
const date = document.querySelector('#date');
const courts = document.querySelector('#courts');
const estimate = document.querySelector('#estimate');
const success = document.querySelector('#success');
const submitButton = form?.querySelector('button[type="submit"]');
let isSubmitting = false;

function unlockSubmit(){
  isSubmitting = false;
  if(submitButton) submitButton.disabled = false;
}

function getSession(){ try{ return JSON.parse(localStorage.getItem('smashup_session_v1')); }catch{ return null; } }
function getBookings(){ try{ return JSON.parse(localStorage.getItem(BOOKINGS_KEY))||[]; }catch{ return []; } }
function saveBookings(list){ localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list)); }
function todayIso(){ return new Date().toISOString().split('T')[0]; }
function maxDateIso(){ const d=new Date(); d.setDate(d.getDate()+7); return d.toISOString().split('T')[0]; }
function formatDateThai(iso){
  try{
    const d=new Date(iso+'T00:00:00');
    const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()+543}`;
  }catch{ return iso; }
}

if (form && date && courts && estimate && success) {
  date.min = todayIso();
  date.max = maxDateIso();
  const session=getSession();
  if (session && form.elements.name && !form.elements.name.value) form.elements.name.value = session.name;

  courts.addEventListener('change', () => { estimate.textContent = `฿ ${(Number(courts.value) * 130).toLocaleString('th-TH')}`; });
  // init
  estimate.textContent = `฿ ${(Number(courts.value) * 130).toLocaleString('th-TH')}`;

  // pre-bind dialog buttons (so they work even if submit fails early)
  const dialogEarly=document.getElementById('bookingSuccessDialog');
  const stayEarly=document.getElementById('bookingStayBtn');
  const backEarly=document.getElementById('bookingBackBtn');
  if(dialogEarly && stayEarly && !stayEarly.dataset.bound){
    stayEarly.dataset.bound='1';
    stayEarly.addEventListener('click',()=>{ dialogEarly.close(); unlockSubmit(); });
    backEarly.addEventListener('click',()=>{ dialogEarly.close(); location.href='../index.html'; });
    dialogEarly.addEventListener('click',(e)=>{ const r=dialogEarly.getBoundingClientRect(); if(e.clientY<r.top||e.clientY>r.bottom||e.clientX<r.left||e.clientX>r.right){ dialogEarly.close(); unlockSubmit(); } });
    // expose for manual test
    window.testBookingDialog=()=>{ const cur=getSession(); const el=document.getElementById('successUserId'); if(el) el.textContent=cur?cur.id:'ทดสอบ'; dialogEarly.showModal(); };
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(isSubmitting) return;
    const cur=getSession();
    if (!cur) { success.innerHTML = 'กรุณา <a href="../auth/index.html?next=../booking/form.html">เข้าสู่ระบบ</a> ก่อนส่งคำขอจอง'; success.style.color='#c0392b'; return; }
    const data = new FormData(form);
    const dateVal=data.get('date');
    const timeVal=data.get('time');
    const courtsVal=data.get('courts')||'1';
    const nameVal=(data.get('name')||'').toString().trim()||cur.name;
    const phoneVal=(data.get('phone')||'').toString().trim();
    if(!dateVal || !timeVal){ success.textContent='กรุณาเลือกวันที่และเวลา'; success.style.color='#c0392b'; return; }
    if(dateVal < todayIso() || dateVal > maxDateIso()){ success.textContent='จองล่วงหน้าได้ตั้งแต่วันนี้ถึง 7 วันเท่านั้น'; success.style.color='#c0392b'; return; }
    if(getBookings().some(b=>b.ownerId===cur.id && b.date===dateVal && String(b.time)===String(timeVal) && b.status!=='ยกเลิกแล้ว')){ success.textContent='คุณส่งคำขอยืนยันช่วงเวลานี้ไว้แล้ว — ดูรายการใน "รายการจองของฉัน"'; success.style.color='#c0392b'; return; }
    isSubmitting = true;
    if(submitButton) submitButton.disabled = true;
    const price=Number(courtsVal)*130;
    const booking={
      id: 'BK'+Date.now().toString(36).toUpperCase(),
      date: dateVal,
      dateThai: formatDateThai(dateVal),
      time: timeVal,
      courts: courtsVal,
      name: nameVal,
      phone: phoneVal,
      price: price,
      item: `จองคอร์ต ${courtsVal} คอร์ต • ${timeVal} • ${price} บ.`,
      status: 'รอตรวจสอบ',
      type: 'court',
      createdAt: new Date().toISOString(),
      userId: cur.id,
      ownerId: cur.id,
      userName: cur.name
    };
    const list=getBookings();
    list.unshift(booking);
    saveBookings(list);
    try{ if(window.SmashNotify && typeof window.SmashNotify.create==='function') window.SmashNotify.create({userId:cur.id,title:'ส่งคำขอยืนยันการจอง','body':`คอร์ต ${courtsVal} คอร์ต • ${booking.dateThai} ${timeVal} • ฿ ${price}` ,type:'booking',link:'../booking/my-bookings.html'}); }catch{}
    // clear inputs
    form.reset();
    date.min = todayIso();
    date.max = maxDateIso();
    estimate.textContent = `฿ ${(Number(courts.value||1) * 130).toLocaleString('th-TH')}`;
    if(cur && form.elements.name) form.elements.name.value='';
    if(form.elements.phone) form.elements.phone.value='';
    success.textContent='';
    // show dialog: จองเสร็จสิ้น รับข้อมูลแล้ว คุณ ..(id ลูกค้า) ทีมงานจะติดต่อกลับ...
    const dialog=document.getElementById('bookingSuccessDialog');
    const userIdEl=document.getElementById('successUserId');
    const detailEl=document.getElementById('bookingSuccessDetail');
    if(userIdEl) userIdEl.textContent = cur.id || cur.name;
    if(detailEl) detailEl.textContent = `${booking.id} • ${booking.dateThai} ${timeVal} • ${courtsVal} คอร์ต • ฿${price}`;
    // ensure dialog is in DOM and visible
    if(dialog){
      try{ if(typeof dialog.showModal==='function'){ if(!dialog.open) dialog.showModal(); } else { dialog.setAttribute('open',''); } }catch(e){ console.error('dialog error',e); unlockSubmit(); alert(`จองเสร็จสิ้น รับข้อมูลแล้ว คุณ ${cur.id} ทีมงานจะติดต่อกลับเพื่อยืนยันการจองเร็ว ๆ นี้`); }
      console.log('booking success dialog shown for',cur.id);
    } else {
      unlockSubmit();
      alert(`จองเสร็จสิ้น รับข้อมูลแล้ว คุณ ${cur.id} ทีมงานจะติดต่อกลับเพื่อยืนยันการจองเร็ว ๆ นี้`);
    }
  });
  // also allow closing via backdrop handled above
}
