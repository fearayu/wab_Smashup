const authUiScript = document.createElement('script');
authUiScript.src = '../shared/auth-ui.js';
document.head.append(authUiScript);
const formStyle = document.createElement('link');
formStyle.rel = 'stylesheet';
formStyle.href = 'form-compact.css';
document.head.append(formStyle);

const form = document.querySelector('#booking-form');
const date = document.querySelector('#date');
const courts = document.querySelector('#courts');
const estimate = document.querySelector('#estimate');
const success = document.querySelector('#success');
const currentUser = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
if (form && date && courts && estimate && success) {
	date.min = new Date().toISOString().split('T')[0];
	if (currentUser && form.elements.name && !form.elements.name.value) form.elements.name.value = currentUser.name;
	courts.addEventListener('change', () => { estimate.textContent = `฿ ${(Number(courts.value) * 130).toLocaleString('th-TH')}`; });
	form.addEventListener('submit', (event) => { event.preventDefault(); if (!currentUser) { success.innerHTML = 'กรุณา <a href="../auth/index.html?next=../booking/form.html">เข้าสู่ระบบ</a> ก่อนส่งคำขอจอง'; return; } const data = new FormData(form); success.textContent = `รับข้อมูลแล้ว คุณ ${data.get('name')} ทีมงานจะติดต่อกลับเพื่อยืนยันการจองเร็ว ๆ นี้`; });
}
