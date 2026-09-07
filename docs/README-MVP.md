# Smashup — Badminton Court Booking MVP

## 🎯 สำหรับ Hackathon Demo

ระบบสร้างเว็บไซต์จองสนามแบดมินตันแบบ No-Code ใน 5 นาที

---

## 🚀 Live Demo

| ส่วน | URL |
|------|-----|
| **Landing Page** | https://9a94cade.wab-smashup-frontend.pages.dev |
| **Demo Booking** | https://9a94cade.wab-smashup-frontend.pages.dev/demo |
| **Backend API** | https://wab-smashup-backend.aphichetaeimnor.workers.dev |

---

## 📱 หน้าที่สร้าง (Sitemap)

| หน้า | รายละเอียด | สถานะ |
|------|-----------|--------|
| `/` | Landing Page — ขายแนวคิด + CTA | ✅ |
| `/demo` | **Demo Booking** — จองคอร์ทได้จริง! | ✅ |
| `/login` | Login/Register | ✅ |
| `/setup` | Onboarding — สร้างสนาม 3 ขั้นตอน | ✅ |
| `/dashboard` | Owner Dashboard | ✅ |
| `/book/:slug` | Public Booking (ตัวอย่าง) | ✅ |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + Vuetify 3 + Vite |
| Backend | Hono + Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Cache | Cloudflare KV |
| Deploy | Cloudflare Pages + Workers |

---

## 🎬 โมเมนต์เดโม (30 วินาที)

1. เปิด `/demo`
2. เลือกวัน → เลือกคอร์ท → เลือกเวลา
3. กด "จองคอร์ทเลย"
4. แสดง QR Code สำหรับชำระเงิน
5. ✅ **เดโมเสร็จ!**

---

## 💡 จุดเด่นของระบบ

- ✅ **สร้างเว็บใน 5 นาที** — ไม่ต้องเขียนโค้ด
- ✅ **จองเรียลไทม์** — เห็นคอร์ทว่างทันที
- ✅ **ป้องกันคิวชน** — ล็อกคิวอัตโนมัติ
- ✅ **ชำระเงินอัตโนมัติ** — ตรวจสลิป PromptPay
- ✅ **ใช้งานบนมือถือ** — Responsive design

---

## 🏗 โครงสร้างโปรเจกต์

```
/tmp/wab_Smashup/
├── backend/          # Hono API + D1 + KV
│   ├── src/
│   │   ├── server.ts
│   │   └── routes/
│   └── wrangler.jsonc
├── frontend/         # Vue 3 + Vuetify
│   ├── src/
│   │   ├── pages/    # หน้าต่างๆ
│   │   ├── stores/   # Pinia stores
│   │   └── apis/     # API clients
│   └── vite.config.ts
└── docs/
    └── README-MVP.md
```

---

## 📝 ข้อมูลตัวอย่าง (Mock Data)

Demo page มีข้อมูลสนามตัวอย่าง:
- **สนาม**: สนามแบดมินตัน สมพร
- **คอร์ท**: 4 คอร์ท (A, B, C Premium, D Premium)
- **ราคา**: 250-350 บาท/ชม.
- **เวลา**: 08:00-21:00

---

## 🎨 Design System

| Token | ค่า |
|-------|-----|
| Primary | `#1B5E20` (Court Green) |
| Accent | `#FF6F00` (Shuttlecock Orange) |
| Background | `#F0F7F0` (Light Green) |
| Radius | `0.625rem` (10px) |

---

## 👥 ทีมพัฒนา

- ธนภัทร แสนคำยวง
- อภิเชษฐ์ เอี่ยมหน่อ
- สุวิชาดา วงพีระ

**อาจารย์ที่ปรึกษา**: ผู้ช่วยศาสตราจารย์ ดร.สุรางคนา ระวังยศ

---

มหาวิทยาลัยพะเยา | คณะเทคโนโลยีสารสนเทศ | สาขาวิทยาการคอมพิวเตอร์
