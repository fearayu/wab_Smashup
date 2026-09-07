import type { Context } from 'hono'
import type { BookingListQuery, CreateBookingInput, UpdateBookingInput } from '../domain/entities/booking'
import type { BookingService } from '../services/booking-service'
import { getJsonBody, param } from './http-utils'

function clampNumber(raw: string | null | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? '', 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

export class BookingHandler {
  constructor(private readonly bookingService: BookingService) {}

  createPublic = async (c: Context) => {
    const body = await getJsonBody<CreateBookingInput>(c)
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
      limit: clampNumber(c.req.query('limit'), 50, 1, 200),
      offset: clampNumber(c.req.query('offset'), 0, 0, Number.MAX_SAFE_INTEGER),
    }
    const result = await this.bookingService.listByOwner(query, ownerId)
    return c.json({ data: result })
  }

  get = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const booking = await this.bookingService.getById(param(c, 'id'), ownerId)
    return c.json({ data: booking })
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<UpdateBookingInput>(c)
    const booking = await this.bookingService.updateStatus(param(c, 'id'), body, ownerId)
    return c.json({ data: booking })
  }
}
