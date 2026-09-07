import z from 'zod'

export const venueSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  primaryColor: z.string(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const createVenueSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(30),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const updateVenueSchema = createVenueSchema.partial()

export const venueListResponseSchema = z.object({
  data: z.array(venueSchema),
})

export const venueResponseSchema = z.object({
  data: venueSchema,
})
