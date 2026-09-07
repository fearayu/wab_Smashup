import type { BookingRepository } from '../domain/repositories/booking-repository'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { CourtRepository } from '../domain/repositories/court-repository'
import type { DashboardRepository } from '../domain/repositories/dashboard-repository'
import type { OwnerRepository } from '../domain/repositories/owner-repository'
import type { PaymentRepository } from '../domain/repositories/payment-repository'
import type { SiteConfigRepository } from '../domain/repositories/site-config-repository'
import type { TimeSlotRepository } from '../domain/repositories/time-slot-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'
import { AuthHandler } from '../handlers/auth-handler'
import { BookingHandler } from '../handlers/booking-handler'
import { CourtHandler } from '../handlers/court-handler'
import { DashboardHandler } from '../handlers/dashboard-handler'
import { DemoHandler } from '../handlers/demo-handler'
import { PaymentHandler } from '../handlers/payment-handler'
import { SiteConfigHandler } from '../handlers/site-config-handler'
import { TimeSlotHandler } from '../handlers/time-slot-handler'
import { UserHandler } from '../handlers/user-handler'
import { VenueHandler } from '../handlers/venue-handler'
import { AuthService } from '../services/auth-service'
import { BookingService } from '../services/booking-service'
import { CourtService } from '../services/court-service'
import { DashboardService } from '../services/dashboard-service'
import { PaymentService } from '../services/payment-service'
import { SiteConfigService } from '../services/site-config-service'
import { TimeSlotService } from '../services/time-slot-service'
import { UserService } from '../services/user-service'
import { VenueService } from '../services/venue-service'

export interface Repositories {
  userRepository: UserRepository
  ownerRepository: OwnerRepository
  venueRepository: VenueRepository
  courtRepository: CourtRepository
  timeSlotRepository: TimeSlotRepository
  bookingRepository: BookingRepository
  paymentRepository: PaymentRepository
  siteConfigRepository: SiteConfigRepository
  dashboardRepository: DashboardRepository
  cacheRepository: CacheRepository
}

export interface Container {
  userHandler: UserHandler
  authHandler: AuthHandler
  venueHandler: VenueHandler
  courtHandler: CourtHandler
  timeSlotHandler: TimeSlotHandler
  bookingHandler: BookingHandler
  paymentHandler: PaymentHandler
  siteConfigHandler: SiteConfigHandler
  dashboardHandler: DashboardHandler
  demoHandler: DemoHandler
}

export function createContainer(repos: Repositories, jwtSecret: string, db?: D1Database): Container {
  const userService = new UserService(repos.userRepository, repos.cacheRepository)
  const authService = new AuthService(repos.ownerRepository, jwtSecret)
  const venueService = new VenueService(repos.venueRepository, repos.siteConfigRepository, repos.cacheRepository)
  const courtService = new CourtService(repos.courtRepository, repos.venueRepository, repos.cacheRepository)
  const timeSlotService = new TimeSlotService(
    repos.timeSlotRepository,
    repos.courtRepository,
    repos.venueRepository,
    repos.cacheRepository
  )
  const bookingService = new BookingService(
    repos.bookingRepository,
    repos.timeSlotRepository,
    repos.courtRepository,
    repos.venueRepository,
    repos.paymentRepository,
    repos.cacheRepository
  )
  const paymentService = new PaymentService(
    repos.paymentRepository,
    repos.bookingRepository,
    repos.venueRepository,
    repos.timeSlotRepository,
    repos.cacheRepository
  )
  const siteConfigService = new SiteConfigService(repos.siteConfigRepository, repos.venueRepository, repos.cacheRepository)
  const dashboardService = new DashboardService(repos.dashboardRepository)

  return {
    userHandler: new UserHandler(userService),
    authHandler: new AuthHandler(authService),
    venueHandler: new VenueHandler(venueService),
    courtHandler: new CourtHandler(courtService),
    timeSlotHandler: new TimeSlotHandler(timeSlotService, courtService, venueService),
    bookingHandler: new BookingHandler(bookingService),
    paymentHandler: new PaymentHandler(paymentService),
    siteConfigHandler: new SiteConfigHandler(siteConfigService),
    dashboardHandler: new DashboardHandler(dashboardService),
    demoHandler: new DemoHandler(db),
  }
}
