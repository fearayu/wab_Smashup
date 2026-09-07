import type { CreatePaymentInput, Payment, PaymentListQuery, VerifyPaymentInput } from '../../domain/entities/payment'
import type { PaymentRepository } from '../../domain/repositories/payment-repository'

export class MemoryPaymentRepository implements PaymentRepository {
  private readonly payments = new Map<string, Payment>()

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    return [...this.payments.values()].find((p) => p.bookingId === bookingId) ?? null
  }

  async findByQuery(query: PaymentListQuery): Promise<Payment[]> {
    let items = [...this.payments.values()]
    if (query.status) items = items.filter((p) => p.status === query.status)
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const payment: Payment = {
      id,
      bookingId: input.bookingId,
      amount: input.amount,
      slipImageUrl: input.slipImageUrl ?? null,
      status: 'pending',
      verifiedBy: null,
      verifiedAt: null,
      bankHint: null,
      referenceHint: null,
      createdAt: now,
      updatedAt: now,
    }
    this.payments.set(id, payment)
    return payment
  }

  async update(id: string, input: VerifyPaymentInput & { verifiedBy?: string; verifiedAt?: string }): Promise<Payment | null> {
    const existing = this.payments.get(id)
    if (!existing) return null
    const updated: Payment = {
      ...existing,
      status: input.status,
      verifiedBy: input.verifiedBy ?? null,
      verifiedAt: input.verifiedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.payments.set(id, updated)
    return updated
  }
}
