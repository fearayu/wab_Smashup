import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent } from './route-utils'

export function createDemoRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/seed',
    describeRoute({
      tags: ['Demo'],
      summary: 'Seed demo data (disabled in production)',
      responses: {
        200: { description: 'Demo data seeded' },
        404: { description: 'Disabled in production', content: jsonContent(errorResponseSchema) },
        500: { description: 'Error', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => {
      if (c.env.ENVIRONMENT === 'production') {
        return c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
      }
      return c.get('container').demoHandler.seed(c)
    }
  )

  return router
}
