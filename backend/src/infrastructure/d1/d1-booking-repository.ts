import type { Booking, BookingListQuery, CreateBookingInput, UpdateBookingInput } from '../../domain/entities/booking'
import type { BookingRepository } from '../../domain/repositories/booking-repository'

interface BookingRow {
  id: string
  venue_id: string
  court_id: string
  time_slot_ids: string
  player_name: string
  player_phone: string
  player_email: string | null
  status: string
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

function parseTimeSlotIds(raw: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid time_slot_ids in bookings row')
  }
  if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) return parsed
  throw new Error('Invalid time_slot_ids in bookings row')
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    venueId: row.venue_id,
    courtId: row.court_id,
    timeSlotIds: parseTimeSlotIds(row.time_slot_ids),
    playerName: row.player_name,
    playerPhone: row.player_phone,
    playerEmail: row.player_email,
    status: row.status as Booking['status'],
    totalAmount: row.total_amount,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1BookingRepository implements BookingRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<Booking | null> {
    const row = await this.db
      .prepare('SELECT id, venue_id, court_id, time_slot_ids, player_name, player_phone, player_email, status, total_amount, notes, created_at, updated_at FROM bookings WHERE id = ?')
      .bind(id)
      .first<BookingRow>()
    return row ? toBooking(row) : null
  }

  async findByQuery(query: BookingListQuery): Promise<{ items: Booking[]; total: number }> {
    let where = '1=1'
    const params: (string | number)[] = []

    if (query.venueId) {
      where += ' AND venue_id = ?'
      params.push(query.venueId)
    }
    if (query.status) {
      where += ' AND status = ?'
      params.push(query.status)
    }
    if (query.dateFrom) {
      where += ' AND created_at >= ?'
      params.push(query.dateFrom + 'T00:00:00Z')
    }
    if (query.dateTo) {
      where += ' AND created_at <= ?'
      params.push(query.dateTo + 'T23:59:59Z')
    }

    const countRow = await this.db
      .prepare(`SELECT COUNT(*) as total FROM bookings WHERE ${where}`)
      .bind(...params)
      .first<{ total: number }>()
    const total = countRow?.total ?? 0

    const { results } = await this.db
      .prepare(`SELECT id, venue_id, court_id, time_slot_ids, player_name, player_phone, player_email, status, total_amount, notes, created_at, updated_at FROM bookings WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...params, query.limit, query.offset)
      .all<BookingRow>()

    return { items: results.map(toBooking), total }
  }

  async create(input: CreateBookingInput & { totalAmount: number }): Promise<Booking> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO bookings (id, venue_id, court_id, time_slot_ids, player_name, player_phone, player_email, status, total_amount, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.venueId, input.courtId, JSON.stringify(input.timeSlotIds), input.playerName, input.playerPhone, input.playerEmail ?? null, 'pending', input.totalAmount, input.notes ?? null, now, now)
      .run()
    return {
      id,
      venueId: input.venueId,
      courtId: input.courtId,
      timeSlotIds: input.timeSlotIds,
      playerName: input.playerName,
      playerPhone: input.playerPhone,
      playerEmail: input.playerEmail ?? null,
      status: 'pending',
      totalAmount: input.totalAmount,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }
  }

  async update(id: string, input: UpdateBookingInput): Promise<Booking | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const status = input.status ?? existing.status
    const notes = input.notes !== undefined ? input.notes : existing.notes
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE bookings SET status = ?, notes = ?, updated_at = ? WHERE id = ?')
      .bind(status, notes, now, id)
      .run()

    return { ...existing, status, notes, updatedAt: now }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
