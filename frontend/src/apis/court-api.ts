import type { CourtListResponse, CourtResponse, CreateCourtBody, UpdateCourtBody } from '@/models'
import { request } from './request'

const BASE = (venueId: string) => `${import.meta.env.VITE_BACKEND_URL}/api/v1/venues/${venueId}/courts`
const COURT_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/courts`

export const courtApi = {
  list: (venueId: string) => request<CourtListResponse>(BASE(venueId)),
  create: (venueId: string, body: CreateCourtBody) => request<CourtResponse>(BASE(venueId), { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateCourtBody) => request<CourtResponse>(`${COURT_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${COURT_BASE}/${id}`, { method: 'DELETE' }),
}
