import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import {
  publicSiteResponseSchema,
  siteConfigResponseSchema,
  updateSiteConfigSchema,
} from '../schemas/site-config-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createSiteConfigRouter() {
  const router = new Hono<AppEnv>()

  // Public site config
  router.get(
    '/public/sites/:slug',
    describeRoute({
      tags: ['Site Config (Public)'],
      summary: 'Get generated site config for a venue',
      responses: {
        200: { description: 'Site config', content: jsonContent(publicSiteResponseSchema) },
        404: { description: 'Site not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').siteConfigHandler.getPublic(c)
  )

  // Owner update
  router.patch(
    '/venues/:venue_id/site-config',
    describeRoute({
      tags: ['Site Config'],
      summary: 'Update site config',
      responses: {
        200: { description: 'Site config updated', content: jsonContent(siteConfigResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Site config not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', updateSiteConfigSchema),
    (c) => c.get('container').siteConfigHandler.update(c)
  )

  return router
}
