// Cloudflare Workers entrypoint (referenced by wrangler.jsonc "main").
// Wires D1 + KV implementations into the runtime-agnostic app.
import { createApp } from './app'
import { createContainer } from './di/container'
import { D1BookingRepository } from './infrastructure/d1/d1-booking-repository'
import { D1CourtRepository } from './infrastructure/d1/d1-court-repository'
import { D1DashboardRepository } from './infrastructure/d1/d1-dashboard-repository'
import { D1OwnerRepository } from './infrastructure/d1/d1-owner-repository'
import { D1PaymentRepository } from './infrastructure/d1/d1-payment-repository'
import { D1SiteConfigRepository } from './infrastructure/d1/d1-site-config-repository'
import { D1TimeSlotRepository } from './infrastructure/d1/d1-time-slot-repository'
import { D1UserRepository } from './infrastructure/d1/d1-user-repository'
import { D1VenueRepository } from './infrastructure/d1/d1-venue-repository'
import { KVCacheRepository } from './infrastructure/kv/kv-cache-repository'
import type { Bindings } from './types'

const app = createApp((env) => {
  const bindings = env as Bindings
  const db = bindings.DB
  return createContainer({
    userRepository: new D1UserRepository(db),
    ownerRepository: new D1OwnerRepository(db),
    venueRepository: new D1VenueRepository(db),
    courtRepository: new D1CourtRepository(db),
    timeSlotRepository: new D1TimeSlotRepository(db),
    bookingRepository: new D1BookingRepository(db),
    paymentRepository: new D1PaymentRepository(db),
    siteConfigRepository: new D1SiteConfigRepository(db),
    dashboardRepository: new D1DashboardRepository(db),
    cacheRepository: new KVCacheRepository(bindings.KV),
  })
})

export default app
