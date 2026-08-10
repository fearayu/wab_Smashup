import type { SiteConfig, UpdateSiteConfigInput } from '../domain/entities/site-config'
import { ForbiddenError, NotFoundError } from '../domain/errors'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { SiteConfigRepository } from '../domain/repositories/site-config-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'

const CACHE_TTL = 300
const cacheKey = (slug: string) => `site:${slug}`

export class SiteConfigService {
  constructor(
    private readonly siteConfigRepository: SiteConfigRepository,
    private readonly venueRepository: VenueRepository,
    private readonly cache: CacheRepository
  ) {}

  async getBySlug(slug: string): Promise<{ venue: { id: string; name: string; slug: string; primaryColor: string }; courts: { id: string; name: string; type: string; hourlyRate: number; isActive: boolean }[]; config: SiteConfig | null }> {
    const cached = await this.cache.get<{ venue: { id: string; name: string; slug: string; primaryColor: string }; courts: { id: string; name: string; type: string; hourlyRate: number; isActive: boolean }[]; config: SiteConfig | null }>(cacheKey(slug))
    if (cached) return cached

    const result = await this.siteConfigRepository.findBySlug(slug)
    if (!result) throw new NotFoundError('Site')

    await this.cache.set(cacheKey(slug), result, CACHE_TTL)
    return result
  }

  async update(venueId: string, input: UpdateSiteConfigInput, ownerId: string): Promise<SiteConfig> {
    const venue = await this.venueRepository.findById(venueId)
    if (!venue) throw new NotFoundError('Venue')
    if (venue.ownerId !== ownerId) throw new ForbiddenError()

    const updated = await this.siteConfigRepository.update(venueId, input)
    if (!updated) throw new NotFoundError('Site config')

    await this.cache.delete(cacheKey(venue.slug))
    return updated
  }
}
