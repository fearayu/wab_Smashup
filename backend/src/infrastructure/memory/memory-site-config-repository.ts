import type { SiteConfig, UpdateSiteConfigInput } from '../../domain/entities/site-config'
import type { SiteConfigRepository } from '../../domain/repositories/site-config-repository'
import type { VenueRepository } from '../../domain/repositories/venue-repository'
import type { CourtRepository } from '../../domain/repositories/court-repository'

export class MemorySiteConfigRepository implements SiteConfigRepository {
  private readonly configs = new Map<string, SiteConfig>()
  private venueRepository: VenueRepository | null = null
  private courtRepository: CourtRepository | null = null

  setVenueRepository(repo: VenueRepository) { this.venueRepository = repo }
  setCourtRepository(repo: CourtRepository) { this.courtRepository = repo }

  async findByVenueId(venueId: string): Promise<SiteConfig | null> {
    return [...this.configs.values()].find((c) => c.venueId === venueId) ?? null
  }

  async findBySlug(slug: string): Promise<{ venue: { id: string; name: string; slug: string; primaryColor: string }; courts: { id: string; name: string; type: string; hourlyRate: number; isActive: boolean }[]; config: SiteConfig | null } | null> {
    if (!this.venueRepository || !this.courtRepository) return null

    const venue = await this.venueRepository.findBySlug(slug)
    if (!venue) return null

    const courts = await this.courtRepository.findAllByVenueId(venue.id)
    const config = await this.findByVenueId(venue.id)

    return {
      venue: { id: venue.id, name: venue.name, slug: venue.slug, primaryColor: venue.primaryColor },
      courts: courts.filter(c => c.isActive).map(c => ({ id: c.id, name: c.name, type: c.type, hourlyRate: c.hourlyRate, isActive: c.isActive })),
      config,
    }
  }

  async createDefault(venueId: string): Promise<SiteConfig> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const config: SiteConfig = {
      id,
      venueId,
      theme: 'default',
      heroImageUrl: null,
      welcomeMessage: null,
      showPricing: true,
      showMap: true,
      customCss: null,
      socialLinks: null,
      createdAt: now,
      updatedAt: now,
    }
    this.configs.set(id, config)
    return config
  }

  async update(venueId: string, input: UpdateSiteConfigInput): Promise<SiteConfig | null> {
    const existing = await this.findByVenueId(venueId)
    if (!existing) return null
    const updated: SiteConfig = { ...existing, ...input, updatedAt: new Date().toISOString() }
    if (input.socialLinks !== undefined) updated.socialLinks = input.socialLinks
    this.configs.set(existing.id, updated)
    return updated
  }
}
