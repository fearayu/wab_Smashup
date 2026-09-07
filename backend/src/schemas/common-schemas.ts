import z from 'zod'

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})
