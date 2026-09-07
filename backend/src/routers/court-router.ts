import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import {
  courtListResponseSchema,
  courtResponseSchema,
  createCourtSchema,
  updateCourtSchema,
} from '../schemas/court-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createCourtRouter() {
  const router = new Hono<AppEnv>()

  router.use('*', authMiddleware)

  router.get(
    '/venues/:venue_id/courts',
    describeRoute({
      tags: ['Courts'],
      summary: 'List courts for a venue',
      responses: {
        200: { description: 'Courts list', content: jsonContent(courtListResponseSchema) },
      },
    }),
    (c) => c.get('container').courtHandler.listByVenue(c)
  )

  router.post(
    '/venues/:venue_id/courts',
    describeRoute({
      tags: ['Courts'],
      summary: 'Create a court',
      responses: {
        201: { description: 'Court created', content: jsonContent(courtResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    v('json', createCourtSchema),
    (c) => c.get('container').courtHandler.create(c)
  )

  router.patch(
    '/courts/:id',
    describeRoute({
      tags: ['Courts'],
      summary: 'Update a court',
      responses: {
        200: { description: 'Court updated', content: jsonContent(courtResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Court not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    v('json', updateCourtSchema),
    (c) => c.get('container').courtHandler.update(c)
  )

  router.delete(
    '/courts/:id',
    describeRoute({
      tags: ['Courts'],
      summary: 'Delete a court',
      responses: {
        204: { description: 'Court deleted' },
        404: { description: 'Court not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').courtHandler.delete(c)
  )

  return router
}
