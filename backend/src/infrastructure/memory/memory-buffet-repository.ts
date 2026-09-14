import type { BuffetBooking, BuffetStatus, CreateBuffetBookingInput } from '../../domain/entities/buffet'
import type { BuffetRepository } from '../../domain/repositories/buffet-repository'

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }

export class MemoryBuffetRepository implements BuffetRepository {
  private readonly bookings = new Map<string, BuffetBooking>()
  async create(input: CreateBuffetBookingInput & { amount: number }): Promise<BuffetBooking> {
    const now = new Date().toISOString()
    const booking: BuffetBooking = { id: crypto.randomUUID(), userId: input.userId, name: input.name, phone: input.phone, date: input.date, session: input.session, level: input.level ?? '', levelSource: input.levelSource ?? 'self-assessed', note: input.note ?? '', shuttle: input.shuttle ?? 0, amount: input.amount, group: input.group ?? 'regular', status: 'pending', paymentStatus: 'ไม่ชำระ', queueNumber: null, createdAt: now, updatedAt: now }
    this.bookings.set(booking.id, booking)
    return clone(booking)
  }
  async findById(id: string): Promise<BuffetBooking | null> { const item = this.bookings.get(id); return item ? clone(item) : null }
  async findByUser(userId: string): Promise<BuffetBooking[]> { return [...this.bookings.values()].filter((item) => item.userId === userId).map(clone) }
  async findBySchedule(date: string, session: string): Promise<BuffetBooking[]> { return [...this.bookings.values()].filter((item) => item.date === date && item.session === session).map(clone) }
  async updateStatus(id: string, status: BuffetStatus, updatedAt: string): Promise<BuffetBooking | null> { const item = this.bookings.get(id); if (!item) return null; const updated = { ...item, status, updatedAt }; this.bookings.set(id, updated); return clone(updated) }
}
