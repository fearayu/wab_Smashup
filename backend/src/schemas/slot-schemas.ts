import z from 'zod'

export const slotSchema = z.object({
  id: z.uuid(),
  courtId: z.uuid(),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int(),
  price: z.number().int(),
  isAvailable: z.boolean(),
  isPeak: z.boolean(),
  bookingId: z.uuid().nullable(),
})

export const generateSlotsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).default('22:00'),
  slotDurationMinutes: z.number().int().min(30).max(120).default(60),
})

export const publicSlotSchema = z.object({
  id: z.uuid(),
  slotTime: z.string(),
  durationMinutes: z.number().int(),
  price: z.number().int(),
  isAvailable: z.boolean(),
  isPeak: z.boolean(),
})

export const publicSlotsResponseSchema = z.object({
  data: z.object({
    venue: z.object({
      id: z.uuid(),
      name: z.string(),
      slug: z.string(),
      primaryColor: z.string(),
    }),
    courts: z.array(z.object({
      id: z.uuid(),
      name: z.string(),
      slots: z.array(publicSlotSchema),
    })),
  }),
})

export const slotResponseSchema = z.object({
  data: slotSchema,
})

export const generateSlotsResponseSchema = z.object({
  data: z.object({ inserted: z.number().int() }),
})
