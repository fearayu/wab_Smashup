import z from 'zod'

export const bookingSchema = z.object({
  id: z.uuid(),
  venueId: z.uuid(),
  courtId: z.uuid(),
  timeSlotIds: z.array(z.uuid()),
  playerName: z.string(),
  playerPhone: z.string(),
  playerEmail: z.string().nullable(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  totalAmount: z.number().int(),
  notes: z.string().nullable(),
  createdAt: z.iso.datetime(),
})

export const createBookingSchema = z.object({
  venueId: z.uuid(),
  courtId: z.uuid(),
  timeSlotIds: z.array(z.uuid()).min(1).max(4),
  playerName: z.string().min(1).max(100),
  playerPhone: z.string().regex(/^0[0-9]{8,9}$/),
  playerEmail: z.email().optional(),
  notes: z.string().max(500).optional(),
})

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().optional(),
})

export const bookingListQuerySchema = z.object({
  venue_id: z.uuid().optional(),
  status: z.string().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const bookingListResponseSchema = z.object({
  data: z.object({
    items: z.array(bookingSchema),
    total: z.number().int(),
  }),
})

export const bookingResponseSchema = z.object({
  data: bookingSchema,
})

export const publicBookingResponseSchema = z.object({
  data: z.object({
    id: z.uuid(),
    venueId: z.uuid(),
    courtId: z.uuid(),
    timeSlotIds: z.array(z.uuid()),
    playerName: z.string(),
    playerPhone: z.string(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
    totalAmount: z.number().int(),
    createdAt: z.iso.datetime(),
    payment: z.object({
      id: z.uuid(),
      amount: z.number().int(),
      status: z.string(),
      uploadUrl: z.string().nullable(),
    }),
  }),
})
