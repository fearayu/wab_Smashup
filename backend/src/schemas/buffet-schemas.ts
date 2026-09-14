import z from 'zod'
import { BUFFET_STATUSES } from '../domain/entities/buffet'

export const buffetSchema = z.object({
  id: z.uuid(), userId: z.string(), name: z.string(), phone: z.string(), date: z.string(), session: z.string(),
  level: z.string(), levelSource: z.string(), note: z.string(), shuttle: z.number().int(), amount: z.number().int(),
  group: z.string(), status: z.enum(BUFFET_STATUSES), paymentStatus: z.string(), queueNumber: z.number().int().nullable(),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
})
export const createBuffetSchema = z.object({ name: z.string().min(1), phone: z.string().min(9), date: z.string(), session: z.string(), level: z.string().optional(), levelSource: z.string().optional(), note: z.string().max(500).optional(), shuttle: z.number().int().optional(), amount: z.number().int().optional(), group: z.string().optional() })
export const buffetResponseSchema = z.object({ data: buffetSchema })
export const buffetListResponseSchema = z.object({ data: z.array(buffetSchema) })
