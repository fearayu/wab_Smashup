import type { Court, CreateCourtInput, UpdateCourtInput } from '../../domain/entities/court'
import type { CourtRepository } from '../../domain/repositories/court-repository'

export class MemoryCourtRepository implements CourtRepository {
  private readonly courts = new Map<string, Court>()

  async findAllByVenueId(venueId: string): Promise<Court[]> {
    return [...this.courts.values()].filter((c) => c.venueId === venueId && c.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  async findById(id: string): Promise<Court | null> {
    return this.courts.get(id) ?? null
  }

  async create(input: CreateCourtInput & { venueId: string }): Promise<Court> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const court: Court = {
      id,
      venueId: input.venueId,
      name: input.name,
      type: input.type ?? 'standard',
      hourlyRate: input.hourlyRate,
      isActive: true,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    }
    this.courts.set(id, court)
    return court
  }

  async update(id: string, input: UpdateCourtInput): Promise<Court | null> {
    const existing = this.courts.get(id)
    if (!existing) return null
    const updated: Court = { ...existing, ...input, updatedAt: new Date().toISOString() }
    if (input.isActive !== undefined) updated.isActive = input.isActive
    this.courts.set(id, updated)
    return updated
  }

  async softDelete(id: string): Promise<boolean> {
    const c = this.courts.get(id)
    if (!c) return false
    c.isActive = false
    c.updatedAt = new Date().toISOString()
    return true
  }
}
