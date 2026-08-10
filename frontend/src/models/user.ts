export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface CreateUserBody {
  email: string
  name: string
}

export interface UpdateUserBody {
  email?: string
  name?: string
}

export interface UserListResponse {
  data: User[]
}

export interface UserResponse {
  data: User
}
