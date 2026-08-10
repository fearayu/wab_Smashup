import type { CreateUserBody, UpdateUserBody, UserListResponse, UserResponse } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/users`

export const userApi = {
  list: () => request<UserListResponse>(BASE),
  get: (id: string) => request<UserResponse>(`${BASE}/${id}`),
  create: (body: CreateUserBody) => request<UserResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateUserBody) => request<UserResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
