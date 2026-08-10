export interface Owner {
  id: string
  email: string
  name: string
  phone?: string
  plan: 'free' | 'pro'
  onboarding_completed: boolean
  role: 'admin' | 'member' | 'user'
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

export interface UpdateRoleBody {
  role: 'admin' | 'member' | 'user'
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

export interface OwnerListResponse {
  data: Owner[]
}
