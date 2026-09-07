import type { Court, CreateCourtInput, UpdateCourtInput } from '../domain/entities/court'
import { ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { CourtRepository } from '../domain/repositories/court-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'

const CACHE_TTL = 300
const cacheKey = (id: string) => `court:${id}`

export class CourtService {
  constructor(
    private readonly courtRepository: CourtRepository,
    private readonly venueRepository: VenueRepository,
    private readonly cache: CacheRepository
  ) {}

  async listByVenue(venueId: string, ownerId?: string): Promise<Court[]> {
    if (ownerId) {
      const venue = await this.venueRepository.findById(venueId)
      if (!venue) throw new NotFoundError('Venue')
      if (venue.ownerId !== ownerId) throw new ForbiddenError()
    }
    return this.courtRepository.findAllByVenueId(venueId)
  }

  async getById(id: string, ownerId?: string): Promise<Court> {
    const cached = await this.cache.get<Court>(cacheKey(id))
    if (cached) {
      if (ownerId) await this.ensureOwnership(cached.venueId, ownerId)
      return cached
    }

    const court = await this.courtRepository.findById(id)
    if (!court) throw new NotFoundError('Court')
    if (ownerId) await this.ensureOwnership(court.venueId, ownerId)

    await this.cache.set(cacheKey(id), court, CACHE_TTL)
    return court
  }

  async create(venueId: string, input: CreateCourtInput, ownerId: string): Promise<Court> {
    await this.ensureOwnership(venueId, ownerId)
    if (!input.name?.trim()) throw new ValidationError('name is required')
    if (input.hourlyRate < 0 || input.hourlyRate > 10000) throw new ValidationError('hourlyRate must be 0-10000')

    return this.courtRepository.create({ ...input, venueId })
  }

  async update(id: string, input: UpdateCourtInput, ownerId: string): Promise<Court> {
    const existing = await this.getById(id, ownerId)
    if (input.hourlyRate !== undefined && (input.hourlyRate < 0 || input.hourlyRate > 10000)) {
      throw new ValidationError('hourlyRate must be 0-10000')
    }

    const updated = await this.courtRepository.update(id, input)
    if (!updated) throw new NotFoundError('Court')

    await this.cache.delete(cacheKey(id))
    return updated
  }

  async delete(id: string, ownerId: string): Promise<void> {
    await this.getById(id, ownerId)
    await this.courtRepository.softDelete(id)
    await this.cache.delete(cacheKey(id))
  }

  private async ensureOwnership(venueId: string, ownerId: string): Promise<void> {
    const venue = await this.venueRepository.findById(venueId)
    if (!venue) throw new NotFoundError('Venue')
    if (venue.ownerId !== ownerId) throw new ForbiddenError()
  }
}
