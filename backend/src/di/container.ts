import type { BookingRepository } from '../domain/repositories/booking-repository'
import type { AppointmentRepository } from '../domain/repositories/appointment-repository'
import type { BuffetRepository } from '../domain/repositories/buffet-repository'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { CourtRepository } from '../domain/repositories/court-repository'
import type { DashboardRepository } from '../domain/repositories/dashboard-repository'
import type { NotificationRepository } from '../domain/repositories/notification-repository'
import type { OwnerRepository } from '../domain/repositories/owner-repository'
import type { PaymentRepository } from '../domain/repositories/payment-repository'
import type { SiteConfigRepository } from '../domain/repositories/site-config-repository'
import type { TimeSlotRepository } from '../domain/repositories/time-slot-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'
import type { MatchmakingRepository } from '../domain/repositories/matchmaking-repository'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'
import { AppointmentHandler } from '../handlers/appointment-handler'
import { AuthHandler } from '../handlers/auth-handler'
import { BookingHandler } from '../handlers/booking-handler'
import { CourtHandler } from '../handlers/court-handler'
import { DashboardHandler } from '../handlers/dashboard-handler'
import { DemoHandler } from '../handlers/demo-handler'
import { NotificationHandler } from '../handlers/notification-handler'
import { PaymentHandler } from '../handlers/payment-handler'
import { SiteConfigHandler } from '../handlers/site-config-handler'
import { TimeSlotHandler } from '../handlers/time-slot-handler'
import { UserHandler } from '../handlers/user-handler'
import { VenueHandler } from '../handlers/venue-handler'
import { MatchmakingHandler } from '../handlers/matchmaking-handler'
import { TournamentHandler } from '../handlers/tournament-handler'
import { BuffetHandler } from '../handlers/buffet-handler'
import { AuthService } from '../services/auth-service'
import { BookingService } from '../services/booking-service'
import { CourtService } from '../services/court-service'
import { DashboardService } from '../services/dashboard-service'
import { NotificationService } from '../services/notification-service'
import { PaymentService } from '../services/payment-service'
import { SiteConfigService } from '../services/site-config-service'
import { TimeSlotService } from '../services/time-slot-service'
import { UserService } from '../services/user-service'
import { VenueService } from '../services/venue-service'
import { AppointmentService } from '../services/appointment-service'
import { MatchmakingService } from '../services/matchmaking-service'
import { TournamentService } from '../services/tournament-service'
import { BuffetService } from '../services/buffet-service'

export interface Repositories {
  appointmentRepository: AppointmentRepository
  buffetRepository: BuffetRepository
  userRepository: UserRepository
  ownerRepository: OwnerRepository
  venueRepository: VenueRepository
  courtRepository: CourtRepository
  timeSlotRepository: TimeSlotRepository
  bookingRepository: BookingRepository
  paymentRepository: PaymentRepository
  siteConfigRepository: SiteConfigRepository
  dashboardRepository: DashboardRepository
  notificationRepository: NotificationRepository
  cacheRepository: CacheRepository
  matchmakingRepository: MatchmakingRepository
  tournamentRepository: TournamentRepository
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
  notificationHandler: NotificationHandler
  demoHandler: DemoHandler
  appointmentHandler: AppointmentHandler
  matchmakingHandler: MatchmakingHandler
  tournamentHandler: TournamentHandler
  buffetHandler: BuffetHandler
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
  const notificationService = new NotificationService(repos.notificationRepository)
  const appointmentService = new AppointmentService(repos.appointmentRepository, repos.userRepository)
  const matchmakingService = new MatchmakingService(repos.matchmakingRepository)
  const tournamentService = new TournamentService(repos.tournamentRepository)
  const buffetService = new BuffetService(repos.buffetRepository)

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
    notificationHandler: new NotificationHandler(notificationService),
    demoHandler: new DemoHandler(db),
    appointmentHandler: new AppointmentHandler(appointmentService),
    matchmakingHandler: new MatchmakingHandler(matchmakingService),
    tournamentHandler: new TournamentHandler(tournamentService),
    buffetHandler: new BuffetHandler(buffetService),
  }
}
