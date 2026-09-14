import type { Appointment, AppointmentInput, AppointmentStatus } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'

// Invites auto-cancel 7 days after being sent (shared/appointments.js INVITE_TTL_MS).
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

// Reference implementation for runtimes without D1 (AWS Lambda, local tests).
export class MemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments = new Map<string, Appointment>()

  async create(input: AppointmentInput): Promise<Appointment> {
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      senderId: input.senderId,
      senderName: input.senderName,
      receiverId: input.receiverId,
      receiverName: input.receiverName,
      date: input.date,
      time: input.time,
      court: input.court,
      note: input.note,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
      acceptedAt: null,
      declinedAt: null,
      cancelledAt: null,
    }
    this.appointments.set(appointment.id, appointment)
    return appointment
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) ?? null
  }

  async findByReceiver(receiverId: string): Promise<Appointment[]> {
    return [...this.appointments.values()]
      .filter((a) => a.receiverId === receiverId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findBySender(senderId: string): Promise<Appointment[]> {
    return [...this.appointments.values()]
      .filter((a) => a.senderId === senderId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findByParticipant(userId: string): Promise<Appointment[]> {
    return [...this.appointments.values()]
      .filter((a) => a.senderId === userId || a.receiverId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findDuplicate(senderId: string, receiverId: string, date: string): Promise<Appointment | null> {
    return (
      [...this.appointments.values()]
        .filter((a) => a.senderId === senderId && a.receiverId === receiverId && a.date === date && a.status === 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    )
  }

  async expirePending(expiredBefore: string): Promise<Appointment[]> {
    const expired: Appointment[] = []
    for (const [id, appointment] of this.appointments) {
      if (appointment.status === 'pending' && appointment.expiresAt <= expiredBefore) {
        const updated: Appointment = { ...appointment, status: 'auto-cancelled', cancelledAt: expiredBefore }
        this.appointments.set(id, updated)
        expired.push(updated)
      }
    }
    return expired
  }

  async updateStatus(id: string, status: AppointmentStatus, at: string): Promise<Appointment | null> {
    const existing = this.appointments.get(id)
    if (!existing) return null
    const updated: Appointment = {
      ...existing,
      status,
      acceptedAt: status === 'accepted' ? at : null,
      declinedAt: status === 'declined' ? at : null,
      cancelledAt: status === 'cancelled' ? at : null,
    }
    this.appointments.set(id, updated)
    return updated
  }
}