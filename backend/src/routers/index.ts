import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createAuthRouter } from './auth-router'
import { createBookingRouter } from './booking-router'
import { createCourtRouter } from './court-router'
import { createDashboardRouter } from './dashboard-router'
import { createDemoRouter } from './demo-router'
import { createPaymentRouter } from './payment-router'
import { createSiteConfigRouter } from './site-config-router'
import { createSlotRouter } from './slot-router'
import { createUserRouter } from './user-router'
import { createVenueRouter } from './venue-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())
  api.route('/auth', createAuthRouter())
  api.route('/venues', createVenueRouter())
  api.route('/', createCourtRouter())
  api.route('/', createSlotRouter())
  api.route('/', createBookingRouter())
  api.route('/', createPaymentRouter())
  api.route('/', createSiteConfigRouter())
  api.route('/dashboard', createDashboardRouter())
  api.route('/demo', createDemoRouter())

  return api
}
