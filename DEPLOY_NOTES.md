# Deploy Notes — Smashup (สถานะเก่า สงวนไว้เป็นบันทึก)

## ประกาศ (2026-09-08)

เอกสารนี้มาจากเทมเพลต/รอบก่อนหน้าแล้ว**ไม่ตรงกับโค้ดปัจจุบัน** โปรดอ่านก่อนเชื่อข้อความด้านล่าง:

- หน้าเว็บที่ใช้งานจริงในโปรเจกต์นี้เป็น **Static HTML/JS โหมดเดโม (localStorage)** ไม่มี `frontend/` (Vue) ซ้ำใน repo
- URL ด้านล่าง (`*.workers.dev`, `*.pages.dev`) เป็นค่าจากช่วง deploy เก่า **ยังไม่มีการยืนยันว่าใช้งานได้** สำหรับรุ่นนี้ อย่าใช้อ้างอิงในการนำเสนอ
- ยังไม่ได้ deploy backend รุ่นนี้ ขึ้นจริงต้องทำตามขั้นตอนในส่วน "ถ้าจะ deploy จริง"

## ถ้าจะ deploy จริง (ต้องทำเอง)

1. `backend/wrangler.jsonc` มีค่า placeholder (`<REPLACE_WITH_...>`) ต้องแทนด้วย ID จริงจาก `npx wrangler d1 create` / `npx wrangler kv namespace create`
2. ตั้ง secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID`, `KV_NAMESPACE_ID`, `JWT_SECRET` (ไม่ commit secret ลง repo)
3. `npm run db:migrate:local` ก่อนรันในเครื่อง แล้ว `npm run deploy` เมื่อพร้อม
4. หน้าเว็บ static เปิดด้วย `python -m http.server` หรือ host บน Cloudflare Pages (ยังไม่ได้ตั้งค่า Git/CI ใน repo นี้)

## วิธีเปิดใช้งานแบบเดโม (ไม่ต้อง deploy)

```bash
python -m http.server 4173
# http://localhost:4173/
```

> เก็บไว้เป็นข้อมูลประวัติเท่านั้น — เลิกอ้างอิงว่าเวอร์ชันนี้ deploy แล้ว