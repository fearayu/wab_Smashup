export interface Court {
  id: string
  venueId: string
  name: string
  type: 'standard' | 'premium'
  hourlyRate: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateCourtInput {
  name: string
  type?: 'standard' | 'premium'
  hourlyRate: number
  sortOrder?: number
}

export interface UpdateCourtInput {
  name?: string
  type?: 'standard' | 'premium'
  hourlyRate?: number
  sortOrder?: number
  isActive?: boolean
}
