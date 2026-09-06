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

function getSession(){ try{ return JSON.parse(localStorage.getItem('smashup_session_v1')); }catch{ return null; } }
function getBookings(){ try{ return JSON.parse(localStorage.getItem(BOOKINGS_KEY))||[]; }catch{ return []; } }
function saveBookings(list){ localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list)); }
function formatDateThai(iso){
  try{
    const d=new Date(iso+'T00:00:00');
    const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()+543}`;
  }catch{ return iso; }
}

if (form && date && courts && estimate && success) {
  date.min = new Date().toISOString().split('T')[0];
  const session=getSession();
  if (session && form.elements.name && !form.elements.name.value) form.elements.name.value = session.name;

  courts.addEventListener('change', () => { estimate.textContent = `฿ ${(Number(courts.value) * 130).toLocaleString('th-TH')}`; });
  // init
  estimate.textContent = `฿ ${(Number(courts.value) * 130).toLocaleString('th-TH')}`;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const cur=getSession();
    if (!cur) { success.innerHTML = 'กรุณา <a href="../auth/index.html?next=../booking/form.html">เข้าสู่ระบบ</a> ก่อนส่งคำขอจอง'; success.style.color='#c0392b'; return; }
    const data = new FormData(form);
    const dateVal=data.get('date');
    const timeVal=data.get('time');
    const courtsVal=data.get('courts')||'1';
    const nameVal=(data.get('name')||'').toString().trim()||cur.name;
    const phoneVal=(data.get('phone')||'').toString().trim();
    if(!dateVal || !timeVal){ success.textContent='กรุณาเลือกวันที่และเวลา'; success.style.color='#c0392b'; return; }
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
      status: 'รอยืนยัน',
      type: 'court',
      createdAt: new Date().toISOString(),
      userId: cur.id,
      userName: cur.name
    };
    const list=getBookings();
    list.unshift(booking);
    saveBookings(list);
    // also update legacy queue for demo
    success.innerHTML = `✅ รับคำขอจองแล้ว <strong>${booking.id}</strong> — คุณ ${nameVal} วันที่ ${booking.dateThai} เวลา ${timeVal} (${courtsVal} คอร์ต • ฿${price}) <br>สถานะ <span style="color:#b7790f">รอยืนยัน</span> — ติดตามได้ที่หลังบ้าน Admin จะอนุมัติภายใน 15 นาที <a href="../admin/index.html" style="color:var(--orange)">ดูสถานะ →</a>`;
    success.style.color='#0f2f4a';
    form.reset();
    date.min = new Date().toISOString().split('T')[0];
    estimate.textContent = `฿ ${(Number(courts.value||1) * 130).toLocaleString('th-TH')}`;
    if(cur && form.elements.name) form.elements.name.value=cur.name;
  });
}
