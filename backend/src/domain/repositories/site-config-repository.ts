import type { SiteConfig, UpdateSiteConfigInput } from '../entities/site-config'

export interface SiteConfigRepository {
  findByVenueId(venueId: string): Promise<SiteConfig | null>
  findBySlug(slug: string): Promise<{ venue: { id: string; name: string; slug: string; primaryColor: string }; courts: { id: string; name: string; type: string; hourlyRate: number; isActive: boolean }[]; config: SiteConfig | null } | null>
  createDefault(venueId: string): Promise<SiteConfig>
  update(venueId: string, input: UpdateSiteConfigInput): Promise<SiteConfig | null>
}
