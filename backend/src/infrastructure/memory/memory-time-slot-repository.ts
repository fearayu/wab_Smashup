import type { GenerateSlotsInput, TimeSlot, UpdateSlotInput } from '../../domain/entities/time-slot'
import type { CourtRepository } from '../../domain/repositories/court-repository'
import type { TimeSlotRepository } from '../../domain/repositories/time-slot-repository'

export class MemoryTimeSlotRepository implements TimeSlotRepository {
  private readonly slots = new Map<string, TimeSlot>()
  private courtRepo: CourtRepository | null = null

  setCourtRepository(repo: CourtRepository) { this.courtRepo = repo }

  async findAllByCourtAndDate(courtId: string, slotDate: string): Promise<TimeSlot[]> {
    return [...this.slots.values()]
      .filter((s) => s.courtId === courtId && s.slotDate === slotDate)
      .sort((a, b) => a.slotTime.localeCompare(b.slotTime))
  }

  async findById(id: string): Promise<TimeSlot | null> {
    return this.slots.get(id) ?? null
  }

  async findManyByIds(ids: string[]): Promise<TimeSlot[]> {
    return ids.map((id) => this.slots.get(id)).filter(Boolean) as TimeSlot[]
  }

  async generateSlots(venueId: string, input: GenerateSlotsInput): Promise<number> {
    if (!this.courtRepo) return 0
    const courts = await this.courtRepo.findAllByVenueId(venueId)
    if (!courts || courts.length === 0) return 0

    const openH = parseInt(input.openTime.split(':')[0]!, 10)
    const openM = parseInt(input.openTime.split(':')[1]!, 10)
    const closeH = parseInt(input.closeTime.split(':')[0]!, 10)
    const closeM = parseInt(input.closeTime.split(':')[1]!, 10)
    const slotDur = input.slotDurationMinutes

    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    const slotsPerDay = Math.floor((closeMinutes - openMinutes) / slotDur)

    const start = new Date(input.startDate + 'T00:00:00Z')
    const end = new Date(input.endDate + 'T00:00:00Z')

    const dates: string[] = []
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10))
    }

    const existingPairs = new Set<string>()
    for (const s of this.slots.values()) {
      existingPairs.add(`${s.courtId}|${s.slotDate}`)
    }

    let inserted = 0

    for (const dateStr of dates) {
      const dayOfWeek = new Date(dateStr + 'T00:00:00Z').getUTCDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      for (const court of courts) {
        if (existingPairs.has(`${court.id}|${dateStr}`)) continue

        for (let i = 0; i < slotsPerDay; i++) {
          const slotMinutes = openMinutes + i * slotDur
          const hh = String(Math.floor(slotMinutes / 60)).padStart(2, '0')
          const mm = String(slotMinutes % 60).padStart(2, '0')
          const timeStr = `${hh}:${mm}`
          const isPeak = slotMinutes >= 18 * 60 || isWeekend
          const price = isPeak ? Math.ceil(court.hourlyRate * 1.2) : court.hourlyRate
          const id = crypto.randomUUID()
          const now = new Date().toISOString()

          const slot: TimeSlot = {
            id,
            courtId: court.id,
            slotDate: dateStr,
            slotTime: timeStr,
            durationMinutes: slotDur,
            price,
            isAvailable: true,
            isPeak,
            bookingId: null,
            createdAt: now,
            updatedAt: now,
          }
          this.slots.set(id, slot)
          inserted++
        }
      }
    }

    return inserted
  }

  async update(id: string, input: UpdateSlotInput): Promise<TimeSlot | null> {
    const existing = this.slots.get(id)
    if (!existing) return null
    const updated: TimeSlot = { ...existing, ...input, updatedAt: new Date().toISOString() }
    if (input.isAvailable !== undefined) updated.isAvailable = input.isAvailable
    this.slots.set(id, updated)
    return updated
  }

  async lockSlots(bookingId: string, slotIds: string[]): Promise<boolean> {
    let ok = true
    for (const id of slotIds) {
      const slot = this.slots.get(id)
      if (!slot || !slot.isAvailable) { ok = false; break }
    }
    if (!ok) return false
    for (const id of slotIds) {
      const slot = this.slots.get(id)!
      slot.isAvailable = false
      slot.bookingId = bookingId
      slot.updatedAt = new Date().toISOString()
    }
    return true
  }

  async releaseSlots(bookingId: string): Promise<boolean> {
    let changed = false
    for (const slot of this.slots.values()) {
      if (slot.bookingId === bookingId) {
        slot.isAvailable = true
        slot.bookingId = null
        slot.updatedAt = new Date().toISOString()
        changed = true
      }
    }
    return changed
  }
}
