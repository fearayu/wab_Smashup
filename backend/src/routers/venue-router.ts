import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import {
  createVenueSchema,
  updateVenueSchema,
  venueListResponseSchema,
  venueResponseSchema,
} from '../schemas/venue-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createVenueRouter() {
  const router = new Hono<AppEnv>()

  router.use('*', authMiddleware)

  router.get(
    '/',
    describeRoute({
      tags: ['Venues'],
      summary: 'List owner venues',
      responses: {
        200: { description: 'Venues list', content: jsonContent(venueListResponseSchema) },
      },
    }),
    (c) => c.get('container').venueHandler.list(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Venues'],
      summary: 'Create a venue',
      responses: {
        201: { description: 'Venue created', content: jsonContent(venueResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        409: { description: 'Slug taken', content: jsonContent(errorResponseSchema) },
      },
    }),
    v('json', createVenueSchema),
    (c) => c.get('container').venueHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Venues'],
      summary: 'Get a venue',
      responses: {
        200: { description: 'Venue found', content: jsonContent(venueResponseSchema) },
        404: { description: 'Venue not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').venueHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Venues'],
      summary: 'Update a venue',
      responses: {
        200: { description: 'Venue updated', content: jsonContent(venueResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Venue not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    v('json', updateVenueSchema),
    (c) => c.get('container').venueHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Venues'],
      summary: 'Delete a venue',
      responses: {
        204: { description: 'Venue deleted' },
        404: { description: 'Venue not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').venueHandler.delete(c)
  )

  return router
}
