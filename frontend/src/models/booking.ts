export interface Booking {
  id: string
  venue_id: string
  court_id: string
  time_slot_ids: string[]
  player_name: string
  player_phone: string
  player_email?: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount: number
  created_at: string
  court?: { id: string; name: string }
  venue?: { id: string; name: string }
  slots?: { id: string; slot_time: string }[]
  payment?: {
    id: string
    amount: number
    status: string
    slip_image_url?: string
  }
}

export interface CreateBookingBody {
  venue_id: string
  court_id: string
  time_slot_ids: string[]
  player_name: string
  player_phone: string
  player_email?: string
  notes?: string
}

export interface UpdateBookingBody {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
}

export interface BookingListResponse {
  data: {
    items: Booking[]
    total: number
    limit: number
    offset: number
  }
}

export interface BookingResponse {
  data: Booking
}
