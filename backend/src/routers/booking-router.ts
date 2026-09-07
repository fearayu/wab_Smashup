import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import {
  bookingListQuerySchema,
  bookingListResponseSchema,
  bookingResponseSchema,
  createBookingSchema,
  publicBookingResponseSchema,
  updateBookingSchema,
} from '../schemas/booking-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createBookingRouter() {
  const router = new Hono<AppEnv>()

  // Public booking creation
  router.post(
    '/public/bookings',
    describeRoute({
      tags: ['Bookings (Public)'],
      summary: 'Create a booking from player site',
      responses: {
        201: { description: 'Booking created', content: jsonContent(publicBookingResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        409: { description: 'Slots no longer available', content: jsonContent(errorResponseSchema) },
      },
    }),
    v('json', createBookingSchema),
    (c) => c.get('container').bookingHandler.createPublic(c)
  )

  // Owner-only booking management
  router.get(
    '/bookings',
    describeRoute({
      tags: ['Bookings'],
      summary: 'List bookings for owner',
      responses: {
        200: { description: 'Bookings list', content: jsonContent(bookingListResponseSchema) },
      },
    }),
    authMiddleware,
    v('query', bookingListQuerySchema),
    (c) => c.get('container').bookingHandler.list(c)
  )

  router.get(
    '/bookings/:id',
    describeRoute({
      tags: ['Bookings'],
      summary: 'Get a booking',
      responses: {
        200: { description: 'Booking found', content: jsonContent(bookingResponseSchema) },
        404: { description: 'Booking not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').bookingHandler.get(c)
  )

  router.patch(
    '/bookings/:id',
    describeRoute({
      tags: ['Bookings'],
      summary: 'Update booking status',
      responses: {
        200: { description: 'Booking updated', content: jsonContent(bookingResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Booking not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', updateBookingSchema),
    (c) => c.get('container').bookingHandler.update(c)
  )

  return router
}
