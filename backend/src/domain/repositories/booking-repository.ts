import type { Booking, BookingListQuery, CreateBookingInput, UpdateBookingInput } from '../entities/booking'

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>
  findByQuery(query: BookingListQuery): Promise<{ items: Booking[]; total: number }>
  create(input: CreateBookingInput & { totalAmount: number }): Promise<Booking>
  update(id: string, input: UpdateBookingInput): Promise<Booking | null>
  delete(id: string): Promise<boolean>
}
