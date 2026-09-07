
const R=window.SmashRules, serviceForm=document.querySelector('#serviceForm'), serviceMessage=document.querySelector('#serviceMessage');
let member;try{member=R.session()}catch(e){serviceMessage.textContent=e.message}
if(serviceForm){
 if(member)serviceForm.elements.name.value=member.name||'';
 if(serviceForm.elements.date){serviceForm.elements.date.min=R.localDate();serviceForm.elements.date.max=R.lastDate();}
 if(serviceForm.elements.category){const sync=()=>{serviceForm.elements.partner.required=serviceForm.elements.category.value==='คู่ผสม'};serviceForm.elements.category.addEventListener('change',sync);sync();}
 serviceForm.addEventListener('submit',async e=>{e.preventDefault();const b=serviceForm.querySelector('[type=submit]');if(b)b.disabled=true;try{
 await R.requestService(Object.fromEntries(new FormData(serviceForm)),member);serviceMessage.className='service-message success';serviceMessage.innerHTML='ส่งคำขอแล้ว รอผู้จัดตรวจสอบ · <a href="my-bookings.html">ดูรายการของฉัน</a>';serviceForm.reset();if(member)serviceForm.elements.name.value=member.name||'';
 }catch(error){serviceMessage.className='service-message error';serviceMessage.textContent=error.message}finally{if(b)b.disabled=false}});
}
