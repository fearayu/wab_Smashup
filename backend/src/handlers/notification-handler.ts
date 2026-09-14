import type { Context } from 'hono'
import type { CreateNotificationInput } from '../domain/entities/notification'
import { ValidationError } from '../domain/errors'
import type { NotificationService } from '../services/notification-service'
import { getJsonBody, param } from './http-utils'

export class NotificationHandler {
  constructor(private readonly notificationService: NotificationService) {}

  list = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const unreadOnly = c.req.query('unreadOnly') === 'true'
    const notifications = await this.notificationService.list(userId, unreadOnly)
    return c.json({ data: notifications })
  }

  unreadCount = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const count = await this.notificationService.unreadCount(userId)
    return c.json({ data: { count } })
  }

  create = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const body = await getJsonBody<CreateNotificationInput>(c)
    const notification = await this.notificationService.create(body, userId)
    return c.json({ data: notification }, 201)
  }

  markRead = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const notification = await this.notificationService.markRead(param(c, 'id'), userId)
    return c.json({ data: notification })
  }

  markAllRead = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const count = await this.notificationService.markAllRead(userId)
    return c.json({ data: { count } })
  }
}