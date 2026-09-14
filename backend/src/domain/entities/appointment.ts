// Appointment invites mirror the frontend demo contract (shared/appointments.js).
export const APPOINTMENT_STATUSES = ['pending', 'accepted', 'declined', 'cancelled', 'auto-cancelled'] as const

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export interface Appointment {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  date: string // YYYY-MM-DD
  time: string
  court: string
  note: string
  status: AppointmentStatus
  createdAt: string // ISO 8601
  expiresAt: string // ISO 8601
  acceptedAt: string | null // ISO 8601, set when accepted
  declinedAt: string | null // ISO 8601, set when declined
  cancelledAt: string | null // ISO 8601, set when cancelled / auto-cancelled
}

// Fully-resolved input accepted by repositories.
export interface AppointmentInput {
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  date: string
  time: string
  court: string
  note: string
}

// What the HTTP layer accepts. senderId/senderName come from the session.
export interface SendAppointmentInput {
  receiverId: string
  date: string
  time: string
  court?: string
  note?: string
}

export type RespondAction = 'accept' | 'decline'