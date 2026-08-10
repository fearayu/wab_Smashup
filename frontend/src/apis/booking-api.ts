import type { BookingListResponse, BookingResponse, CreateBookingBody, UpdateBookingBody } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings`
const PUBLIC_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/public/bookings`

export const bookingApi = {
  publicCreate: (body: CreateBookingBody) => request<BookingResponse>(PUBLIC_BASE, { method: 'POST', body: JSON.stringify(body) }),
  list: (params?: { venue_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v))
      })
    }
    return request<BookingListResponse>(`${BASE}?${qs}`)
  },
  get: (id: string) => request<BookingResponse>(`${BASE}/${id}`),
  update: (id: string, body: UpdateBookingBody) => request<BookingResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
