import { Hono } from 'hono'
import { describeRoute, resolver } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import { dashboardSummarySchema } from '../schemas/dashboard-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createDashboardRouter() {
  const router = new Hono<AppEnv>()

  router.use('*', authMiddleware)

  router.get(
    '/summary',
    describeRoute({
      tags: ['Dashboard'],
      summary: 'Get dashboard summary',
      responses: {
        200: { description: 'Dashboard summary', content: jsonContent(dashboardSummarySchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').dashboardHandler.summary(c)
  )

  return router
}
