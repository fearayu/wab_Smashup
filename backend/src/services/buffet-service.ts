import type { BuffetBooking, CreateBuffetBookingInput } from '../domain/entities/buffet'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { BuffetRepository } from '../domain/repositories/buffet-repository'

const SESSIONS = ['11:00–14:00', '17:00–20:00', '19:00–22:00']

export class BuffetService {
  constructor(private readonly buffetRepository: BuffetRepository) {}

  async create(input: Omit<CreateBuffetBookingInput, 'userId'>, userId: string): Promise<BuffetBooking> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < new Date().toISOString().slice(0, 10)) {
      throw new ValidationError('date must be today or a future date in YYYY-MM-DD format')
    }
    if (!SESSIONS.includes(input.session)) throw new ValidationError('invalid buffet session')
    if (!input.name?.trim()) throw new ValidationError('name is required')
    if (!/^0[0-9]{8,9}$/.test(input.phone.replace(/[\s-]/g, ''))) throw new ValidationError('phone must be a valid Thai mobile number')
    const shuttle = input.shuttle ?? 0
    if (![0, 25].includes(shuttle)) throw new ValidationError('shuttle must be 0 or 25')
    const existing = await this.buffetRepository.findBySchedule(input.date, input.session)
    if (existing.filter((b) => b.status !== 'cancelled').length >= 30) throw new ConflictError('รอบนี้เต็มแล้ว')
    if (existing.some((b) => b.userId === userId && b.status !== 'cancelled')) throw new ConflictError('คุณลงชื่อในรอบนี้แล้ว')
    return this.buffetRepository.create({ ...input, userId, phone: input.phone.replace(/[\s-]/g, ''), shuttle, amount: input.amount ?? 60 + shuttle })
  }

  async mine(userId: string): Promise<BuffetBooking[]> { return this.buffetRepository.findByUser(userId) }

  async list(date: string, session: string): Promise<BuffetBooking[]> { return this.buffetRepository.findBySchedule(date, session) }

  async cancel(id: string, userId: string): Promise<BuffetBooking> {
    const booking = await this.buffetRepository.findById(id)
    if (!booking) throw new NotFoundError('Buffet booking')
    if (booking.userId !== userId) throw new ForbiddenError()
    if (booking.status !== 'pending') throw new ValidationError('booking cannot be cancelled')
    const updated = await this.buffetRepository.updateStatus(id, 'cancelled', new Date().toISOString())
    if (!updated) throw new NotFoundError('Buffet booking')
    return updated
  }
}
