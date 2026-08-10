import z from 'zod'

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const ownerSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  plan: z.enum(['free', 'pro']),
  onboardingCompleted: z.boolean(),
  role: z.enum(['admin', 'member', 'user']),
  createdAt: z.iso.datetime(),
})

export const loginResponseSchema = z.object({
  data: z.object({
    token: z.string(),
    owner: ownerSchema,
  }),
})

export const ownerResponseSchema = z.object({
  data: ownerSchema,
})

export const ownerListResponseSchema = z.object({
  data: z.array(ownerSchema),
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'user']),
})

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
