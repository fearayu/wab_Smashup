import type { BuffetBooking, BuffetStatus, CreateBuffetBookingInput } from '../entities/buffet'

export interface BuffetRepository {
  create(input: CreateBuffetBookingInput & { amount: number }): Promise<BuffetBooking>
  findById(id: string): Promise<BuffetBooking | null>
  findByUser(userId: string): Promise<BuffetBooking[]>
  findBySchedule(date: string, session: string): Promise<BuffetBooking[]>
  updateStatus(id: string, status: BuffetStatus, updatedAt: string): Promise<BuffetBooking | null>
}
