# Deploy Plan — Smashup (ฉบับจริง 2026-09-08)

เอกสารเก่า (mojibake/เทมเพลต) กล่าวถึง `frontend/` (Vue SPA) และ CI deploy ขึ้น Cloudflare ซึ่ง**ไม่มีใน repo ปัจจุบัน** ฉบับนี้เขียนตามสถานะจริง

## สถานะจริง

- หน้าเว็บเป็น static HTML/CSS/JS โหมดเดโม (localStorage) เปิดได้ด้วย local server ทันที ไม่ต้อง build
- backend เป็น Hono API พร้อม schema + OpenAPI แต่**หน้าเว็บยังไม่ได้เรียก API** และยังไม่ได้ deploy
- ไม่มี `.github/workflows` (ไม่พบไฟล์ CI ใน repo ปัจจุบัน) , ไม่มี `wrangler.jsonc` (มีแต่ `wrangler.example.jsonc` placeholder), ไม่มี `frontend/`

## ขั้นตอนถ้าจะ deploy จริง (manual)

### 1. Backend (Cloudflare Workers)
```bash
cd backend
npm install
npm run typecheck          # ตรวจผ่านก่อน
npx wrangler d1 create wab-smashup-db        # สร้าง DB, เอา database_id มาใส่ wrangler.jsonc
npx wrangler kv namespace create CACHE       # เอา id มาใส่ wrangler.jsonc
npm run db:migrate:local    # ตรวจ migration ในเครื่องก่อน
npx wrangler secret put JWT_SECRET
npm run deploy              # ต้องตั้ง CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
```

### 2. ต่อหน้าเว็บกับ API (ยังไม่ทำ — ต้องตัดสินใจขอบเขตก่อน)
- ใช้ seam `shared/api.js`: ตั้ง `smashup_api_mode=api` + `smashup_api_base_url` (หรือ `SMASHUP_API_CONFIG`)
- โหมด api จะไม่เขียน localStorage และ error ถ้าล้มเหลว (ออกแบบไว้ให้ไม่ fake สำเร็จ)

### 3. Host หน้าเว็บ static
- ทดสอบ: `python -m http.server 4173`
- ถ้าจะ host บน Cloudflare Pages: `npx wrangler pages deploy . --project-name=...` (ยังไม่ได้ตั้งค่า)

## กันผิดพลาด
- อย่า commit secret (wrangler.jsonc, .dev.vars ใส่ .gitignore ของ backend แล้ว)
- ตัวเลข/URL ใน DEPLOY_NOTES.md ฉบับเก่าเป็นประวัติ ไม่ยืนยันการใช้งานจริง