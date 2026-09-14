import type { Notification, NotificationInput, NotificationType } from '../../domain/entities/notification'
import type { NotificationRepository } from '../../domain/repositories/notification-repository'

interface NotificationRow {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  link: string | null
  read: number
  created_at: string
  read_at: string | null
}

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    type: row.type as NotificationType,
    link: row.link ?? '',
    read: row.read === 1,
    createdAt: row.created_at,
    readAt: row.read_at,
  }
}

export class D1NotificationRepository implements NotificationRepository {
  constructor(private readonly db: D1Database) {}

  async findByUserId(userId: string, unreadOnly = false): Promise<Notification[]> {
    const unreadClause = unreadOnly ? ' AND read = 0' : ''
    const { results } = await this.db
      .prepare(`SELECT id, user_id, title, body, type, link, read, created_at, read_at FROM notifications WHERE user_id = ?${unreadClause} ORDER BY created_at DESC`)
      .bind(userId)
      .all<NotificationRow>()
    return results.map(toNotification)
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await this.db
      .prepare('SELECT id, user_id, title, body, type, link, read, created_at, read_at FROM notifications WHERE id = ?')
      .bind(id)
      .first<NotificationRow>()
    return row ? toNotification(row) : null
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    const row = await this.db
      .prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read = 0')
      .bind(userId)
      .first<{ count: number }>()
    return Number(row?.count ?? 0)
  }

  async create(input: NotificationInput): Promise<Notification> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO notifications (id, user_id, title, body, type, link, read, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.userId, input.title, input.body, input.type, input.link, 0, now, null)
      .run()
    return {
      id,
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      link: input.link,
      read: false,
      createdAt: now,
      readAt: null,
    }
  }

  async markRead(id: string, readAt: string): Promise<Notification | null> {
    await this.db
      .prepare('UPDATE notifications SET read = 1, read_at = ? WHERE id = ?')
      .bind(readAt, id)
      .run()
    return this.findById(id)
  }

  async markAllRead(userId: string, readAt: string): Promise<number> {
    const result = await this.db
      .prepare('UPDATE notifications SET read = 1, read_at = ? WHERE user_id = ? AND read = 0')
      .bind(readAt, userId)
      .run()
    return result.meta.changes
  }
}