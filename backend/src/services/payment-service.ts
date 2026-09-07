import type { Payment, PaymentListQuery, VerifyPaymentInput } from '../domain/entities/payment'
import { ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { BookingRepository } from '../domain/repositories/booking-repository'
import { slotListCacheKey } from '../domain/repositories/cache-repository'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { PaymentRepository } from '../domain/repositories/payment-repository'
import type { TimeSlotRepository } from '../domain/repositories/time-slot-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'

export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly venueRepository: VenueRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly cache: CacheRepository
  ) {}

  async createSlip(bookingId: string, slipImageUrl: string): Promise<Payment> {
    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) throw new NotFoundError('Booking')
    if (!slipImageUrl) throw new ValidationError('slip image is required')

    return this.paymentRepository.create({ bookingId, amount: booking.totalAmount, slipImageUrl })
  }

  async listByOwner(query: PaymentListQuery, ownerId: string): Promise<Payment[]> {
    if (query.venueId) {
      const venue = await this.venueRepository.findById(query.venueId)
      if (!venue || venue.ownerId !== ownerId) throw new ForbiddenError()
    }
    return this.paymentRepository.findByQuery(query)
  }

  async getById(id: string, ownerId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id)
    if (!payment) throw new NotFoundError('Payment')

    const booking = await this.bookingRepository.findById(payment.bookingId)
    if (!booking) throw new NotFoundError('Booking')
    const venue = await this.venueRepository.findById(booking.venueId)
    if (!venue || venue.ownerId !== ownerId) throw new ForbiddenError()

    return payment
  }

  async verify(id: string, input: VerifyPaymentInput, ownerId: string): Promise<Payment> {
    const payment = await this.getById(id, ownerId)
    if (input.status === 'rejected' && !input.reason) throw new ValidationError('reason is required when rejecting')

    const updated = await this.paymentRepository.update(id, { ...input, verifiedBy: ownerId, verifiedAt: new Date().toISOString() })
    if (!updated) throw new NotFoundError('Payment')

    // If verified, confirm booking; if rejected, cancel and release slots
    if (input.status === 'verified') {
      await this.bookingRepository.update(payment.bookingId, { status: 'confirmed' })
    } else if (input.status === 'rejected') {
      await this.bookingRepository.update(payment.bookingId, { status: 'cancelled' })
      await this.timeSlotRepository.releaseSlots(payment.bookingId)

      const booking = await this.bookingRepository.findById(payment.bookingId)
      if (booking) {
        const slots = await this.timeSlotRepository.findManyByIds(booking.timeSlotIds)
        const keys = new Map<string, boolean>()
        for (const slot of slots) keys.set(slotListCacheKey(slot.courtId, slot.slotDate), true)
        await Promise.all([...keys.keys()].map((key) => this.cache.delete(key)))
      }
    }

    return updated
  }
}
