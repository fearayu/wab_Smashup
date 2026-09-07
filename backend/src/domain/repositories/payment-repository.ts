import type { CreatePaymentInput, Payment, PaymentListQuery, VerifyPaymentInput } from '../entities/payment'

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>
  findByBookingId(bookingId: string): Promise<Payment | null>
  findByQuery(query: PaymentListQuery): Promise<Payment[]>
  create(input: CreatePaymentInput): Promise<Payment>
  update(id: string, input: VerifyPaymentInput & { verifiedBy?: string; verifiedAt?: string }): Promise<Payment | null>
}
