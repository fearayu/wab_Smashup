export interface Venue {
  id: string
  ownerId: string
  slug: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  primaryColor: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVenueInput {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  slug: string
  primaryColor?: string
}

export interface UpdateVenueInput {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  slug?: string
  primaryColor?: string
  isActive?: boolean
}
