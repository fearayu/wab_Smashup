import type { CreateNotificationInput, Notification } from '../domain/entities/notification'
import { ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { NotificationRepository } from '../domain/repositories/notification-repository'

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async list(userId: string, unreadOnly: boolean): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId, unreadOnly)
  }

  async unreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByUserId(userId)
  }

  async create(input: CreateNotificationInput, sessionUserId: string): Promise<Notification> {
    if (!input.title?.trim()) throw new ValidationError('title is required')

    // Any logged-in user can create a notification for themselves. The caller
    // may also target another user (internal services notifying on behalf of
    // the platform), so userId is honored when supplied.
    const userId = input.userId?.trim() || sessionUserId
    if (!userId) throw new ValidationError('userId is required')

    return this.notificationRepository.create({
      userId,
      title: input.title.trim(),
      body: input.body ?? '',
      type: input.type ?? 'system',
      link: input.link ?? '',
    })
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id)
    if (!notification) throw new NotFoundError('Notification')
    if (notification.userId !== userId) throw new ForbiddenError()

    // Idempotent: re-reading an already-read notification is a no-op.
    if (notification.read) return notification

    const updated = await this.notificationRepository.markRead(id, new Date().toISOString())
    if (!updated) throw new NotFoundError('Notification')
    return updated
  }

  async markAllRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllRead(userId, new Date().toISOString())
  }
}