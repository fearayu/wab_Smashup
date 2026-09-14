import type { Notification, NotificationInput } from '../../domain/entities/notification'
import type { NotificationRepository } from '../../domain/repositories/notification-repository'

// Reference implementation for runtimes without D1 (AWS Lambda, local tests).
export class MemoryNotificationRepository implements NotificationRepository {
  private readonly notifications = new Map<string, Notification>()

  async findByUserId(userId: string, unreadOnly = false): Promise<Notification[]> {
    let items = [...this.notifications.values()].filter((n) => n.userId === userId)
    if (unreadOnly) items = items.filter((n) => !n.read)
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.get(id) ?? null
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return [...this.notifications.values()].filter((n) => n.userId === userId && !n.read).length
  }

  async create(input: NotificationInput): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      link: input.link,
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null,
    }
    this.notifications.set(notification.id, notification)
    return notification
  }

  async markRead(id: string, readAt: string): Promise<Notification | null> {
    const existing = this.notifications.get(id)
    if (!existing) return null
    const updated: Notification = { ...existing, read: true, readAt }
    this.notifications.set(id, updated)
    return updated
  }

  async markAllRead(userId: string, readAt: string): Promise<number> {
    let count = 0
    for (const [id, notification] of this.notifications) {
      if (notification.userId === userId && !notification.read) {
        this.notifications.set(id, { ...notification, read: true, readAt })
        count++
      }
    }
    return count
  }
}