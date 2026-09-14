import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createAuthRouter } from './auth-router'
import { createBookingRouter } from './booking-router'
import { createCourtRouter } from './court-router'
import { createDashboardRouter } from './dashboard-router'
import { createDemoRouter } from './demo-router'
import { createNotificationRouter } from './notification-router'
import { createPaymentRouter } from './payment-router'
import { createSiteConfigRouter } from './site-config-router'
import { createSlotRouter } from './slot-router'
import { createUserRouter, createProfileRouter } from './user-router'
import { createVenueRouter } from './venue-router'
import { createAppointmentRouter } from './appointment-router'
import { createMatchmakingRouter } from './matchmaking-router'
import { createTournamentRouter } from './tournament-router'
import { createBuffetRouter } from './buffet-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())
  api.route('/auth', createAuthRouter())
  api.route('/profiles', createProfileRouter())
  api.route('/venues', createVenueRouter())
  api.route('/', createCourtRouter())
  api.route('/', createSlotRouter())
  api.route('/', createBookingRouter())
  api.route('/', createPaymentRouter())
  api.route('/', createSiteConfigRouter())
  api.route('/dashboard', createDashboardRouter())
  api.route('/notifications', createNotificationRouter())
  api.route('/appointments', createAppointmentRouter())
  api.route('/matchmaking', createMatchmakingRouter())
  api.route('/tournaments', createTournamentRouter())
  api.route('/buffet-bookings', createBuffetRouter())
  api.route('/demo', createDemoRouter())

  return api
}
