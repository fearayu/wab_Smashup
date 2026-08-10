export interface Owner {
  id: string
  email: string
  name: string
  phone?: string
  plan: 'free' | 'pro'
  onboarding_completed: boolean
  created_at: string
}

export interface RegisterBody {
  email: string
  password: string
  name: string
  phone?: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface AuthResponse {
  data: {
    token: string
    owner: Owner
  }
}

export interface OwnerResponse {
  data: Owner
}
