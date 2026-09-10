import { Scalar } from '@scalar/hono-api-reference'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { openAPIRouteHandler } from 'hono-openapi'
import type { Container } from './di/container'
import { AppError } from './domain/errors'
import { createApiRouter } from './routers'
import type { AppEnv, Bindings } from './types'

// Runtime-agnostic app factory. Each entrypoint (server.ts, lambda.ts)
// supplies its own container factory so the same routes/handlers run on
// Cloudflare Workers (D1 + KV) and AWS Lambda alike.
export function createApp(containerFactory: (env: Partial<Bindings>) => Container) {
  const app = new Hono<AppEnv>()

  app.use('*', logger())
  app.use('*', cors())
  app.use('*', async (c, next) => {
    c.set('container', containerFactory(c.env ?? {}))
    await next()
  })

  app.get('/health', (c) => c.json({ status: 'ok' }))

  // Public routes (no auth) — registered BEFORE the api router
  app.get('/api/v1/public/venues/:slug/slots', (c) => c.get('container').timeSlotHandler.listPublic(c))
  app.post('/api/v1/public/bookings', (c) => c.get('container').bookingHandler.createPublic(c))

  app.route('/api/v1', createApiRouter())

  // API docs: /docs renders the Scalar UI from the generated OpenAPI spec
  app.get(
    '/openapi.json',
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: 'Smashup API',
          version: '1.0.0',
          description: 'Badminton court booking platform API running on Cloudflare Workers (D1 + KV)',
        },
        tags: [
          { name: 'Users', description: 'User management' },
          { name: 'Auth', description: 'Owner authentication' },
          { name: 'Venues', description: 'Venue management' },
          { name: 'Courts', description: 'Court management' },
          { name: 'Slots', description: 'Time slot generation & management' },
          { name: 'Slots (Public)', description: 'Public slot availability' },
          { name: 'Bookings', description: 'Owner booking management' },
          { name: 'Bookings (Public)', description: 'Player booking creation' },
          { name: 'Payments', description: 'Payment slip upload & verification' },
          { name: 'Site Config', description: 'Owner site customization' },
          { name: 'Site Config (Public)', description: 'Public site configuration' },
          { name: 'Dashboard', description: 'Analytics & summary' },
          { name: 'Demo', description: 'Demo data seeding' },
        ],
      },
    })
  )
  app.get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'Smashup API Docs' }))

  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404))

  app.onError((err, c) => {
    if (err instanceof AppError) {
      const status = err.status as ContentfulStatusCode
      return c.json({ error: { code: err.code, message: err.message } }, status)
    }
    console.error('Unhandled error:', err)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500)
  })

  return app
}
