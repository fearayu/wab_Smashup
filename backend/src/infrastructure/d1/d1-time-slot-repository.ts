import type { GenerateSlotsInput, TimeSlot, UpdateSlotInput } from '../../domain/entities/time-slot'
import type { TimeSlotRepository } from '../../domain/repositories/time-slot-repository'

interface SlotRow {
  id: string
  court_id: string
  slot_date: string
  slot_time: string
  duration_minutes: number
  price: number
  is_available: number
  is_peak: number
  booking_id: string | null
  created_at: string
  updated_at: string
}

function toSlot(row: SlotRow): TimeSlot {
  return {
    id: row.id,
    courtId: row.court_id,
    slotDate: row.slot_date,
    slotTime: row.slot_time,
    durationMinutes: row.duration_minutes,
    price: row.price,
    isAvailable: row.is_available === 1,
    isPeak: row.is_peak === 1,
    bookingId: row.booking_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1TimeSlotRepository implements TimeSlotRepository {
  constructor(private readonly db: D1Database) {}

  async findAllByCourtAndDate(courtId: string, slotDate: string): Promise<TimeSlot[]> {
    const { results } = await this.db
      .prepare('SELECT id, court_id, slot_date, slot_time, duration_minutes, price, is_available, is_peak, booking_id, created_at, updated_at FROM time_slots WHERE court_id = ? AND slot_date = ? ORDER BY slot_time')
      .bind(courtId, slotDate)
      .all<SlotRow>()
    return results.map(toSlot)
  }

  async findById(id: string): Promise<TimeSlot | null> {
    const row = await this.db
      .prepare('SELECT id, court_id, slot_date, slot_time, duration_minutes, price, is_available, is_peak, booking_id, created_at, updated_at FROM time_slots WHERE id = ?')
      .bind(id)
      .first<SlotRow>()
    return row ? toSlot(row) : null
  }

  async findManyByIds(ids: string[]): Promise<TimeSlot[]> {
    if (ids.length === 0) return []
    const placeholders = ids.map(() => '?').join(',')
    const { results } = await this.db
      .prepare(`SELECT id, court_id, slot_date, slot_time, duration_minutes, price, is_available, is_peak, booking_id, created_at, updated_at FROM time_slots WHERE id IN (${placeholders})`)
      .bind(...ids)
      .all<SlotRow>()
    return results.map(toSlot)
  }

  async generateSlots(venueId: string, input: GenerateSlotsInput): Promise<number> {
    const { results: courts } = await this.db
      .prepare('SELECT id, hourly_rate FROM courts WHERE venue_id = ? AND is_active = 1')
      .bind(venueId)
      .all<{ id: string; hourly_rate: number }>()

    if (!courts || courts.length === 0) return 0

    const openH = parseInt(input.openTime.split(':')[0], 10)
    const openM = parseInt(input.openTime.split(':')[1], 10)
    const closeH = parseInt(input.closeTime.split(':')[0], 10)
    const closeM = parseInt(input.closeTime.split(':')[1], 10)
    const slotDur = input.slotDurationMinutes

    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    const slotsPerDay = Math.floor((closeMinutes - openMinutes) / slotDur)

    const start = new Date(input.startDate + 'T00:00:00Z')
    const end = new Date(input.endDate + 'T00:00:00Z')
    let inserted = 0

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10)
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6

      for (const court of courts) {
        // Check if any slots already exist for this court/date
        const { results: existing } = await this.db
          .prepare('SELECT id FROM time_slots WHERE court_id = ? AND slot_date = ? LIMIT 1')
          .bind(court.id, dateStr)
          .all<{ id: string }>()
        if (existing && existing.length > 0) continue

        for (let i = 0; i < slotsPerDay; i++) {
          const slotMinutes = openMinutes + i * slotDur
          const hh = String(Math.floor(slotMinutes / 60)).padStart(2, '0')
          const mm = String(slotMinutes % 60).padStart(2, '0')
          const timeStr = `${hh}:${mm}`
          const isPeak = (slotMinutes >= 18 * 60) || isWeekend
          const price = isPeak ? Math.ceil(court.hourly_rate * 1.2) : court.hourly_rate
          const id = crypto.randomUUID()
          const now = new Date().toISOString()

          await this.db
            .prepare('INSERT INTO time_slots (id, court_id, slot_date, slot_time, duration_minutes, price, is_available, is_peak, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(id, court.id, dateStr, timeStr, slotDur, price, 1, isPeak ? 1 : 0, now, now)
            .run()
          inserted++
        }
      }
    }

    return inserted
  }

  async update(id: string, input: UpdateSlotInput): Promise<TimeSlot | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const isAvailable = input.isAvailable !== undefined ? (input.isAvailable ? 1 : 0) : (existing.isAvailable ? 1 : 0)
    const price = input.price ?? existing.price
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE time_slots SET is_available = ?, price = ?, updated_at = ? WHERE id = ?')
      .bind(isAvailable, price, now, id)
      .run()

    return { ...existing, isAvailable: isAvailable === 1, price, updatedAt: now }
  }

  async lockSlots(bookingId: string, slotIds: string[]): Promise<boolean> {
    const placeholders = slotIds.map(() => '?').join(',')
    const result = await this.db
      .prepare(`UPDATE time_slots SET is_available = 0, booking_id = ?, updated_at = ? WHERE id IN (${placeholders}) AND is_available = 1`)
      .bind(bookingId, new Date().toISOString(), ...slotIds)
      .run()
    return (result.meta.changes ?? 0) === slotIds.length
  }

  async releaseSlots(bookingId: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE time_slots SET is_available = 1, booking_id = NULL, updated_at = ? WHERE booking_id = ?')
      .bind(new Date().toISOString(), bookingId)
      .run()
    return (result.meta.changes ?? 0) > 0
  }
}
