import type { GenerateSlotsBody, PublicSlotsResponse, SlotListResponse, SlotResponse, UpdateSlotBody } from '@/models'
import { request } from './request'

const BASE = (venueId: string) => `${import.meta.env.VITE_BACKEND_URL}/api/v1/venues/${venueId}/slots`
const SLOT_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/slots`

export const slotApi = {
  publicList: (slug: string, date: string, courtId?: string) => {
    const params = new URLSearchParams({ date })
    if (courtId) params.append('court_id', courtId)
    return request<PublicSlotsResponse>(`${import.meta.env.VITE_BACKEND_URL}/api/v1/public/venues/${slug}/slots?${params}`)
  },
  list: (venueId: string) => request<SlotListResponse>(BASE(venueId)),
  generate: (venueId: string, body: GenerateSlotsBody) => request<SlotListResponse>(`${BASE(venueId)}/generate`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateSlotBody) => request<SlotResponse>(`${SLOT_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
