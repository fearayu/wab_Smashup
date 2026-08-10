export default [
  {
    heading: '🏸 เมนู',
  },
  {
    title: 'หน้าหลัก',
    to: { name: 'root' },
    icon: { icon: 'ri-home-line' },
  },
  {
    title: 'สมัคร/เข้าสู่ระบบ',
    to: { name: 'login' },
    icon: { icon: 'ri-login-box-line' },
  },
  // Below items only visible when authenticated
  {
    title: 'จองคอร์ท (Demo)',
    to: { name: 'demo' },
    icon: { icon: 'ri-calendar-check-line' },
    auth: true,
  },
  {
    heading: '🎯 ฟีเจอร์',
    auth: true,
  },
  {
    title: 'ตีบุฟเฟ่ต์',
    to: { name: 'buffet' },
    icon: { icon: 'ri-vip-crown-line' },
    auth: true,
  },
  {
    title: 'ตีก๊วน',
    to: { name: 'gang' },
    icon: { icon: 'ri-group-line' },
    auth: true,
  },
  {
    title: 'สั่งอาหาร',
    to: { name: 'food' },
    icon: { icon: 'ri-restaurant-line' },
    auth: true,
  },
  {
    heading: '⚙️ จัดการ',
    auth: true,
  },
  {
    title: 'แดชบอร์ด',
    to: { name: 'dashboard' },
    icon: { icon: 'ri-dashboard-line' },
    auth: true,
  },
  {
    title: 'จัดการยศ (Admin)',
    to: { name: 'admin-roles' },
    icon: { icon: 'ri-admin-line' },
    auth: true,
    admin: true,
  },
]
