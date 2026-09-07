import type { Context } from 'hono'
import type { PaymentListQuery, VerifyPaymentInput } from '../domain/entities/payment'
import { ValidationError } from '../domain/errors'
import type { PaymentService } from '../services/payment-service'
import { getJsonBody, param } from './http-utils'

export class PaymentHandler {
  constructor(private readonly paymentService: PaymentService) {}

  uploadSlip = async (c: Context) => {
    const bookingId = param(c, 'booking_id')
    const body = await c.req.parseBody()
    const slip = body['slip']
    // For MVP, we store a placeholder URL; real R2 upload would be separate
    const slipImageUrl = typeof slip === 'string' ? slip : null
    if (!slipImageUrl) throw new ValidationError('slip image URL is required')

    const payment = await this.paymentService.createSlip(bookingId, slipImageUrl)
    return c.json({ data: payment }, 201)
  }

  list = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const query: PaymentListQuery = {
      status: c.req.query('status') ?? undefined,
      venueId: c.req.query('venue_id') ?? undefined,
    }
    const payments = await this.paymentService.listByOwner(query, ownerId)
    return c.json({ data: payments })
  }

  verify = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<VerifyPaymentInput>(c)
    const payment = await this.paymentService.verify(param(c, 'id'), body, ownerId)
    return c.json({ data: payment })
  }
}
