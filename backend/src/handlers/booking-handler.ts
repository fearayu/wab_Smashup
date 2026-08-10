import type { Context } from 'hono'
import type { BookingListQuery, CreateBookingInput, UpdateBookingInput } from '../domain/entities/booking'
import { ValidationError } from '../domain/errors'
import type { BookingService } from '../services/booking-service'

export class BookingHandler {
  constructor(private readonly bookingService: BookingService) {}

  createPublic = async (c: Context) => {
    const body = await this.parseJson<CreateBookingInput>(c)
    const { booking, paymentId } = await this.bookingService.createPublic(body)
    return c.json({
      data: {
        id: booking.id,
        venueId: booking.venueId,
        courtId: booking.courtId,
        timeSlotIds: booking.timeSlotIds,
        playerName: booking.playerName,
        playerPhone: booking.playerPhone,
        status: booking.status,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
        payment: {
          id: paymentId,
          amount: booking.totalAmount,
          status: 'pending',
          uploadUrl: null,
        },
      },
    }, 201)
  }

  list = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const query: BookingListQuery = {
      venueId: c.req.query('venue_id') ?? undefined,
      status: c.req.query('status') ?? undefined,
      dateFrom: c.req.query('date_from') ?? undefined,
      dateTo: c.req.query('date_to') ?? undefined,
      limit: parseInt(c.req.query('limit') ?? '50', 10),
      offset: parseInt(c.req.query('offset') ?? '0', 10),
    }
    const result = await this.bookingService.listByOwner(query, ownerId)
    return c.json({ data: result })
  }

  get = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const booking = await this.bookingService.getById(this.param(c, 'id'), ownerId)
    return c.json({ data: booking })
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await this.parseJson<UpdateBookingInput>(c)
    const booking = await this.bookingService.updateStatus(this.param(c, 'id'), body, ownerId)
    return c.json({ data: booking })
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
