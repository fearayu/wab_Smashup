import z from 'zod'
import { NOTIFICATION_TYPES } from '../domain/entities/notification'

// HTTP contract schemas for /api/v1/notifications — used by routers for
// validation (hono-openapi validator) and OpenAPI spec generation.
// Keep in sync with the domain entity.

export const notificationSchema = z.object({
  id: z.uuid(),
  userId: z.string().min(1),
  title: z.string(),
  body: z.string(),
  type: z.enum(NOTIFICATION_TYPES),
  link: z.string(),
  read: z.boolean(),
  createdAt: z.iso.datetime(),
  readAt: z.iso.datetime().nullable(),
})

export const createNotificationSchema = z.object({
  // Prototype: userId is optional and defaults to the session user.
  userId: z.string().min(1).optional(),
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  link: z.string().max(1000).optional(),
})

export const notificationListQuerySchema = z.object({
  unreadOnly: z.enum(['true', 'false']).optional(),
})

export const notificationListResponseSchema = z.object({
  data: z.array(notificationSchema),
})

export const notificationResponseSchema = z.object({
  data: notificationSchema,
})

export const unreadCountResponseSchema = z.object({
  data: z.object({ count: z.number().int() }),
})

export const markAllReadResponseSchema = z.object({
  data: z.object({ count: z.number().int() }),
})