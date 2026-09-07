import type { Booking, BookingListQuery, CreateBookingInput, UpdateBookingInput } from '../domain/entities/booking'
import type { TimeSlot } from '../domain/entities/time-slot'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { BookingRepository } from '../domain/repositories/booking-repository'
import { slotListCacheKey } from '../domain/repositories/cache-repository'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { CourtRepository } from '../domain/repositories/court-repository'
import type { PaymentRepository } from '../domain/repositories/payment-repository'
import type { TimeSlotRepository } from '../domain/repositories/time-slot-repository'
import type { VenueRepository } from '../domain/repositories/venue-repository'

export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly courtRepository: CourtRepository,
    private readonly venueRepository: VenueRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly cache: CacheRepository
  ) {}

  async createPublic(input: CreateBookingInput): Promise<{ booking: Booking; paymentId: string }> {
    if (input.timeSlotIds.length > 4) throw new ValidationError('max 4 consecutive slots')
    if (!input.playerName?.trim()) throw new ValidationError('playerName is required')
    if (!/^0[0-9]{8,9}$/.test(input.playerPhone)) throw new ValidationError('playerPhone must be a valid Thai mobile number')

    const court = await this.courtRepository.findById(input.courtId)
    if (!court) throw new NotFoundError('Court')
    const venue = await this.venueRepository.findById(input.venueId)
    if (!venue) throw new NotFoundError('Venue')
    if (court.venueId !== venue.id) throw new ValidationError('court does not belong to venue')

    const slots = await this.timeSlotRepository.findManyByIds(input.timeSlotIds)
    if (slots.length !== input.timeSlotIds.length) throw new NotFoundError('One or more time slots not found')

    const today = new Date().toISOString().slice(0, 10)
    for (const slot of slots) {
      if (slot.slotDate < today) throw new ValidationError('cannot book past dates')
      if (slot.courtId !== input.courtId) throw new ValidationError('slots must belong to the selected court')
      if (!slot.isAvailable) throw new ConflictError('One or more slots are no longer available')
    }

    // Verify slots are consecutive
    const sorted = slots.sort((a, b) => a.slotTime.localeCompare(b.slotTime))
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!
      const curr = sorted[i]!
      const prevEnd = parseInt(prev.slotTime.split(':')[0]!) * 60 + parseInt(prev.slotTime.split(':')[1]!) + prev.durationMinutes
      const currStart = parseInt(curr.slotTime.split(':')[0]!) * 60 + parseInt(curr.slotTime.split(':')[1]!)
      if (prevEnd !== currStart) throw new ValidationError('slots must be consecutive')
    }

    const totalAmount = slots.reduce((sum, s) => sum + s.price, 0)

    const booking = await this.bookingRepository.create({ ...input, totalAmount })

    // Atomic lock
    const locked = await this.timeSlotRepository.lockSlots(booking.id, input.timeSlotIds)
    if (!locked) {
      // Release the slots we locked (partial lock) BEFORE deleting the booking,
      // otherwise ON DELETE SET NULL clears booking_id but leaves is_available = 0,
      // permanently killing otherwise-free slots.
      await this.timeSlotRepository.releaseSlots(booking.id)
      await this.bookingRepository.delete(booking.id)
      throw new ConflictError('Slots were taken by another booking')
    }

    await this.invalidateSlotCache(slots)

    const payment = await this.paymentRepository.create({
      bookingId: booking.id,
      amount: totalAmount,
    })

    return { booking, paymentId: payment.id }
  }

  async listByOwner(query: BookingListQuery, ownerId: string): Promise<{ items: Booking[]; total: number }> {
    // If venueId provided, ensure ownership
    if (query.venueId) {
      const venue = await this.venueRepository.findById(query.venueId)
      if (!venue) throw new NotFoundError('Venue')
      if (venue.ownerId !== ownerId) throw new ForbiddenError()
    }

    return this.bookingRepository.findByQuery(query)
  }

  async getById(id: string, ownerId?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id)
    if (!booking) throw new NotFoundError('Booking')

    if (ownerId) {
      const venue = await this.venueRepository.findById(booking.venueId)
      if (!venue || venue.ownerId !== ownerId) throw new ForbiddenError()
    }

    return booking
  }

  async updateStatus(id: string, input: UpdateBookingInput, ownerId: string): Promise<Booking> {
    const booking = await this.getById(id, ownerId)

    if (input.status === 'cancelled') {
      await this.timeSlotRepository.releaseSlots(id)
      const slots = await this.timeSlotRepository.findManyByIds(booking.timeSlotIds)
      await this.invalidateSlotCache(slots)
    }

    if (input.status === 'confirmed') {
      const payment = await this.paymentRepository.findByBookingId(id)
      if (payment && payment.status === 'pending') {
        await this.paymentRepository.update(payment.id, { status: 'verified', verifiedBy: 'auto' })
      }
    }

    const updated = await this.bookingRepository.update(id, input)
    if (!updated) throw new NotFoundError('Booking')
    return updated
  }

  private async invalidateSlotCache(slots: TimeSlot[]): Promise<void> {
    const keys = new Map<string, boolean>()
    for (const slot of slots) keys.set(slotListCacheKey(slot.courtId, slot.slotDate), true)
    await Promise.all([...keys.keys()].map((key) => this.cache.delete(key)))
  }
}
