# Deploy Notes — Smashup

## ✅ Deployed (Auto)

| Component | Status | URL |
|---|---|---|
| Backend Worker | ✅ Live | https://wab-smashup-backend.aphichetaeimnor.workers.dev |
| D1 Database | ✅ Created | `wab-smashup-db` |
| KV Namespace | ✅ Created | `CACHE` |
| Migrations | ✅ Applied | 0001 + 0002 |
| Pages Project | ✅ Created | `wab-smashup-frontend` |

## 🛠️ Backend Details

- **Account ID**: `<YOUR_ACCOUNT_ID>`
- **D1 Database ID**: `<YOUR_D1_DATABASE_ID>`
- **KV Namespace ID**: `<YOUR_KV_NAMESPACE_ID>`
- **Backend URL**: `https://wab-smashup-backend.aphichetaeimnor.workers.dev`

## 👤 Next Steps (Manual)

### Option A: GitHub Actions CI (Recommended)

1. Add these **Repository Secrets** at:
   `https://github.com/67021354-sudo/wab_Smashup/settings/secrets/actions`

   | Secret | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | `<YOUR_CF_API_TOKEN>` |
   | `CLOUDFLARE_ACCOUNT_ID` | `<YOUR_ACCOUNT_ID>` |
   | `D1_DATABASE_ID` | `<YOUR_D1_DATABASE_ID>` |
   | `KV_NAMESPACE_ID` | `<YOUR_KV_NAMESPACE_ID>` |
   | `PAGES_PROJECT_NAME` | `wab-smashup-frontend` |
   | `VITE_BACKEND_URL` | `https://wab-smashup-backend.aphichetaeimnor.workers.dev` |

2. Push any commit to `main` or go to **Actions tab** → **Run workflow**

### Option B: Build Locally

```bash
cd frontend
pnpm install --frozen-lockfile
VITE_BACKEND_URL="https://wab-smashup-backend.aphichetaeimnor.workers.dev" pnpm build
npx wrangler pages deploy dist --project-name=wab-smashup-frontend --branch=main
```

### Option C: Manual wrangler deploy (no build)

If you have a pre-built `dist/` folder:

```bash
npx wrangler pages deploy dist --project-name=wab-smashup-frontend --branch=main
```

---

Generated: 2026-08-10 UTC
