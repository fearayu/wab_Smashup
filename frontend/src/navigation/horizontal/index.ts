export default [
  {
    title: 'หน้าหลัก',
    to: { name: 'root' },
    icon: { icon: 'ri-home-line' },
  },
  {
    title: 'ฟีเจอร์',
    children: [
      {
        title: 'จองคอร์ท (Demo)',
        to: { name: 'demo' },
        icon: { icon: 'ri-calendar-check-line' },
      },
      {
        title: 'ตีบุฟเฟ่ต์',
        to: { name: 'buffet' },
        icon: { icon: 'ri-vip-crown-line' },
      },
      {
        title: 'ตีก๊วน',
        to: { name: 'gang' },
        icon: { icon: 'ri-group-line' },
      },
      {
        title: 'สั่งอาหาร',
        to: { name: 'food' },
        icon: { icon: 'ri-restaurant-line' },
      },
    ],
  },
  {
    title: 'จัดการ',
    children: [
      {
        title: 'แดชบอร์ด',
        to: { name: 'dashboard' },
        icon: { icon: 'ri-dashboard-line' },
      },
      {
        title: 'สมัคร/เข้าสู่ระบบ',
        to: { name: 'login' },
        icon: { icon: 'ri-login-box-line' },
      },
      {
        title: 'จัดการยศ (Admin)',
        to: { name: 'admin-roles' },
        icon: { icon: 'ri-admin-line' },
      },
    ],
  },
]
