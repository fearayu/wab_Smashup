import type { Booking, BookingListQuery, CreateBookingInput, UpdateBookingInput } from '../../domain/entities/booking'
import type { BookingRepository } from '../../domain/repositories/booking-repository'

export class MemoryBookingRepository implements BookingRepository {
  private readonly bookings = new Map<string, Booking>()

  async findById(id: string): Promise<Booking | null> {
    return this.bookings.get(id) ?? null
  }

  async findByQuery(query: BookingListQuery): Promise<{ items: Booking[]; total: number }> {
    let items = [...this.bookings.values()]
    if (query.venueId) items = items.filter((b) => b.venueId === query.venueId)
    if (query.status) items = items.filter((b) => b.status === query.status)
    if (query.dateFrom) items = items.filter((b) => b.createdAt >= query.dateFrom! + 'T00:00:00Z')
    if (query.dateTo) items = items.filter((b) => b.createdAt <= query.dateTo! + 'T23:59:59Z')
    items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const total = items.length
    items = items.slice(query.offset, query.offset + query.limit)
    return { items, total }
  }

  async create(input: CreateBookingInput & { totalAmount: number }): Promise<Booking> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const booking: Booking = {
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
    this.bookings.set(id, booking)
    return booking
  }

  async update(id: string, input: UpdateBookingInput): Promise<Booking | null> {
    const existing = this.bookings.get(id)
    if (!existing) return null
    const updated: Booking = { ...existing, ...input, updatedAt: new Date().toISOString() }
    this.bookings.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.bookings.delete(id)
  }
}
