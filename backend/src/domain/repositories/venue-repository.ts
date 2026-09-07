import type { CreateVenueInput, UpdateVenueInput, Venue } from '../entities/venue'

export interface VenueRepository {
  findAllByOwnerId(ownerId: string): Promise<Venue[]>
  findById(id: string): Promise<Venue | null>
  findBySlug(slug: string): Promise<Venue | null>
  create(input: CreateVenueInput & { ownerId: string }): Promise<Venue>
  update(id: string, input: UpdateVenueInput): Promise<Venue | null>
  softDelete(id: string): Promise<boolean>
}
