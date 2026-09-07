import z from 'zod'

export const siteConfigSchema = z.object({
  id: z.uuid(),
  venueId: z.uuid(),
  theme: z.enum(['default', 'dark', 'minimal']),
  heroImageUrl: z.string().nullable(),
  welcomeMessage: z.string().nullable(),
  showPricing: z.boolean(),
  showMap: z.boolean(),
  socialLinks: z.object({
    line: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).nullable(),
})

export const updateSiteConfigSchema = z.object({
  theme: z.enum(['default', 'dark', 'minimal']).optional(),
  heroImageUrl: z.string().url().optional(),
  welcomeMessage: z.string().max(500).optional(),
  showPricing: z.boolean().optional(),
  showMap: z.boolean().optional(),
  socialLinks: z.object({
    line: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
})

export const publicSiteResponseSchema = z.object({
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
      type: z.string(),
      hourlyRate: z.number().int(),
      isActive: z.boolean(),
    })),
    config: siteConfigSchema.nullable(),
  }),
})

export const siteConfigResponseSchema = z.object({
  data: siteConfigSchema,
})
