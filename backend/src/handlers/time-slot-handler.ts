import type { Context } from 'hono'
import type { GenerateSlotsInput, UpdateSlotInput } from '../domain/entities/time-slot'
import { ValidationError } from '../domain/errors'
import type { TimeSlotService } from '../services/time-slot-service'

export class TimeSlotHandler {
  constructor(
    private readonly timeSlotService: TimeSlotService,
    private readonly courtService: any // for public listing
  ) {}

  listPublic = async (c: Context) => {
    const slug = c.req.param('slug')
    const date = c.req.query('date')
    if (!date) throw new ValidationError('date query parameter is required')

    const venue = await this.courtService.venueRepository.findBySlug(slug)
    if (!venue) throw new ValidationError('Venue not found')

    const courts = await this.courtService.listByVenue(venue.id)
    const result = []
    for (const court of courts) {
      const slots = await this.timeSlotService.listByCourtAndDate(court.id, date)
      result.push({
        id: court.id,
        name: court.name,
        slots: slots.map((s) => ({
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
    const body = await this.parseJson<GenerateSlotsInput>(c)
    const inserted = await this.timeSlotService.generate(this.param(c, 'venue_id'), body, ownerId)
    return c.json({ data: { inserted } })
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await this.parseJson<UpdateSlotInput>(c)
    const slot = await this.timeSlotService.update(this.param(c, 'id'), body, ownerId)
    return c.json({ data: slot })
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
