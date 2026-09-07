export interface Booking {
  id: string
  venueId: string
  courtId: string
  timeSlotIds: string[]
  playerName: string
  playerPhone: string
  playerEmail: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBookingInput {
  venueId: string
  courtId: string
  timeSlotIds: string[]
  playerName: string
  playerPhone: string
  playerEmail?: string
  notes?: string
}

export interface UpdateBookingInput {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
}

export interface BookingListQuery {
  venueId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  limit: number
  offset: number
}
