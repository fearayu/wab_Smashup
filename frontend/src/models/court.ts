export interface Court {
  id: string
  venue_id: string
  name: string
  type: 'standard' | 'premium'
  hourly_rate: number
  is_active: boolean
  sort_order: number
}

export interface CreateCourtBody {
  name: string
  type?: 'standard' | 'premium'
  hourly_rate: number
  sort_order?: number
}

export interface UpdateCourtBody {
  name?: string
  type?: 'standard' | 'premium'
  hourly_rate?: number
  sort_order?: number
}

export interface CourtListResponse {
  data: Court[]
}

export interface CourtResponse {
  data: Court
}
