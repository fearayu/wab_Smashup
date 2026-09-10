
const R=window.SmashRules,myContainer=document.querySelector('#myBookings'),myEmpty=document.querySelector('#myEmpty'),myMessage=document.querySelector('#myMessage');
const initialSession=(()=>{try{return R.session()}catch{return null}})();
function renderMyBookings(){
 try{const who=R.session();if(!who||who.id!==initialSession?.id){myContainer.innerHTML='';myEmpty.hidden=false;myEmpty.textContent='กรุณาเข้าสู่ระบบหรือโหลดหน้าใหม่เพื่อดูรายการของบัญชีปัจจุบัน';return;}
 const mine=['court','buffet','service'].flatMap(type=>R.own(type,who).map(r=>({...r,type}))).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 myContainer.innerHTML=mine.map(r=>{
 const title=r.type==='court'?('คอร์ต '+(r.court||r.courts||'')):r.type==='buffet'?'ตีบุฟเฟต์':r.service;
 const detail=r.type==='service'?[r.event,r.category,r.item,r.quantity?'จำนวน '+r.quantity:''].filter(Boolean).join(' · '):r.type==='buffet'?'ระดับ '+(r.level||'ยังไม่ทราบ'):(r.item||[r.time,r.amount!=null?'฿ '+Number(r.amount).toLocaleString('th-TH'):r.price!=null?'฿ '+Number(r.price).toLocaleString('th-TH'):''].filter(Boolean).join(' · '));
 return '<article class="booking-card"><div class="booking-date">'+R.escape(r.date||'รอผู้จัดแจ้งวัน')+'<span>'+R.escape(r.time||r.session||'')+'</span></div><div class="booking-detail"><b>'+R.escape(title)+'</b><span>'+R.escape(detail)+'</span><span>'+R.escape(r.name)+'</span>'+(r.amount!=null||r.price!=null?'<span>฿ '+Number(r.amount!=null?r.amount:r.price).toLocaleString('th-TH')+'</span>':'')+(r.cancelReason?'<small>'+R.escape(r.cancelReason)+'</small>':'')+'</div><div><span class="booking-status">'+R.escape(r.status)+'</span>'+(r.id&&R.canCancel(r,r.type)?'<button type="button" class="cancel-button" data-type="'+r.type+'" data-id="'+R.escape(r.id)+'">ยกเลิกรายการ</button>':R.active(r)?'<small>ยกเลิกก่อนเริ่ม 2 ชั่วโมง หรือก่อนคำขอบริการดำเนินการเสร็จ</small>':'')+'</div></article>';
 }).join('');myEmpty.hidden=mine.length>0;myEmpty.textContent='ยังไม่มีรายการของคุณ';
 }catch(e){myMessage.textContent=e.message}
}
myContainer.addEventListener('click',async e=>{const b=e.target.closest('[data-id]');if(!b)return;if(!confirm('ยืนยันยกเลิกรายการนี้?'))return;b.disabled=true;try{await R.cancel(b.dataset.type,b.dataset.id,initialSession);renderMyBookings();myMessage.textContent='ยกเลิกแล้ว หากชำระเงินจริงกับสนามไว้ให้ติดต่อผู้จัดเรื่องคืนเงิน';}catch(error){myMessage.textContent=error.message;b.disabled=false}});
window.addEventListener('storage',renderMyBookings);window.addEventListener('focus',renderMyBookings);renderMyBookings();
