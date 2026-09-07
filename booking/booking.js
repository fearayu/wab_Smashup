const authUiScript = document.createElement('script');
authUiScript.src = '../shared/auth-ui.js';
document.head.append(authUiScript);
const themeStyle = document.createElement('link');
themeStyle.rel = 'stylesheet';
themeStyle.href = '../shared/theme.css';
document.head.append(themeStyle);
const formStyle = document.createElement('link');
formStyle.rel = 'stylesheet';
formStyle.href = 'form-compact.css';
document.head.append(formStyle);
const headerStyle = document.createElement('style');
headerStyle.textContent = '.booking-header { min-height: 70px; position: sticky; top: 0; z-index: 10; }';
document.head.append(headerStyle);


const R=window.SmashRules, form=document.querySelector('#booking-form'), date=document.querySelector('#date');
const estimate=document.querySelector('#estimate'), success=document.querySelector('#success');
let currentUser;try{currentUser=R.session()}catch(e){success.textContent=e.message}
function updateCourtOptions(){
 try{const records=R.list(R.keys.court),selected=form.elements.court.value;
 form.elements.court.innerHTML='<option value="">เลือกคอร์ต</option>'+R.courts.map(c=>{
 const busy=R.courtConflict(records,{court:c,date:date.value,time:form.elements.time.value});
 return '<option value="'+c+'" '+(busy?'disabled':'')+'>คอร์ต '+c+(busy?' (จองแล้ว)':'')+'</option>';
 }).join('');form.elements.court.value=R.courtConflict(records,{court:selected,date:date.value,time:form.elements.time.value})?'':selected;
 }catch(e){success.textContent=e.message}
}
if(form){
 document.querySelector('#courts').closest('label').innerHTML='คอร์ตที่ต้องการ <b>*</b><select id="court" name="court" required></select>';
 date.min=R.localDate();date.max=R.lastDate();
 if(currentUser)form.elements.name.value=currentUser.name||'';
 date.addEventListener('change',updateCourtOptions);form.elements.time.addEventListener('change',updateCourtOptions);
 window.addEventListener('storage',updateCourtOptions);window.addEventListener('focus',updateCourtOptions);updateCourtOptions();
 form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');if(button)button.disabled=true;
 try{const r=await R.bookCourt(Object.fromEntries(new FormData(form)),currentUser);
 success.innerHTML='ล็อกคอร์ต '+R.escape(r.court)+' ชั่วคราว 15 นาที รอผู้จัดยืนยันรายการจำลอง ไม่มีการชำระเงินจริง · <a href="my-bookings.html">ดูรายการของฉัน</a>';
 form.reset();if(currentUser)form.elements.name.value=currentUser.name;estimate.textContent='฿ 130';
 }catch(error){success.textContent=error.message}finally{if(button)button.disabled=false;updateCourtOptions()}
 });
}
