import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import {
  generateSlotsResponseSchema,
  generateSlotsSchema,
  publicSlotsResponseSchema,
  slotResponseSchema,
} from '../schemas/slot-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createSlotRouter() {
  const router = new Hono<AppEnv>()

  // Public slot listing — no auth
  router.get(
    '/public/venues/:slug/slots',
    describeRoute({
      tags: ['Slots (Public)'],
      summary: 'Get available slots for a venue',
      responses: {
        200: { description: 'Slots for venue', content: jsonContent(publicSlotsResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').timeSlotHandler.listPublic(c)
  )

  // Owner-only slot generation
  router.post(
    '/venues/:venue_id/slots/generate',
    describeRoute({
      tags: ['Slots'],
      summary: 'Generate time slots for a date range',
      responses: {
        200: { description: 'Slots generated', content: jsonContent(generateSlotsResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        403: { description: 'Forbidden', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', generateSlotsSchema),
    (c) => c.get('container').timeSlotHandler.generate(c)
  )

  // Owner-only slot update
  router.patch(
    '/slots/:id',
    describeRoute({
      tags: ['Slots'],
      summary: 'Update a time slot',
      responses: {
        200: { description: 'Slot updated', content: jsonContent(slotResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Slot not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').timeSlotHandler.update(c)
  )

  return router
}
