import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import { errorResponseSchema, idParamSchema } from '../schemas/common-schemas'
import { buffetListResponseSchema, buffetResponseSchema, createBuffetSchema } from '../schemas/buffet-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createBuffetRouter() {
  const router = new Hono<AppEnv>()
  router.get('/', describeRoute({ tags: ['Buffet'], summary: 'List a buffet session', responses: { 200: { description: 'Buffet bookings', content: jsonContent(buffetListResponseSchema) } } }), (c) => c.get('container').buffetHandler.list(c))
  router.use('/mine', authMiddleware)
  router.get('/mine', describeRoute({ tags: ['Buffet'], summary: 'List my buffet bookings', responses: { 200: { description: 'My buffet bookings', content: jsonContent(buffetListResponseSchema) } } }), (c) => c.get('container').buffetHandler.mine(c))
  router.post('/', describeRoute({ tags: ['Buffet'], summary: 'Create a buffet booking', responses: { 201: { description: 'Buffet booking created', content: jsonContent(buffetResponseSchema) }, 400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) } } }), authMiddleware, v('json', createBuffetSchema), (c) => c.get('container').buffetHandler.create(c))
  router.post('/:id/cancel', describeRoute({ tags: ['Buffet'], summary: 'Cancel a buffet booking', responses: { 200: { description: 'Buffet booking cancelled', content: jsonContent(buffetResponseSchema) } } }), authMiddleware, v('param', idParamSchema), (c) => c.get('container').buffetHandler.cancel(c))
  return router
}
