import type { GenerateSlotsInput, TimeSlot, UpdateSlotInput } from '../entities/time-slot'

export interface TimeSlotRepository {
  findAllByCourtAndDate(courtId: string, slotDate: string): Promise<TimeSlot[]>
  findById(id: string): Promise<TimeSlot | null>
  findManyByIds(ids: string[]): Promise<TimeSlot[]>
  generateSlots(venueId: string, input: GenerateSlotsInput): Promise<number>
  update(id: string, input: UpdateSlotInput): Promise<TimeSlot | null>
  lockSlots(bookingId: string, slotIds: string[]): Promise<boolean>
  releaseSlots(bookingId: string): Promise<boolean>
}
