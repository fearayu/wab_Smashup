// Notification types mirror the frontend demo contract (shared/notifications.js).
export const NOTIFICATION_TYPES = ['booking', 'invite', 'tournament', 'system'] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: NotificationType
  link: string
  read: boolean
  createdAt: string // ISO 8601
  readAt: string | null // ISO 8601, set when read becomes true
}

// Fully-resolved input accepted by repositories.
export interface NotificationInput {
  userId: string
  title: string
  body: string
  type: NotificationType
  link: string
}

// What the HTTP layer accepts. userId/body/type/link are optional:
// userId defaults to the session user, the rest default like the demo
// (empty body, 'system' type, empty link).
export type CreateNotificationInput = Partial<Pick<NotificationInput, 'userId' | 'body' | 'type' | 'link'>> &
  Pick<NotificationInput, 'title'>