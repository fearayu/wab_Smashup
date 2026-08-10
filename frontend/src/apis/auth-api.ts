import type { AuthResponse, LoginBody, OwnerResponse, RegisterBody } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth`

export const authApi = {
  register: (body: RegisterBody) => request<AuthResponse>(`${BASE}/register`, { method: 'POST', body: JSON.stringify(body) }),
  login: (body: LoginBody) => request<AuthResponse>(`${BASE}/login`, { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<OwnerResponse>(`${BASE}/me`),
}
