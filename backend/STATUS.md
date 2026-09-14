# Backend Engineer Status — smashup backend

## สถานะปัจจุบัน (ยืนยันในเครื่อง 2026-09-14)

- **จุดตัน (blocker):** ไม่มี
- **สิ่งที่ยังขาด:** หน้าเว็บไม่เรียก API (โหมดเดโม localStorage), ยังไม่ตั้งค่า D1/KV จริง และยังไม่ deploy

## ผลการตรวจในเครื่อง (ล่าสุด)

| คำสั่ง | ผล |
|---|---|
| `npm install` | ✅ ติดตั้งครบ |
| `npm run typecheck` (tsc --noEmit) | ✅ ผ่าน |
| `npm run build:lambda` (esbuild) | ✅ bundle ผ่าน |
| `npm run smoke` | ✅ pass — /health, /openapi.json, register 201+JWT, auth/me 200, login 200, รหัสผิด 401, path ปลอม 404 |
| `verify-profiles.mjs` (in-process) | ✅ 27/27 pass — profiles CRUD ครบทั้ง 4 routes |

หมายเหตุ smoke: รันด้วย memory repositories (แบบ Lambda) ไม่ต้องใช้ Cloudflare; ต้องมี `JWT_SECRET` ใน env ของ Worker ตาม `wrangler.jsonc`/`src/types.ts`

## เสร็จแล้ว

- [x] Migration 0001–0005: users → core business → rbac_roles → notifications → **user profile fields (display_name, phone, level, role, avatar_url, updated_at)**
- [x] Domain entities, repository interfaces + D1 + memory implementations ครบทุก resource
- [x] Services: Auth (register/login/me + JWT), Venue, Court, TimeSlot, Booking, Payment, SiteConfig, Dashboard, **Notification**, **User (profile)**
- [x] Handlers, Zod schemas, routers พร้อม OpenAPI docs (hono-openapi)
- [x] Auth middleware (Bearer JWT) + rate limit + DI container
- [x] **Notifications CRUD (5 routes)** — `GET /api/v1/notifications` (list, `?unreadOnly=true`), `GET /unread-count`, `POST /` (create), `POST /read-all`, `POST /:id/read` — โค้ดครบ (entity/repo D1+memory/service/handler/schema/router) + migration `0004_create_notifications.sql` + ต่อใน `routers/index.ts`
- [x] **Profiles CRUD (4 routes)** — `GET /api/v1/profiles/me` (own profile, auto-provision), `PUT /api/v1/profiles/me` (update displayName/phone/level/avatarUrl), `GET /api/v1/profiles/:id` (public profile), `GET /api/v1/profiles` (admin list) — โค้ดครบ + migration `0005_add_user_profile_fields.sql` + mount ใน `routers/index.ts` ที่ `/profiles`
- [x] `server.ts` (CF Workers: D1+KV) และ `lambda.ts` (memory) + seed demo route `/api/v1/demo/seed`
- [x] Business domains: appointments, tournaments, matchmaking และ buffet bookings — entities, D1/memory repositories, services, handlers, schemas, routers และ migration `0006_business_domains.sql`
- [x] Wire business domains เข้า DI container, Worker/Lambda entrypoints และ `routers/index.ts`
- [x] `npm run smoke` standalone (bundle + run, อิง `smoke-test.mjs`)

## ยังต้องทำ

- [ ] ต่อหน้าเว็บ (booking/matching/auth) เข้ากับ API ผ่าน `shared/api.js` seam (โหมด api) โดยยังคงโหมด demo เป็นค่าเริ่มต้น
- [ ] ต่อหน้าเว็บ (booking/matching/auth) เข้ากับ API ผ่าน `shared/api.js` seam (โหมด api) โดยยังคงโหมด demo เป็นค่าเริ่มต้น
- [ ] รัน D1 migrations บนเครื่อง (`npm run db:migrate:local`) และทดสอบ flow จริงด้วย D1
- [ ] ตั้งค่า `wrangler.jsonc` (ID D1/KV จริง) และ secrets ก่อน deploy
- [ ] เพิ่ม test suite ฝั่ง backend (ปัจจุบันยืนยันด้วย typecheck + smoke + verify-profiles)

## Phase 0 — การตัดสินใจขอบเขตสาธิต (กันยายน 2026)

- ตกลงสาธิตเป็น **สนามเดียว (single-venue)** กับผู้จัดกลาง ตรงกับโมเดลหน้าเว็บเดโม
- โมเดล backend (owner→venue→court→slots แบบ SaaS หลายสนาม) **เก็บไว้เป็นเรื่องต่อยอด** ไม่ใช่ขอบเขตของต้นแบบฉบับนี้ — ไม่ต้องปรับ schema ให้เป็นสนามเดียวตอนนี้

## ข้อเท็จจริงที่ควรบันทึก

- ข้อมูลจริงของ business domain ฝั่งหน้าเว็บ (จองคอร์ต/บุฟเฟต์/คำขอ/นัดหมาย/แข่ง) ยังอยู่แค่ใน `shared/*.js` (localStorage) ยังไม่มี entity ตรงกันใน backend ยกเว้น bookings/payments ที่มี schema อยู่แล้ว
- typecheck ณ 2026-09-14 ผ่านเรียบร้อย — profiles endpoints ครบแล้ว
