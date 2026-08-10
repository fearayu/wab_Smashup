import type { Court, CreateCourtInput, UpdateCourtInput } from '../../domain/entities/court'
import type { CourtRepository } from '../../domain/repositories/court-repository'

interface CourtRow {
  id: string
  venue_id: string
  name: string
  type: string
  hourly_rate: number
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

function toCourt(row: CourtRow): Court {
  return {
    id: row.id,
    venueId: row.venue_id,
    name: row.name,
    type: row.type as 'standard' | 'premium',
    hourlyRate: row.hourly_rate,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1CourtRepository implements CourtRepository {
  constructor(private readonly db: D1Database) {}

  async findAllByVenueId(venueId: string): Promise<Court[]> {
    const { results } = await this.db
      .prepare('SELECT id, venue_id, name, type, hourly_rate, is_active, sort_order, created_at, updated_at FROM courts WHERE venue_id = ? AND is_active = 1 ORDER BY sort_order, created_at')
      .bind(venueId)
      .all<CourtRow>()
    return results.map(toCourt)
  }

  async findById(id: string): Promise<Court | null> {
    const row = await this.db
      .prepare('SELECT id, venue_id, name, type, hourly_rate, is_active, sort_order, created_at, updated_at FROM courts WHERE id = ?')
      .bind(id)
      .first<CourtRow>()
    return row ? toCourt(row) : null
  }

  async create(input: CreateCourtInput & { venueId: string }): Promise<Court> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO courts (id, venue_id, name, type, hourly_rate, is_active, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.venueId, input.name, input.type ?? 'standard', input.hourlyRate, 1, input.sortOrder ?? 0, now, now)
      .run()
    return {
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
  }

  async update(id: string, input: UpdateCourtInput): Promise<Court | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const name = input.name ?? existing.name
    const type = input.type ?? existing.type
    const hourlyRate = input.hourlyRate ?? existing.hourlyRate
    const sortOrder = input.sortOrder ?? existing.sortOrder
    const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : (existing.isActive ? 1 : 0)
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE courts SET name = ?, type = ?, hourly_rate = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?')
      .bind(name, type, hourlyRate, sortOrder, isActive, now, id)
      .run()

    return { ...existing, name, type, hourlyRate, sortOrder, isActive: isActive === 1, updatedAt: now }
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE courts SET is_active = 0, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), id)
      .run()
    return result.meta.changes > 0
  }
}
