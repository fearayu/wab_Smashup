import type { Appointment, AppointmentInput, AppointmentStatus } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'

// Invites auto-cancel 7 days after being sent (shared/appointments.js INVITE_TTL_MS).
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface AppointmentRow {
  id: string
  sender_id: string
  sender_name: string
  receiver_id: string
  receiver_name: string
  date: string
  time: string
  court: string
  note: string
  status: string
  created_at: string
  expires_at: string
  accepted_at: string | null
  declined_at: string | null
  cancelled_at: string | null
}

function toAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    receiverId: row.receiver_id,
    receiverName: row.receiver_name,
    date: row.date,
    time: row.time,
    court: row.court,
    note: row.note,
    status: row.status as AppointmentStatus,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    cancelledAt: row.cancelled_at,
  }
}

export class D1AppointmentRepository implements AppointmentRepository {
  constructor(private readonly db: D1Database) {}

  async create(input: AppointmentInput): Promise<Appointment> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString()
    await this.db
      .prepare('INSERT INTO appointments (id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.senderId, input.senderName, input.receiverId, input.receiverName, input.date, input.time, input.court, input.note, 'pending', now, expiresAt, null, null, null)
      .run()
    return {
      id,
      senderId: input.senderId,
      senderName: input.senderName,
      receiverId: input.receiverId,
      receiverName: input.receiverName,
      date: input.date,
      time: input.time,
      court: input.court,
      note: input.note,
      status: 'pending',
      createdAt: now,
      expiresAt,
      acceptedAt: null,
      declinedAt: null,
      cancelledAt: null,
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.db
      .prepare('SELECT id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at FROM appointments WHERE id = ?')
      .bind(id)
      .first<AppointmentRow>()
    return row ? toAppointment(row) : null
  }

  async findByReceiver(receiverId: string): Promise<Appointment[]> {
    const { results } = await this.db
      .prepare('SELECT id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at FROM appointments WHERE receiver_id = ? ORDER BY created_at DESC')
      .bind(receiverId)
      .all<AppointmentRow>()
    return results.map(toAppointment)
  }

  async findBySender(senderId: string): Promise<Appointment[]> {
    const { results } = await this.db
      .prepare('SELECT id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at FROM appointments WHERE sender_id = ? ORDER BY created_at DESC')
      .bind(senderId)
      .all<AppointmentRow>()
    return results.map(toAppointment)
  }

  async findByParticipant(userId: string): Promise<Appointment[]> {
    const { results } = await this.db
      .prepare('SELECT id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at FROM appointments WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC')
      .bind(userId, userId)
      .all<AppointmentRow>()
    return results.map(toAppointment)
  }

  async findDuplicate(senderId: string, receiverId: string, date: string): Promise<Appointment | null> {
    const row = await this.db
      .prepare('SELECT id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at FROM appointments WHERE sender_id = ? AND receiver_id = ? AND date = ? AND status = ? ORDER BY created_at DESC LIMIT 1')
      .bind(senderId, receiverId, date, 'pending')
      .first<AppointmentRow>()
    return row ? toAppointment(row) : null
  }

  async expirePending(expiredBefore: string): Promise<Appointment[]> {
    const { results } = await this.db
      .prepare('SELECT id, sender_id, sender_name, receiver_id, receiver_name, date, time, court, note, status, created_at, expires_at, accepted_at, declined_at, cancelled_at FROM appointments WHERE status = ? AND expires_at <= ?')
      .bind('pending', expiredBefore)
      .all<AppointmentRow>()
    if (results.length === 0) return []
    await this.db
      .prepare("UPDATE appointments SET status = 'auto-cancelled', cancelled_at = ? WHERE status = 'pending' AND expires_at <= ?")
      .bind(expiredBefore, expiredBefore)
      .run()
    return results.map((row) => ({ ...toAppointment(row), status: 'auto-cancelled' as const, cancelledAt: expiredBefore }))
  }

  async updateStatus(id: string, status: AppointmentStatus, at: string): Promise<Appointment | null> {
    const acceptedAt = status === 'accepted' ? at : null
    const declinedAt = status === 'declined' ? at : null
    const cancelledAt = status === 'cancelled' ? at : null
    await this.db
      .prepare('UPDATE appointments SET status = ?, accepted_at = ?, declined_at = ?, cancelled_at = ? WHERE id = ?')
      .bind(status, acceptedAt, declinedAt, cancelledAt, id)
      .run()
    return this.findById(id)
  }
}