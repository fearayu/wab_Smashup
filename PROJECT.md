# wab_Smashup — Badminton Court Booking Web Builder

## Vision
AI-powered platform that lets badminton court owners create their own booking website in 5 minutes — no coding required. Eliminates manual chat/phone booking, prevents double-booking, and accepts payments 24/7.

## Audience
- **Primary users**: Badminton court owners who want their own booking website
- **Secondary users**: Players looking for available courts to book
- Market size: ~1,500 badminton courts in Thailand still relying on word-of-mouth / LINE chat
- User scenario: Friday 4:30 PM, group of 6 friends wants to play but doesn't know which court is available

## Problems We Solve
- Court owners manually reply to LINE chats / phone calls to check availability
- Double-bookings happen frequently
- Bank transfer slips must be checked one by one
- Off-peak hours (10:00–16:00) lose revenue because no real-time promotion channel
- Digital-first players expect instant booking in a few clicks

## Must-Have Features (Priority Order)
1. **Instant Web Generator** — Create a booking website in a few clicks
2. **Real-time Slot Booking** — Check court availability and auto-lock slots 24/7
3. **Auto Payment & Verification** — Accept transfers and verify slips automatically
4. **Owner Dashboard** — Revenue summary, peak hours report, booking management

## Solution Flow
1. User selects a court template and enters court info / pricing
2. AI agent generates a complete booking website with real-time availability
3. Owner gets a ready-to-use link to promote and receives real-time bookings

## Business Model
- B2B SaaS Subscription + Transaction Fee
- Free Tier: 14-day trial or basic website
- Pro Plan: ฿590–990/month (full features, unlimited courts, auto slip verification)
- Transaction Fee: 1–2% per booking processed through the system

## Competitive Edge
- vs LINE OA / Google Forms / Excel: We are fully automated (no manual work)
- vs Custom court management systems: We are cheaper, faster setup (5 minutes), and the owner keeps their own brand

## Technical Requirements
- Responsive web app (mobile + desktop)
- Stack: Vue 3 + Vuetify + Pinia (frontend), Hono + Cloudflare Workers + D1 + KV (backend)
- Seed/mock data for instant demo without registration
- Clean code, clear file separation, README with run instructions
- Focus on must-have features first, then enhancements

## Demo Moment (30 seconds)
Type court name → set number of courts → press button → AI generates a beautiful, complete booking website ready to accept real bookings immediately.

## Target Outcome
- Pilot test with 10 badminton courts (free + exclusive support)
- Or: Pitch for 300k funding to develop next phase / advance to final round

## UI Direction
- Simple, gamified UX
- Easy to understand for both court owners and players
- Thai language primary, English secondary

## File Locations
- Backend: `/backend/` — Hono API with Clean Architecture
- Frontend: `/frontend/` — Vue 3 SPA with file-based routing
- Template base: `https://github.com/fakduai-logistics-and-digital-platform/starter-template`
- Renamed from `starter-*` to `wab_Smashup`
