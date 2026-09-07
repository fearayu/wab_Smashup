export interface TimeSlot {
  id: string
  courtId: string
  slotDate: string
  slotTime: string
  durationMinutes: number
  price: number
  isAvailable: boolean
  isPeak: boolean
  bookingId: string | null
  createdAt: string
  updatedAt: string
}

export interface GenerateSlotsInput {
  startDate: string
  endDate: string
  openTime: string
  closeTime: string
  slotDurationMinutes: number
}

export interface UpdateSlotInput {
  isAvailable?: boolean
  price?: number
}
