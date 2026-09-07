import type { CreateVenueInput, UpdateVenueInput, Venue } from '../../domain/entities/venue'
import type { VenueRepository } from '../../domain/repositories/venue-repository'

interface VenueRow {
  id: string
  owner_id: string
  slug: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  primary_color: string
  is_active: number
  created_at: string
  updated_at: string
}

function toVenue(row: VenueRow): Venue {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logo_url,
    primaryColor: row.primary_color,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1VenueRepository implements VenueRepository {
  constructor(private readonly db: D1Database) {}

  async findAllByOwnerId(ownerId: string): Promise<Venue[]> {
    const { results } = await this.db
      .prepare('SELECT id, owner_id, slug, name, description, address, phone, email, logo_url, primary_color, is_active, created_at, updated_at FROM venues WHERE owner_id = ? AND is_active = 1 ORDER BY created_at DESC')
      .bind(ownerId)
      .all<VenueRow>()
    return results.map(toVenue)
  }

  async findById(id: string): Promise<Venue | null> {
    const row = await this.db
      .prepare('SELECT id, owner_id, slug, name, description, address, phone, email, logo_url, primary_color, is_active, created_at, updated_at FROM venues WHERE id = ?')
      .bind(id)
      .first<VenueRow>()
    return row ? toVenue(row) : null
  }

  async findBySlug(slug: string): Promise<Venue | null> {
    const row = await this.db
      .prepare('SELECT id, owner_id, slug, name, description, address, phone, email, logo_url, primary_color, is_active, created_at, updated_at FROM venues WHERE slug = ? AND is_active = 1')
      .bind(slug)
      .first<VenueRow>()
    return row ? toVenue(row) : null
  }

  async create(input: CreateVenueInput & { ownerId: string }): Promise<Venue> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO venues (id, owner_id, slug, name, description, address, phone, email, logo_url, primary_color, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.ownerId, input.slug, input.name, input.description ?? null, input.address ?? null, input.phone ?? null, input.email ?? null, null, input.primaryColor ?? '#1976D2', 1, now, now)
      .run()
    return {
      id,
      ownerId: input.ownerId,
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      logoUrl: null,
      primaryColor: input.primaryColor ?? '#1976D2',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
  }

  async update(id: string, input: UpdateVenueInput): Promise<Venue | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const slug = input.slug ?? existing.slug
    const name = input.name ?? existing.name
    const description = input.description !== undefined ? input.description : existing.description
    const address = input.address !== undefined ? input.address : existing.address
    const phone = input.phone !== undefined ? input.phone : existing.phone
    const email = input.email !== undefined ? input.email : existing.email
    const primaryColor = input.primaryColor ?? existing.primaryColor
    const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : (existing.isActive ? 1 : 0)
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE venues SET slug = ?, name = ?, description = ?, address = ?, phone = ?, email = ?, primary_color = ?, is_active = ?, updated_at = ? WHERE id = ?')
      .bind(slug, name, description, address, phone, email, primaryColor, isActive, now, id)
      .run()

    return { ...existing, slug, name, description, address, phone, email, primaryColor, isActive: isActive === 1, updatedAt: now }
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE venues SET is_active = 0, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), id)
      .run()
    return result.meta.changes > 0
  }
}
