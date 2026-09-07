const buffetStorageKey = 'smashup_buffet_bookings_v1';
const buffetForm = document.querySelector('#buffetForm');
const buffetDate = document.querySelector('#buffetDate');
const shuttleSelect = buffetForm.elements.shuttle;
const buffetPrice = document.querySelector('#buffetPrice');
const buffetMessage = document.querySelector('#buffetMessage');
const currentMember = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
const levelApi = window.SmashLevels;
const buffetLevel = buffetForm.elements.level;
buffetLevel.innerHTML = '<option value="">เลือกระดับ / ยังไม่แน่ใจ</option>' + Object.entries(levelApi.levels).map(([code, level]) => `<option value="${code}">${level.label}</option>`).join('');
buffetLevel.required = false;
const storedUsers = (() => { try { const list = JSON.parse(localStorage.getItem('smashup_users_v1')); return Array.isArray(list) ? list : []; } catch { return []; } })();
const memberProfile = storedUsers.find(user => user.id === currentMember?.id)?.profile || currentMember?.profile;
buffetLevel.value = levelApi.effective(memberProfile);
buffetLevel.disabled = !!levelApi.confirmed(memberProfile);
const levelHelp = document.createElement('p');
levelHelp.textContent = levelApi.confirmed(memberProfile) ? 'ใช้ระดับที่ผู้จัดยืนยัน หากต้องการเปลี่ยนให้ขอทบทวนในหน้าประเมินทักษะ' : 'ระดับนี้ยังไม่ยืนยัน เลือกไม่แน่ใจได้ ให้ผู้จัดสังเกตการเล่นก่อนจัดคู่';
buffetLevel.parentElement.append(levelHelp);
const BUFFET_CAPACITY = 30;
const BUFFET_BOOKING_WINDOW_DAYS = 7;
function updateBuffetPrice() { buffetPrice.textContent = `฿ ${(60 + Number(shuttleSelect.value || 0)).toLocaleString('th-TH')}`; }

buffetDate.min=SmashRules.localDate();buffetDate.max=SmashRules.lastDate();buffetDate.value=buffetDate.min;
if(currentMember)document.querySelector('#buffetName').value=currentMember.name||'';
shuttleSelect.addEventListener('change',updateBuffetPrice);
buffetForm.addEventListener('submit',async event=>{
 event.preventDefault();const button=buffetForm.querySelector('[type=submit]');button.disabled=true;
 try{const data=Object.fromEntries(new FormData(buffetForm));data.level=buffetLevel.value;
 await SmashRules.bookBuffet(data,currentMember);
 buffetMessage.className='form-message success';buffetMessage.innerHTML='ลงชื่อแล้ว รอผู้จัดยืนยัน · <a href="my-bookings.html">รายการของฉัน</a>';
 const list=SmashRules.read('smashup_users_v1',[]),profile=Array.isArray(list)?list.find(u=>u.id===currentMember.id)?.profile:null;
 buffetForm.reset();buffetDate.value=SmashRules.localDate();buffetLevel.value=levelApi.effective(profile);buffetLevel.disabled=!!levelApi.confirmed(profile);document.querySelector('#buffetName').value=currentMember.name;updateBuffetPrice();
 }catch(error){buffetMessage.className='form-message error';buffetMessage.textContent=error.message}
 finally{button.disabled=false}
});
updateBuffetPrice();
