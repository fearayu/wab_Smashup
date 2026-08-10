export interface TimeSlot {
  id: string
  venue_id: string
  court_id: string
  slot_date: string
  slot_time: string
  duration_minutes: number
  price: number
  is_available: boolean
  is_peak: boolean
  booking_id?: string
}

export interface GenerateSlotsBody {
  start_date: string
  end_date: string
  open_time?: string
  close_time?: string
  slot_duration_minutes?: number
}

export interface UpdateSlotBody {
  is_available?: boolean
  price?: number
}

export interface PublicSlotsResponse {
  data: {
    venue: {
      id: string
      name: string
      slug: string
      primary_color?: string
    }
    courts: {
      id: string
      name: string
      slots: {
        id: string
        slot_time: string
        duration_minutes: number
        price: number
        is_available: boolean
        is_peak: boolean
      }[]
    }[]
  }
}

export interface SlotListResponse {
  data: TimeSlot[]
}

export interface SlotResponse {
  data: TimeSlot
}
