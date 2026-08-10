export interface Venue {
  id: string
  slug: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  primary_color?: string
  is_active: boolean
  created_at: string
}

export interface CreateVenueBody {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  slug: string
  primary_color?: string
}

export interface UpdateVenueBody {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  slug?: string
  primary_color?: string
}

export interface VenueListResponse {
  data: Venue[]
}

export interface VenueResponse {
  data: Venue
}

export interface PublicVenue {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  primary_color?: string
}
