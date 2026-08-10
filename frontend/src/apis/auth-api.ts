import type { AuthResponse, LoginBody, OwnerListResponse, OwnerResponse, RegisterBody, UpdateRoleBody } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth`

export const authApi = {
  register: (body: RegisterBody) => request<AuthResponse>(`${BASE}/register`, { method: 'POST', body: JSON.stringify(body) }),
  login: (body: LoginBody) => request<AuthResponse>(`${BASE}/login`, { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<OwnerResponse>(`${BASE}/me`),

  // Admin endpoints
  listOwners: () => request<OwnerListResponse>(`${BASE}/admin/owners`),
  updateRole: (ownerId: string, body: UpdateRoleBody) => request<OwnerResponse>(`${BASE}/admin/owners/${ownerId}/role`, { method: 'PATCH', body: JSON.stringify(body) }),
}
