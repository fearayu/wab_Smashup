import z from 'zod'

export const courtSchema = z.object({
  id: z.uuid(),
  venueId: z.uuid(),
  name: z.string(),
  type: z.enum(['standard', 'premium']),
  hourlyRate: z.number().int(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.iso.datetime(),
})

export const createCourtSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['standard', 'premium']).default('standard'),
  hourlyRate: z.number().int().min(0).max(10000),
  sortOrder: z.number().int().optional(),
})

export const updateCourtSchema = createCourtSchema.partial()

export const courtListResponseSchema = z.object({
  data: z.array(courtSchema),
})

export const courtResponseSchema = z.object({
  data: courtSchema,
})
