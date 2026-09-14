import type { Notification, NotificationInput } from '../entities/notification'

export interface NotificationRepository {
  findByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]>
  findById(id: string): Promise<Notification | null>
  countUnreadByUserId(userId: string): Promise<number>
  create(input: NotificationInput): Promise<Notification>
  markRead(id: string, readAt: string): Promise<Notification | null>
  markAllRead(userId: string, readAt: string): Promise<number>
}