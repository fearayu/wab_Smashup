import type { SiteConfig, UpdateSiteConfigInput } from '../../domain/entities/site-config'
import type { SiteConfigRepository } from '../../domain/repositories/site-config-repository'

export class MemorySiteConfigRepository implements SiteConfigRepository {
  private readonly configs = new Map<string, SiteConfig>()
  private readonly venues = new Map<string, { id: string; name: string; slug: string; primaryColor: string; ownerId: string }>()
  private readonly courts = new Map<string, { id: string; venueId: string; name: string; type: string; hourlyRate: number; isActive: boolean }>()

  async findByVenueId(venueId: string): Promise<SiteConfig | null> {
    return [...this.configs.values()].find((c) => c.venueId === venueId) ?? null
  }

  async findBySlug(slug: string): Promise<{ venue: { id: string; name: string; slug: string; primaryColor: string }; courts: { id: string; name: string; type: string; hourlyRate: number; isActive: boolean }[]; config: SiteConfig | null } | null> {
    const venue = [...this.venues.values()].find((v) => v.slug === slug)
    if (!venue) return null
    const courts = [...this.courts.values()].filter((c) => c.venueId === venue.id && c.isActive)
    const config = await this.findByVenueId(venue.id)
    return { venue, courts, config }
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

  // Helpers for demo
  setVenue(v: { id: string; name: string; slug: string; primaryColor: string; ownerId: string }) { this.venues.set(v.id, v) }
  setCourt(c: { id: string; venueId: string; name: string; type: string; hourlyRate: number; isActive: boolean }) { this.courts.set(c.id, c) }
}
