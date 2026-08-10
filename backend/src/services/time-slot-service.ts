import type { GenerateSlotsInput, TimeSlot, UpdateSlotInput } from '../domain/entities/time-slot'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { CourtRepository } from '../domain/repositories/court-repository'
import type { TimeSlotRepository } from '../domain/repositories/time-slot-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'

const CACHE_TTL = 60
const cacheKey = (courtId: string, date: string) => `slots:${courtId}:${date}`

export class TimeSlotService {
  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly courtRepository: CourtRepository,
    private readonly venueRepository: VenueRepository,
    private readonly cache: CacheRepository
  ) {}

  async listByCourtAndDate(courtId: string, slotDate: string, ownerId?: string): Promise<TimeSlot[]> {
    if (ownerId) {
      const court = await this.courtRepository.findById(courtId)
      if (!court) throw new NotFoundError('Court')
      const venue = await this.venueRepository.findById(court.venueId)
      if (!venue || venue.ownerId !== ownerId) throw new ForbiddenError()
    }

    const cached = await this.cache.get<TimeSlot[]>(cacheKey(courtId, slotDate))
    if (cached) return cached

    const slots = await this.timeSlotRepository.findAllByCourtAndDate(courtId, slotDate)
    await this.cache.set(cacheKey(courtId, slotDate), slots, CACHE_TTL)
    return slots
  }

  async generate(venueId: string, input: GenerateSlotsInput, ownerId: string): Promise<number> {
    const venue = await this.venueRepository.findById(venueId)
    if (!venue) throw new NotFoundError('Venue')
    if (venue.ownerId !== ownerId) throw new ForbiddenError()

    if (input.startDate > input.endDate) throw new ValidationError('startDate must be before endDate')
    if (input.openTime >= input.closeTime) throw new ValidationError('openTime must be before closeTime')

    const inserted = await this.timeSlotRepository.generateSlots(venueId, input)
    return inserted
  }

  async update(id: string, input: UpdateSlotInput, ownerId: string): Promise<TimeSlot> {
    const slot = await this.timeSlotRepository.findById(id)
    if (!slot) throw new NotFoundError('Time slot')

    const court = await this.courtRepository.findById(slot.courtId)
    if (!court) throw new NotFoundError('Court')
    const venue = await this.venueRepository.findById(court.venueId)
    if (!venue || venue.ownerId !== ownerId) throw new ForbiddenError()

    const updated = await this.timeSlotRepository.update(id, input)
    if (!updated) throw new NotFoundError('Time slot')

    await this.cache.delete(cacheKey(slot.courtId, slot.slotDate))
    return updated
  }
}
