import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import { errorResponseSchema, idParamSchema } from '../schemas/common-schemas'
import {
  createNotificationSchema,
  markAllReadResponseSchema,
  notificationListQuerySchema,
  notificationListResponseSchema,
  notificationResponseSchema,
  unreadCountResponseSchema,
} from '../schemas/notification-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createNotificationRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Notifications'],
      summary: 'List current user notifications, newest first',
      description: 'Pass ?unreadOnly=true to filter to unread notifications.',
      responses: {
        200: { description: 'Notifications list', content: jsonContent(notificationListResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('query', notificationListQuerySchema),
    (c) => c.get('container').notificationHandler.list(c)
  )

  router.get(
    '/unread-count',
    describeRoute({
      tags: ['Notifications'],
      summary: 'Count unread notifications for current user',
      responses: {
        200: { description: 'Unread count', content: jsonContent(unreadCountResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').notificationHandler.unreadCount(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Notifications'],
      summary: 'Create a notification',
      description: 'Used internally by other services. userId defaults to the session user when omitted.',
      responses: {
        201: { description: 'Notification created', content: jsonContent(notificationResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', createNotificationSchema),
    (c) => c.get('container').notificationHandler.create(c)
  )

  router.post(
    '/read-all',
    describeRoute({
      tags: ['Notifications'],
      summary: 'Mark all own notifications as read',
      responses: {
        200: { description: 'Number of notifications marked read', content: jsonContent(markAllReadResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').notificationHandler.markAllRead(c)
  )

  router.post(
    '/:id/read',
    describeRoute({
      tags: ['Notifications'],
      summary: 'Mark a single notification as read',
      responses: {
        200: { description: 'Notification marked read', content: jsonContent(notificationResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        403: { description: 'Forbidden (notification belongs to another user)', content: jsonContent(errorResponseSchema) },
        404: { description: 'Notification not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    (c) => c.get('container').notificationHandler.markRead(c)
  )

  return router
}