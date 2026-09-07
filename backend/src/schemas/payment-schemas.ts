import z from 'zod'

export const paymentSchema = z.object({
  id: z.uuid(),
  bookingId: z.uuid(),
  amount: z.number().int(),
  slipImageUrl: z.string().nullable(),
  status: z.enum(['pending', 'verified', 'rejected']),
  verifiedBy: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  bankHint: z.string().nullable(),
  referenceHint: z.string().nullable(),
  createdAt: z.iso.datetime(),
})

export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  reason: z.string().optional(),
})

export const paymentListQuerySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  venue_id: z.uuid().optional(),
})

export const paymentListResponseSchema = z.object({
  data: z.array(paymentSchema),
})

export const paymentResponseSchema = z.object({
  data: paymentSchema,
})
