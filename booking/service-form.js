const SERVICE_STORAGE_KEY = 'smashup_service_requests_v1';
const serviceForm = document.querySelector('#serviceForm');
const serviceMessage = document.querySelector('#serviceMessage');
const member = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
function loadServices() { try { return JSON.parse(localStorage.getItem(SERVICE_STORAGE_KEY)) || []; } catch { return []; } }
if (serviceForm) {
  const nameField = serviceForm.elements.name;
  if (member && nameField && !nameField.value) nameField.value = member.name;
  serviceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!member) { serviceMessage.className = 'service-message error'; serviceMessage.innerHTML = 'กรุณา <a href="../auth/login.html">เข้าสู่ระบบ</a> ก่อนส่งรายการ'; return; }
    const request = Object.fromEntries(new FormData(serviceForm));
    const requests = loadServices();
    if (request.service === 'สมัครแข่งขัน') {
      const sameCategory = requests.filter((item) => item.service === request.service && item.event === request.event && item.category === request.category && item.status !== 'ยกเลิกแล้ว');
      if (sameCategory.some((item) => item.ownerId === member.id)) { serviceMessage.className = 'service-message error'; serviceMessage.textContent = 'คุณสมัครรายการและประเภทนี้แล้ว'; return; }
      if (sameCategory.length >= 64) { serviceMessage.className = 'service-message error'; serviceMessage.textContent = 'รายการแข่งขันประเภทนี้เต็มแล้ว'; return; }
    }
    if (request.service === 'จองสนามซ้อม' && Number(request.players) > 8) { serviceMessage.className = 'service-message error'; serviceMessage.textContent = 'สนามซ้อมรองรับไม่เกิน 8 คนต่อรอบ'; return; }
    if (request.service === 'ลงชื่อซื้อของ' && Number(request.quantity) > 5) { serviceMessage.className = 'service-message error'; serviceMessage.textContent = 'รับจองสินค้าไม่เกิน 5 ชิ้นต่อรายการ'; return; }
    requests.push({ id: crypto.randomUUID(), ...request, ownerId: member.id, createdAt: new Date().toISOString(), status: 'รอตรวจสอบ' });
    localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(requests));
    serviceMessage.className = 'service-message success';
    serviceMessage.textContent = 'ส่งข้อมูลเรียบร้อย ทีมงานจะตรวจสอบและติดต่อกลับเร็ว ๆ นี้';
    serviceForm.reset(); if (member && nameField) nameField.value = member.name;
  });
}
