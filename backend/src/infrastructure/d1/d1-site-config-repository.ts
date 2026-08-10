import type { SiteConfig, UpdateSiteConfigInput } from '../../domain/entities/site-config'
import type { SiteConfigRepository } from '../../domain/repositories/site-config-repository'

interface SiteConfigRow {
  id: string
  venue_id: string
  theme: string
  hero_image_url: string | null
  welcome_message: string | null
  show_pricing: number
  show_map: number
  custom_css: string | null
  social_links: string | null
  created_at: string
  updated_at: string
}

function toSiteConfig(row: SiteConfigRow): SiteConfig {
  return {
    id: row.id,
    venueId: row.venue_id,
    theme: row.theme as SiteConfig['theme'],
    heroImageUrl: row.hero_image_url,
    welcomeMessage: row.welcome_message,
    showPricing: row.show_pricing === 1,
    showMap: row.show_map === 1,
    customCss: row.custom_css,
    socialLinks: row.social_links ? JSON.parse(row.social_links) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1SiteConfigRepository implements SiteConfigRepository {
  constructor(private readonly db: D1Database) {}

  async findByVenueId(venueId: string): Promise<SiteConfig | null> {
    const row = await this.db
      .prepare('SELECT id, venue_id, theme, hero_image_url, welcome_message, show_pricing, show_map, custom_css, social_links, created_at, updated_at FROM site_configs WHERE venue_id = ?')
      .bind(venueId)
      .first<SiteConfigRow>()
    return row ? toSiteConfig(row) : null
  }

  async findBySlug(slug: string): Promise<{ venue: { id: string; name: string; slug: string; primaryColor: string }; courts: { id: string; name: string; type: string; hourlyRate: number; isActive: boolean }[]; config: SiteConfig | null } | null> {
    const venueRow = await this.db
      .prepare('SELECT id, name, slug, primary_color FROM venues WHERE slug = ? AND is_active = 1')
      .bind(slug)
      .first<{ id: string; name: string; slug: string; primary_color: string }>()
    if (!venueRow) return null

    const { results: courts } = await this.db
      .prepare('SELECT id, name, type, hourly_rate, is_active FROM courts WHERE venue_id = ? AND is_active = 1 ORDER BY sort_order')
      .bind(venueRow.id)
      .all<{ id: string; name: string; type: string; hourly_rate: number; is_active: number }>()

    const configRow = await this.db
      .prepare('SELECT id, venue_id, theme, hero_image_url, welcome_message, show_pricing, show_map, custom_css, social_links, created_at, updated_at FROM site_configs WHERE venue_id = ?')
      .bind(venueRow.id)
      .first<SiteConfigRow>()

    return {
      venue: { id: venueRow.id, name: venueRow.name, slug: venueRow.slug, primaryColor: venueRow.primary_color },
      courts: courts.map((c) => ({ id: c.id, name: c.name, type: c.type, hourlyRate: c.hourly_rate, isActive: c.is_active === 1 })),
      config: configRow ? toSiteConfig(configRow) : null,
    }
  }

  async createDefault(venueId: string): Promise<SiteConfig> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO site_configs (id, venue_id, theme, show_pricing, show_map, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, venueId, 'default', 1, 1, now, now)
      .run()
    return {
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
  }

  async update(venueId: string, input: UpdateSiteConfigInput): Promise<SiteConfig | null> {
    const existing = await this.findByVenueId(venueId)
    if (!existing) return null

    const theme = input.theme ?? existing.theme
    const heroImageUrl = input.heroImageUrl !== undefined ? input.heroImageUrl : existing.heroImageUrl
    const welcomeMessage = input.welcomeMessage !== undefined ? input.welcomeMessage : existing.welcomeMessage
    const showPricing = input.showPricing !== undefined ? (input.showPricing ? 1 : 0) : (existing.showPricing ? 1 : 0)
    const showMap = input.showMap !== undefined ? (input.showMap ? 1 : 0) : (existing.showMap ? 1 : 0)
    const socialLinks = input.socialLinks !== undefined ? JSON.stringify(input.socialLinks) : (existing.socialLinks ? JSON.stringify(existing.socialLinks) : null)
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE site_configs SET theme = ?, hero_image_url = ?, welcome_message = ?, show_pricing = ?, show_map = ?, social_links = ?, updated_at = ? WHERE venue_id = ?')
      .bind(theme, heroImageUrl, welcomeMessage, showPricing, showMap, socialLinks, now, venueId)
      .run()

    return {
      ...existing,
      theme,
      heroImageUrl,
      welcomeMessage,
      showPricing: showPricing === 1,
      showMap: showMap === 1,
      socialLinks: input.socialLinks ?? existing.socialLinks,
      updatedAt: now,
    }
  }
}
