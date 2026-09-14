export interface User {
  id: string
  email: string
  name: string
  displayName?: string
  phone?: string
  level?: string
  role?: string
  avatarUrl?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateUserInput {
  id?: string
  email: string
  name: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
}

/** Fields the profile owner can update on themselves. */
export interface UpdateProfileInput {
  displayName?: string
  phone?: string
  level?: string
  avatarUrl?: string
}
