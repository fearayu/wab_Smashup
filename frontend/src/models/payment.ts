export interface Payment {
  id: string
  booking_id: string
  slip_image_url: string
  status: 'pending' | 'verified' | 'rejected'
  reason?: string
  created_at: string
  booking?: {
    id: string
    player_name: string
    player_phone: string
    total_amount: number
    status: string
    court: { id: string; name: string }
    venue: { id: string; name: string }
  }
}

export interface VerifyPaymentBody {
  status: 'verified' | 'rejected'
  reason?: string
}

export interface PaymentListResponse {
  data: Payment[]
}

export interface PaymentResponse {
  data: Payment
}
