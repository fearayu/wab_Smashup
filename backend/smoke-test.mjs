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

const container = createContainer({
  userRepository: new MemoryUserRepository(),
  ownerRepository: new MemoryOwnerRepository(),
  venueRepository: new MemoryVenueRepository(),
  courtRepository: new MemoryCourtRepository(),
  timeSlotRepository: new MemoryTimeSlotRepository(),
  bookingRepository: new MemoryBookingRepository(),
  paymentRepository: new MemoryPaymentRepository(),
  siteConfigRepository: new MemorySiteConfigRepository(),
  dashboardRepository: new MemoryDashboardRepository(),
  cacheRepository: new MemoryCacheRepository(),
}, 'smoke-test-secret')

const app = createApp(() => container)
const ENV = { JWT_SECRET: 'smoke-test-secret' }
const req = (path, init = {}) => app.request(path, init, ENV)
const j = (r) => r.json()

const health = await app.request('/health')
console.log('health:', health.status, JSON.stringify(await j(health)))

const spec = await app.request('/openapi.json')
console.log('openapi:', spec.status, 'title:', (await j(spec)).info?.title)

const reg = await req('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'owner@example.com', password: 'supersecret1', name: 'ผู้ดูแลสนาม' }),
})
const regBody = await j(reg)
console.log('register:', reg.status, 'token?', Boolean(regBody.data?.token), 'role:', regBody.data?.owner?.role)

const token = reg.status === 201 ? regBody.data.token : null
const me = await req('/api/v1/auth/me', { headers: { authorization: `Bearer ${token}` } })
console.log('auth/me:', me.status, (await j(me)).data?.email)

const login = await req('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'owner@example.com', password: 'supersecret1' }),
})
console.log('login:', login.status, 'token?', Boolean((await j(login)).data?.token))

const bad = await req('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'owner@example.com', password: 'wrong-pass' }),
})
console.log('login(wrong pass):', bad.status, (await j(bad)).error?.code)

const nf = await req('/api/v1/nope')
const nfBody = await j(nf)
// Unknown /api/v1 paths reach app.notFound → 404 NOT_FOUND.
console.log('unknown /api/v1 path:', nf.status, nfBody.error?.code)
const nfOk = nf.status === 404 && nfBody.error?.code === 'NOT_FOUND'

let fails = 0
if (health.status !== 200) fails++
if (spec.status !== 200) fails++
if (reg.status !== 201) fails++
if (!token) fails++
if (me.status !== 200) fails++
if (login.status !== 200) fails++
if (bad.status !== 401) fails++
  if (!nfOk) fails++
console.log(fails === 0 ? 'SMOKE PASS: backend boots and serves real endpoints with memory repos' : ('SMOKE FAIL: ' + fails + ' checks failed'))
process.exit(fails === 0 ? 0 : 1)