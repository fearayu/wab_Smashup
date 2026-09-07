export interface Payment {
  id: string
  bookingId: string
  amount: number
  slipImageUrl: string | null
  status: 'pending' | 'verified' | 'rejected'
  verifiedBy: string | null
  verifiedAt: string | null
  bankHint: string | null
  referenceHint: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentInput {
  bookingId: string
  amount: number
  slipImageUrl?: string
}

export interface VerifyPaymentInput {
  status: 'verified' | 'rejected'
  reason?: string
}

export interface PaymentListQuery {
  status?: string
  venueId?: string
}
