// Local HTTP server for the Smashup backend — memory repositories (Lambda-style),
// no Cloudflare/D1/KV needed. Run with: npm run start:local  (bundled by esbuild)
import http from 'node:http'
import { createApp } from './src/app.ts'
import { createContainer } from './src/di/container.ts'
import { MemoryBookingRepository } from './src/infrastructure/memory/memory-booking-repository.ts'
import { MemoryCacheRepository } from './src/infrastructure/memory/memory-cache-repository.ts'
import { MemoryCourtRepository } from './src/infrastructure/memory/memory-court-repository.ts'
import { MemoryDashboardRepository } from './src/infrastructure/memory/memory-dashboard-repository.ts'
import { MemoryOwnerRepository } from './src/infrastructure/memory/memory-owner-repository.ts'
import { MemoryPaymentRepository } from './src/infrastructure/memory/memory-payment-repository.ts'
import { MemorySiteConfigRepository } from './src/infrastructure/memory/memory-site-config-repository.ts'
import { MemoryTimeSlotRepository } from './src/infrastructure/memory/memory-time-slot-repository.ts'
import { MemoryUserRepository } from './src/infrastructure/memory/memory-user-repository.ts'
import { MemoryVenueRepository } from './src/infrastructure/memory/memory-venue-repository.ts'

const port = Number(process.env.PORT || 8787)
const jwtSecret = process.env.JWT_SECRET || 'smashup-local-dev-secret'

const courtRepo = new MemoryCourtRepository()
const slotRepo = new MemoryTimeSlotRepository()
slotRepo.setCourtRepository(courtRepo)

const venueRepo = new MemoryVenueRepository()
const siteConfigRepo = new MemorySiteConfigRepository()
siteConfigRepo.setVenueRepository(venueRepo)
siteConfigRepo.setCourtRepository(courtRepo)

const bookingRepo = new MemoryBookingRepository()
const paymentRepo = new MemoryPaymentRepository()
paymentRepo.setBookingRepository(bookingRepo)

const container = createContainer({
  userRepository: new MemoryUserRepository(),
  ownerRepository: new MemoryOwnerRepository(),
  venueRepository: venueRepo,
  courtRepository: courtRepo,
  timeSlotRepository: slotRepo,
  bookingRepository: bookingRepo,
  paymentRepository: paymentRepo,
  siteConfigRepository: siteConfigRepo,
  dashboardRepository: new MemoryDashboardRepository(),
  cacheRepository: new MemoryCacheRepository(),
}, jwtSecret)

const app = createApp(() => container)
const ENV = { JWT_SECRET: jwtSecret, ENVIRONMENT: 'development' }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = chunks.length > 0 ? Buffer.concat(chunks) : null

  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: body && body.length > 0 ? body : undefined,
  })

  try {
    const response = await app.fetch(request, ENV, { waitUntil: () => {} })
    res.writeHead(response.status, {
      ...Object.fromEntries(response.headers.entries()),
      'Access-Control-Allow-Origin': '*',
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (err) {
    console.error('Handler error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }))
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`SMASHUP backend (memory) listening on http://127.0.0.1:${port}`)
  console.log(`  health:   http://127.0.0.1:${port}/health`)
  console.log(`  openapi:  http://127.0.0.1:${port}/openapi.json`)
  console.log(`  docs:     http://127.0.0.1:${port}/docs`)
})