import z from 'zod'
import { APPOINTMENT_STATUSES } from '../domain/entities/appointment'

// HTTP contract schemas for /api/v1/appointments — used by routers for
// validation (hono-openapi validator) and OpenAPI spec generation.
// Keep in sync with the domain entity.

export const appointmentSchema = z.object({
  id: z.uuid(),
  senderId: z.string().min(1),
  senderName: z.string(),
  receiverId: z.string().min(1),
  receiverName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string(),
  court: z.string(),
  note: z.string(),
  status: z.enum(APPOINTMENT_STATUSES),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  acceptedAt: z.iso.datetime().nullable(),
  declinedAt: z.iso.datetime().nullable(),
  cancelledAt: z.iso.datetime().nullable(),
})

export const sendAppointmentSchema = z.object({
  receiverId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1).max(50),
  court: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
})

export const respondSchema = z.object({
  action: z.enum(['accept', 'decline']),
})

export const appointmentListResponseSchema = z.object({
  data: z.array(appointmentSchema),
})

export const appointmentResponseSchema = z.object({
  data: appointmentSchema,
})

export const appointmentStatsSchema = z.object({
  pending: z.number().int(),
  accepted: z.number().int(),
  total: z.number().int(),
})

export const appointmentStatsResponseSchema = z.object({
  data: appointmentStatsSchema,
})