// AWS Lambda entrypoint (bundled by `npm run build:lambda`).
// Lambda has no D1/KV bindings, so in-memory repositories are wired in here.
// Replace with DynamoDB/RDS/ElastiCache implementations for production use.
import { handle } from 'hono/aws-lambda'
import { createApp } from './app'
import { createContainer } from './di/container'
import { MemoryBookingRepository } from './infrastructure/memory/memory-booking-repository'
import { MemoryCacheRepository } from './infrastructure/memory/memory-cache-repository'
import { MemoryCourtRepository } from './infrastructure/memory/memory-court-repository'
import { MemoryDashboardRepository } from './infrastructure/memory/memory-dashboard-repository'
import { MemoryOwnerRepository } from './infrastructure/memory/memory-owner-repository'
import { MemoryPaymentRepository } from './infrastructure/memory/memory-payment-repository'
import { MemorySiteConfigRepository } from './infrastructure/memory/memory-site-config-repository'
import { MemoryTimeSlotRepository } from './infrastructure/memory/memory-time-slot-repository'
import { MemoryUserRepository } from './infrastructure/memory/memory-user-repository'
import { MemoryVenueRepository } from './infrastructure/memory/memory-venue-repository'

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
})

const app = createApp(() => container)

export const handler = handle(app)
