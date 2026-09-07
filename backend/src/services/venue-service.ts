import type { CreateVenueInput, UpdateVenueInput, Venue } from '../domain/entities/venue'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { SiteConfigRepository } from '../domain/repositories/site-config-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'

const CACHE_TTL = 300
const cacheKey = (id: string) => `venue:${id}`
const cacheKeySlug = (slug: string) => `venue:slug:${slug}`

export class VenueService {
  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly siteConfigRepository: SiteConfigRepository,
    private readonly cache: CacheRepository
  ) {}

  async listByOwner(ownerId: string): Promise<Venue[]> {
    return this.venueRepository.findAllByOwnerId(ownerId)
  }

  async getById(id: string, ownerId?: string): Promise<Venue> {
    const cached = await this.cache.get<Venue>(cacheKey(id))
    if (cached) {
      if (ownerId && cached.ownerId !== ownerId) throw new ForbiddenError()
      return cached
    }

    const venue = await this.venueRepository.findById(id)
    if (!venue) throw new NotFoundError('Venue')
    if (ownerId && venue.ownerId !== ownerId) throw new ForbiddenError()

    await this.cache.set(cacheKey(id), venue, CACHE_TTL)
    return venue
  }

  async getBySlug(slug: string): Promise<Venue> {
    const cached = await this.cache.get<Venue>(cacheKeySlug(slug))
    if (cached) return cached

    const venue = await this.venueRepository.findBySlug(slug)
    if (!venue) throw new NotFoundError('Venue')

    await this.cache.set(cacheKeySlug(slug), venue, CACHE_TTL)
    return venue
  }

  async create(input: CreateVenueInput, ownerId: string): Promise<Venue> {
    if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) {
      throw new ValidationError('slug must be lowercase letters, numbers, and hyphens only')
    }
    if (input.slug.length < 3 || input.slug.length > 30) {
      throw new ValidationError('slug must be 3-30 characters')
    }
    if (input.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(input.primaryColor)) {
      throw new ValidationError('primaryColor must be a valid hex color')
    }

    const existing = await this.venueRepository.findBySlug(input.slug)
    if (existing) throw new ConflictError('Slug is already taken')

    const venue = await this.venueRepository.create({ ...input, ownerId })
    await this.siteConfigRepository.createDefault(venue.id)
    return venue
  }

  async update(id: string, input: UpdateVenueInput, ownerId: string): Promise<Venue> {
    const existing = await this.getById(id, ownerId)
    if (input.slug && input.slug !== existing.slug) {
      const taken = await this.venueRepository.findBySlug(input.slug)
      if (taken) throw new ConflictError('Slug is already taken')
    }

    const updated = await this.venueRepository.update(id, input)
    if (!updated) throw new NotFoundError('Venue')

    await this.cache.delete(cacheKey(id))
    await this.cache.delete(cacheKeySlug(existing.slug))
    return updated
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const existing = await this.getById(id, ownerId)
    await this.venueRepository.softDelete(id)
    await this.cache.delete(cacheKey(id))
    await this.cache.delete(cacheKeySlug(existing.slug))
  }
}
