
const R=window.SmashRules,dateInput=document.querySelector('#bookingDate'),searchInput=document.querySelector('#bookingSearch'),rows=document.querySelector('#bookingRows');
const emptyState=document.querySelector('#emptyState'),resultMessage=document.querySelector('#resultMessage');
const timeFilter=document.createElement('select');timeFilter.setAttribute('aria-label','รอบเวลา');timeFilter.innerHTML='<option value="">ทุกเวลา (นับคอร์ตที่มีจองในวันนั้น)</option>'+Array.from({length:12},(_,i)=>'<option>'+String(i+11).padStart(2,'0')+':00</option>').join('');timeFilter.style.cssText='font:inherit;max-width:100%;padding:10px';dateInput.parentElement.after(timeFilter);
function renderBookings(){try{
 const records=R.list(R.keys.court),query=searchInput.value.trim().toLowerCase();
 const scoped=records.filter(r=>(!dateInput.value||r.date===dateInput.value)&&(!timeFilter.value||String(r.time).slice(0,5)===timeFilter.value));
 const visible=scoped.filter(r=>!query||(String(r.name)+' '+String(r.phone)).toLowerCase().includes(query));
 rows.innerHTML=visible.map(r=>'<tr><td>'+R.escape(r.time)+'</td><td>คอร์ต '+R.escape(r.court)+'</td><td>'+R.escape(r.name)+'</td><td>'+R.escape(r.phone)+'</td><td>'+R.escape(r.status)+'</td><td>฿ '+Number(r.amount||0).toLocaleString('th-TH')+'</td></tr>').join('');
 emptyState.hidden=visible.length>0;resultMessage.textContent='พบ '+visible.length+' รายการ · '+(timeFilter.value?'สรุปคอร์ตตามรอบที่เลือก':'จำนวนคอร์ตด้านล่างนับทั้งวัน เลือกรอบเวลาเพื่อตรวจคอร์ตว่าง');
 const active=scoped.filter(R.active),booked=new Set(active.map(r=>String(r.court))).size;
 document.querySelector('#bookedCount').textContent=booked;document.querySelector('#availableCount').textContent=Math.max(0,13-booked);document.querySelector('#pendingCount').textContent=active.filter(r=>R.pending(r.status)).length;
}catch(e){resultMessage.textContent=e.message}}
dateInput.value=R.localDate();dateInput.addEventListener('change',renderBookings);searchInput.addEventListener('input',renderBookings);timeFilter.addEventListener('change',renderBookings);document.querySelector('#refreshList').addEventListener('click',renderBookings);document.querySelector('#clearFilters').addEventListener('click',()=>{dateInput.value=R.localDate();searchInput.value='';timeFilter.value='';renderBookings()});window.addEventListener('storage',renderBookings);window.addEventListener('focus',renderBookings);renderBookings();
