# Backend Engineer Status — smashup backend

## สถานะปัจจุบัน (ยืนยันในเครื่อง 2026-09-08)

- **จุดตัน (blocker):** ไม่มี — โค้ดครบและตรวจผ่านในเครื่อง
- **สิ่งที่ยังขาด:** ไม่มีหน้าเว็บใดเรียก API (หน้าเว็บใช้ localStorage โหมดเดโม), ยังไม่ตั้งค่า D1/KV จริง และยังไม่ deploy

## ผลการตรวจในเครื่อง

| คำสั่ง | ผล |
|---|---|
| `npm install` | ✅ ติดตั้งครบ (57 packages) |
| `npm run typecheck` (tsc --noEmit) | ✅ ผ่านไม่มี error |
| `npm run build:lambda` (esbuild) | ✅ dist/lambda/index.mjs 783.3 KB |
| `npm run smoke` | ✅ pass — /health, /openapi.json, register 201+JWT, auth/me 200, login 200, รหัสผิด 401 |

หมายเหตุ smoke: รันด้วย memory repositories (แบบ Lambda) ไม่ต้องใช้ Cloudflare; ต้องมี `JWT_SECRET` ใน env ของ Worker ตาม `wrangler.jsonc`/`src/types.ts` เส้นทาง `/api/v1` ที่ไม่มีอยู่จะถูก middleware auth ของ court/venue/dashboard ดักเป็น 401 ก่อนถูก 404 (พฤติกรรมนี้เกิดขึ้นจริงและถูกบันทึกไว้ในการทดสอบ)

## เสร็จแล้ว

- [x] Migration 0002 (owners, venues, courts, time_slots, bookings, payments, site_configs)
- [x] Domain entities, repository interfaces + D1 + memory implementations ครบทุก resource
- [x] Services: Auth (register/login/me + JWT), Venue, Court, TimeSlot, Booking, Payment, SiteConfig, Dashboard
- [x] Handlers, Zod schemas, routers พร้อม OpenAPI docs (hono-openapi)
- [x] Auth middleware (Bearer JWT) + rate limit + DI container
- [x] server.ts (CF Workers: D1+KV) และ lambda.ts (memory) + seed demo route `/api/v1/demo/seed`
- [x] `npm run smoke` standalone (bundle + run, อิง `smoke-test.mjs`)

## ยังต้องทำ

- [ ] ต่อหน้าเว็บ (booking/matching/auth) เข้ากับ API ผ่าน `shared/api.js` seam (โหมด api) โดยยังคงโหมด demo เป็นค่าเริ่มต้น
- [ ] รัน D1 migrations บนเครื่อง (`npm run db:migrate:local`) และทดสอบ flow จริงด้วย D1
- [ ] ตั้งค่า `wrangler.jsonc` (ID D1/KV จริง) และ secrets ก่อน deploy
- [ ] เพิ่ม test suite ฝั่ง backend (ปัจจุบันยืนยันด้วย typecheck + smoke)

## ข้อเท็จจริงที่ควรบันทึก

- โมเดล backend เป็นแบบ **owner→venue→court→slots (SaaS หลายสนาม)** ซึ่งต่างจากโมเดลหน้าเว็บ demo (สนามเดียว + ผู้จัดกลาง) ต้องตกลงขอบเขตโครงงานว่าใช้โมเดลใดก่อนนำไปเชื่อมจริง
- ข้อมูลจริงของ business domain ฝั่งหน้าเว็บ (จองคอร์ต/บุฟเฟต์/คำขอ/นัดหมาย) ยังอยู่แค่ใน `shared/*.js` (localStorage) ยังไม่มี entity ตรงกันใน backend