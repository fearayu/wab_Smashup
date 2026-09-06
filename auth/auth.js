const USERS_KEY = 'smashup_users_v1';
const SESSION_KEY = 'smashup_session_v1';
let registerMode = false;
const form = document.querySelector('#authForm');
const feedback = document.querySelector('#feedback');
const emailField = document.querySelector('#emailField');
const title = document.querySelector('#formTitle');
const description = document.querySelector('#formDescription');
const submitButton = document.querySelector('#submitButton');
const switchMode = document.querySelector('#switchMode');
const switchCopy = document.querySelector('#switchCopy');

function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } }
function setFeedback(message, type = '') { feedback.textContent = message; feedback.className = `feedback ${type}`; }
async function hashPassword(password) { const bytes = new TextEncoder().encode(password); const hash = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
function nextPage() { const next = new URLSearchParams(location.search).get('next'); return next && next.startsWith('../') ? next : '../index.html'; }
function renderMode() { const login = !registerMode; title.textContent = login ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'; description.textContent = login ? 'เข้าสู่ระบบด้วย username และรหัสผ่าน' : 'สร้างบัญชีด้วย username, อีเมล และรหัสผ่าน'; emailField.hidden = login; document.querySelector('#email').required = !login; document.querySelector('#password').autocomplete = login ? 'current-password' : 'new-password'; submitButton.textContent = login ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'; switchCopy.firstChild.textContent = login ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีอยู่แล้ว? '; switchMode.textContent = login ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'; setFeedback(''); }

switchMode.addEventListener('click', () => { registerMode = !registerMode; renderMode(); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const email = document.querySelector('#email').value.trim().toLowerCase();
  const password = document.querySelector('#password').value;
  const isAdminAttempt = username === 'admin' && password === '12345';
  if (!username || (!isAdminAttempt && password.length < 6) || (registerMode && !email)) { setFeedback('กรุณากรอกข้อมูลให้ครบ และรหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return; }
  if (!registerMode && isAdminAttempt) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: 'admin', name: 'admin', email: 'admin@smashup.local', role: 'admin' }));
    setFeedback('เข้าสู่ระบบผู้ดูแลสำเร็จ กำลังพาไปแดชบอร์ด…', 'success');
    setTimeout(() => { const next = new URLSearchParams(location.search).get('next'); location.href = next && next.includes('admin') ? next : '../admin/index.html'; }, 500);
    return;
  }
  const users = getUsers(); const passwordHash = await hashPassword(password); if (registerMode) { if (users.some(user => user.username === username || user.email === email)) { setFeedback('username หรืออีเมลนี้มีบัญชีอยู่แล้ว', 'error'); return; } const user = { id: crypto.randomUUID(), username, name: username, email, passwordHash, createdAt: new Date().toISOString() }; users.push(user); localStorage.setItem(USERS_KEY, JSON.stringify(users)); localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.username, email: user.email, role: 'user' })); setFeedback('สร้างบัญชีเรียบร้อย กำลังพาไปหน้าแรก…', 'success'); } else { const user = users.find(item => (item.username === username || (!item.username && item.email === username)) && item.passwordHash === passwordHash); if (!user) { setFeedback('username หรือรหัสผ่านไม่ถูกต้อง', 'error'); return; } localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.username || user.name || user.email, email: user.email, role: user.role || 'user' })); setFeedback('เข้าสู่ระบบสำเร็จ กำลังพาไปต่อ…', 'success'); } setTimeout(() => { location.href = nextPage(); }, 500); });
renderMode();
