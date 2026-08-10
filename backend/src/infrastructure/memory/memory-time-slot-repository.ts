import type { GenerateSlotsInput, TimeSlot, UpdateSlotInput } from '../../domain/entities/time-slot'
import type { TimeSlotRepository } from '../../domain/repositories/time-slot-repository'

export class MemoryTimeSlotRepository implements TimeSlotRepository {
  private readonly slots = new Map<string, TimeSlot>()

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

  async generateSlots(_venueId: string, _input: GenerateSlotsInput): Promise<number> {
    return 0
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
