import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import {
  paymentListResponseSchema,
  paymentResponseSchema,
  verifyPaymentSchema,
} from '../schemas/payment-schemas'
import { errorResponseSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createPaymentRouter() {
  const router = new Hono<AppEnv>()

  router.post(
    '/payments/:booking_id/slip',
    describeRoute({
      tags: ['Payments'],
      summary: 'Upload payment slip',
      responses: {
        201: { description: 'Slip uploaded', content: jsonContent(paymentResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Booking not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').paymentHandler.uploadSlip(c)
  )

  router.get(
    '/payments',
    describeRoute({
      tags: ['Payments'],
      summary: 'List payments for owner',
      responses: {
        200: { description: 'Payments list', content: jsonContent(paymentListResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').paymentHandler.list(c)
  )

  router.patch(
    '/payments/:id/verify',
    describeRoute({
      tags: ['Payments'],
      summary: 'Verify or reject a payment',
      responses: {
        200: { description: 'Payment verified', content: jsonContent(paymentResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Payment not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    validator('json', verifyPaymentSchema),
    (c) => c.get('container').paymentHandler.verify(c)
  )

  return router
}
