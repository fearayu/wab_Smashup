import type { CreatePaymentInput, Payment, PaymentListQuery, VerifyPaymentInput } from '../../domain/entities/payment'
import type { PaymentRepository } from '../../domain/repositories/payment-repository'

interface PaymentRow {
  id: string
  booking_id: string
  amount: number
  slip_image_url: string | null
  status: string
  verified_by: string | null
  verified_at: string | null
  bank_hint: string | null
  reference_hint: string | null
  created_at: string
  updated_at: string
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    bookingId: row.booking_id,
    amount: row.amount,
    slipImageUrl: row.slip_image_url,
    status: row.status as Payment['status'],
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    bankHint: row.bank_hint,
    referenceHint: row.reference_hint,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1PaymentRepository implements PaymentRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<Payment | null> {
    const row = await this.db
      .prepare('SELECT id, booking_id, amount, slip_image_url, status, verified_by, verified_at, bank_hint, reference_hint, created_at, updated_at FROM payments WHERE id = ?')
      .bind(id)
      .first<PaymentRow>()
    return row ? toPayment(row) : null
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    const row = await this.db
      .prepare('SELECT id, booking_id, amount, slip_image_url, status, verified_by, verified_at, bank_hint, reference_hint, created_at, updated_at FROM payments WHERE booking_id = ?')
      .bind(bookingId)
      .first<PaymentRow>()
    return row ? toPayment(row) : null
  }

  async findByQuery(query: PaymentListQuery): Promise<Payment[]> {
    let sql = `
      SELECT p.id, p.booking_id, p.amount, p.slip_image_url, p.status, p.verified_by, p.verified_at, p.bank_hint, p.reference_hint, p.created_at, p.updated_at
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      WHERE 1=1`
    const params: (string | number)[] = []

    if (query.status) {
      sql += ' AND p.status = ?'
      params.push(query.status)
    }
    if (query.venueId) {
      sql += ' AND b.venue_id = ?'
      params.push(query.venueId)
    }

    sql += ' ORDER BY p.created_at DESC'

    const { results } = await this.db.prepare(sql).bind(...params).all<PaymentRow>()
    return results.map(toPayment)
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO payments (id, booking_id, amount, slip_image_url, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.bookingId, input.amount, input.slipImageUrl ?? null, 'pending', now, now)
      .run()
    return {
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
  }

  async update(id: string, input: VerifyPaymentInput & { verifiedBy?: string; verifiedAt?: string }): Promise<Payment | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const now = new Date().toISOString()
    const verifiedAt = input.verifiedAt ?? now

    await this.db
      .prepare('UPDATE payments SET status = ?, verified_by = ?, verified_at = ?, updated_at = ? WHERE id = ?')
      .bind(input.status, input.verifiedBy ?? null, verifiedAt, now, id)
      .run()

    return { ...existing, status: input.status, verifiedBy: input.verifiedBy ?? null, verifiedAt, updatedAt: now }
  }
}
