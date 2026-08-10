import { Hono } from 'hono'
import { describeRoute, resolver } from 'hono-openapi'
import { errorResponseSchema } from '../schemas/auth-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createDemoRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/seed',
    describeRoute({
      tags: ['Demo'],
      summary: 'Seed demo data',
      responses: {
        200: { description: 'Demo data seeded' },
        500: { description: 'Error', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').demoHandler.seed(c)
  )

  return router
}
