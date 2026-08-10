export interface Owner {
  id: string
  email: string
  name: string
  phone: string | null
  plan: 'free' | 'pro'
  planExpiresAt: string | null
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateOwnerInput {
  email: string
  password: string
  name: string
  phone?: string
}

export interface UpdateOwnerInput {
  name?: string
  phone?: string
  plan?: 'free' | 'pro'
  planExpiresAt?: string
  onboardingCompleted?: boolean
}
