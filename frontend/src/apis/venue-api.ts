import type { CreateVenueBody, UpdateVenueBody, VenueListResponse, VenueResponse } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/venues`

export const venueApi = {
  list: () => request<VenueListResponse>(BASE),
  get: (id: string) => request<VenueResponse>(`${BASE}/${id}`),
  create: (body: CreateVenueBody) => request<VenueResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateVenueBody) => request<VenueResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
