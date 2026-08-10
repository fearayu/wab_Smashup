import type { PaymentListResponse, PaymentResponse, VerifyPaymentBody } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments`

export const paymentApi = {
  uploadSlip: (bookingId: string, formData: FormData) => {
    return request<PaymentResponse>(`${BASE}/${bookingId}/slip`, {
      method: 'POST',
      body: formData,
      headers: {}, // let browser set content-type for multipart
    })
  },
  list: (params?: { status?: string; venue_id?: string }) => {
    const qs = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v))
      })
    }
    return request<PaymentListResponse>(`${BASE}?${qs}`)
  },
  verify: (id: string, body: VerifyPaymentBody) => request<PaymentResponse>(`${BASE}/${id}/verify`, { method: 'PATCH', body: JSON.stringify(body) }),
}
