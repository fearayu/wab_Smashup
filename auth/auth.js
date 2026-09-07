const USERS_KEY = 'smashup_users_v1';
const SESSION_KEY = 'smashup_session_v1';
// บัญชีผู้ดูแลเป็นบัญชีระบบ จึงไม่อยู่ในขั้นตอนสมัครสมาชิก
const SYSTEM_ADMINS = [{ id: 'system-admin-smashup', username: 'admin', name: 'Admin SMASHUP', passwordHash: '93823af8d0e719e4a7a68efdbb62886b4169ff7683f95a3741b6b0d21aa85873', role: 'admin' }];
let registerMode = false;
const form = document.querySelector('#authForm');
const feedback = document.querySelector('#feedback');
const emailField = document.querySelector('#emailField');
const playerProfile = document.querySelector('#playerProfile');
const profileLevel = document.querySelector('#profileLevel');
profileLevel.innerHTML = '<option value="pending">ประเมินทักษะหลังสมัครสมาชิก</option>';
const profileGoal = document.querySelector('#profileGoal');
const title = document.querySelector('#formTitle');
const description = document.querySelector('#formDescription');
const submitButton = document.querySelector('#submitButton');
const switchMode = document.querySelector('#switchMode');
const switchCopy = document.querySelector('#switchCopy');
function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } }
function setFeedback(message, type = '') { feedback.textContent = message; feedback.className = `feedback ${type}`; }
async function hashPassword(password) { const bytes = new TextEncoder().encode(password); const hash = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
function nextPage(role) {
  const next = new URLSearchParams(location.search).get('next');
  if (next && next.startsWith('../')) return next;
  return role === 'admin' ? '../admin/admin-dashboard.html' : '../auth/player-assessment.html';
}
function renderMode() {
  const login = !registerMode;
  title.textContent = login ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
  description.textContent = login ? 'เข้าสู่ระบบด้วย username และรหัสผ่าน' : 'สร้างบัญชี พร้อมตอบแบบสอบถามสั้น ๆ เพื่อปรับคำแนะนำให้เหมาะกับคุณ';
  emailField.hidden = login; playerProfile.hidden = login;
  document.querySelector('#email').required = !login; profileLevel.required = !login; profileGoal.required = !login;
  document.querySelector('#password').autocomplete = login ? 'current-password' : 'new-password';
  submitButton.textContent = login ? 'เข้าสู่ระบบ' : 'สร้างบัญชี';
  switchCopy.firstChild.textContent = login ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีอยู่แล้ว? ';
  switchMode.textContent = login ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'; setFeedback('');
}
switchMode.addEventListener('click', () => { registerMode = !registerMode; renderMode(); });
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const email = document.querySelector('#email').value.trim().toLowerCase();
  const password = document.querySelector('#password').value;
  const profile = { level: profileLevel.value, goal: profileGoal.value, frequency: document.querySelector('#profileFrequency').value, availability: document.querySelector('#profileAvailability').value };
  if (!username || password.length < 6 || (registerMode && (!email || !profile.level || !profile.goal))) { setFeedback('กรุณากรอกข้อมูลให้ครบ รวมถึงแบบสอบถามผู้เล่น และรหัสผ่านอย่างน้อย 6 ตัวอักษร', 'error'); return; }
  const users = getUsers(); const passwordHash = await hashPassword(password);
  if (registerMode) {
    if (SYSTEM_ADMINS.some(user => user.username === username)) { setFeedback('username นี้สงวนไว้สำหรับบัญชีผู้ดูแลระบบ', 'error'); return; }
    if (users.some(user => user.username === username || user.email === email)) { setFeedback('username หรืออีเมลนี้มีบัญชีอยู่แล้ว', 'error'); return; }
    const user = { id: crypto.randomUUID(), username, name: username, email, passwordHash, profile, role: 'user', createdAt: new Date().toISOString() };
    users.push(user); localStorage.setItem(USERS_KEY, JSON.stringify(users)); localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.username, email: user.email, profile: user.profile, role: user.role }));
    setFeedback('สร้างบัญชีและบันทึกโปรไฟล์ผู้เล่นเรียบร้อย กำลังพาไปหน้าแรก…', 'success');
  } else {
    const systemAdmin = SYSTEM_ADMINS.find(item => item.username === username && item.passwordHash === passwordHash);
    const user = systemAdmin || users.find(item => (item.username === username || (!item.username && item.email === username)) && item.passwordHash === passwordHash);
    if (!user) { setFeedback('username หรือรหัสผ่านไม่ถูกต้อง', 'error'); return; }
    const role = user.role === 'admin' ? 'admin' : 'user';
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.username || user.name || user.email, email: user.email || '', profile: user.profile || {}, role }));
    setFeedback('เข้าสู่ระบบสำเร็จ กำลังพาไปต่อ…', 'success');
  }
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  setTimeout(() => { location.href = nextPage(session.role); }, 500);
});
renderMode();
