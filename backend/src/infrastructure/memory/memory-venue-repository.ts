import type { CreateVenueInput, UpdateVenueInput, Venue } from '../../domain/entities/venue'
import type { VenueRepository } from '../../domain/repositories/venue-repository'

export class MemoryVenueRepository implements VenueRepository {
  private readonly venues = new Map<string, Venue>()

  async findAllByOwnerId(ownerId: string): Promise<Venue[]> {
    return [...this.venues.values()].filter((v) => v.ownerId === ownerId && v.isActive)
  }

  async findById(id: string): Promise<Venue | null> {
    return this.venues.get(id) ?? null
  }

  async findBySlug(slug: string): Promise<Venue | null> {
    return [...this.venues.values()].find((v) => v.slug === slug && v.isActive) ?? null
  }

  async create(input: CreateVenueInput & { ownerId: string }): Promise<Venue> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const venue: Venue = {
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
    this.venues.set(id, venue)
    return venue
  }

  async update(id: string, input: UpdateVenueInput): Promise<Venue | null> {
    const existing = this.venues.get(id)
    if (!existing) return null
    const updated: Venue = { ...existing, ...input, updatedAt: new Date().toISOString() }
    if (input.isActive !== undefined) updated.isActive = input.isActive
    this.venues.set(id, updated)
    return updated
  }

  async softDelete(id: string): Promise<boolean> {
    const v = this.venues.get(id)
    if (!v) return false
    v.isActive = false
    v.updatedAt = new Date().toISOString()
    return true
  }
}
