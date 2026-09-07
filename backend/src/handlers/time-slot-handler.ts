import type { Context } from 'hono'
import type { GenerateSlotsInput, TimeSlot, UpdateSlotInput } from '../domain/entities/time-slot'
import { ValidationError } from '../domain/errors'
import type { CourtService } from '../services/court-service'
import type { TimeSlotService } from '../services/time-slot-service'
import type { VenueService } from '../services/venue-service'
import { getJsonBody, param } from './http-utils'

interface PublicSlot {
  id: string
  slotTime: string
  durationMinutes: number
  price: number
  isAvailable: boolean
  isPeak: boolean
}

interface PublicCourt {
  id: string
  name: string
  slots: PublicSlot[]
}

export class TimeSlotHandler {
  constructor(
    private readonly timeSlotService: TimeSlotService,
    private readonly courtService: CourtService,
    private readonly venueService: VenueService
  ) {}

  listPublic = async (c: Context) => {
    const slug = c.req.param('slug')
    if (!slug) throw new ValidationError('slug param is required')
    const date = c.req.query('date')
    if (!date) throw new ValidationError('date query parameter is required')

    const venue = await this.venueService.getBySlug(slug)

    const courts = await this.courtService.listByVenue(venue.id)
    const result: PublicCourt[] = []
    for (const court of courts) {
      const slots = await this.timeSlotService.listByCourtAndDate(court.id, date)
      result.push({
        id: court.id,
        name: court.name,
        slots: slots.map((s: TimeSlot) => ({
          id: s.id,
          slotTime: s.slotTime,
          durationMinutes: s.durationMinutes,
          price: s.price,
          isAvailable: s.isAvailable,
          isPeak: s.isPeak,
        })),
      })
    }

    return c.json({
      data: {
        venue: {
          id: venue.id,
          name: venue.name,
          slug: venue.slug,
          primaryColor: venue.primaryColor,
        },
        courts: result,
      },
    })
  }

  generate = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<GenerateSlotsInput>(c)
    const inserted = await this.timeSlotService.generate(param(c, 'venue_id'), body, ownerId)
    return c.json({ data: { inserted } })
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<UpdateSlotInput>(c)
    const slot = await this.timeSlotService.update(param(c, 'id'), body, ownerId)
    return c.json({ data: slot })
  }
}
