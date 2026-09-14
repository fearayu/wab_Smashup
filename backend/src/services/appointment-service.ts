import type { Appointment, RespondAction, SendAppointmentInput } from '../domain/entities/appointment'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../domain/errors'
import type { AppointmentRepository } from '../domain/repositories/appointment-repository'
import type { UserRepository } from '../domain/repositories/user-repository'

export class AppointmentService {
  INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly userRepository: UserRepository
  ) {}

  async send(input: SendAppointmentInput, senderId: string, senderName: string): Promise<Appointment> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new ValidationError('date must be in YYYY-MM-DD format')
    const sender = await this.userRepository.findById(senderId)
    const name = sender?.displayName?.trim() || sender?.name?.trim() || senderName.trim() || 'Player'

    const receiver = await this.userRepository.findById(input.receiverId)
    if (!receiver) throw new NotFoundError('User')
    if (receiver.id === senderId) throw new ValidationError('cannot send an invite to yourself')

    // Clean stale pending invites (7-day auto-cancel) before the duplicate
    // check so an expired invite does not block a fresh one.
    const now = new Date().toISOString()
    await this.appointmentRepository.expirePending(now)

    const duplicate = await this.appointmentRepository.findDuplicate(senderId, input.receiverId, input.date)
    if (duplicate) throw new ConflictError('มีคำเชิญรอดำเนินการสำหรับคู่นี้และวันนี้แล้ว')

    return this.appointmentRepository.create({
      senderId,
      senderName: name,
      receiverId: input.receiverId,
      receiverName: receiver.displayName?.trim() || receiver.name,
      date: input.date,
      time: input.time,
      court: input.court ?? '',
      note: input.note ?? '',
    })
  }

  async respond(id: string, action: RespondAction, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) throw new NotFoundError('Appointment')
    if (appointment.receiverId !== userId) throw new ForbiddenError()
    if (appointment.status !== 'pending') throw new ValidationError('ไม่สามารถตอบคำเชิญที่ปิดรับแล้ว')

    const now = new Date().toISOString()
    if (new Date(appointment.expiresAt).getTime() <= Date.now()) {
      await this.appointmentRepository.expirePending(now)
      throw new ValidationError('คำเชิญหมดอายุแล้ว')
    }

    const status = action === 'accept' ? 'accepted' : 'declined'
    const updated = await this.appointmentRepository.updateStatus(id, status, now)
    if (!updated) throw new NotFoundError('Appointment')
    return updated
  }

  async cancel(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) throw new NotFoundError('Appointment')
    if (appointment.senderId !== userId) throw new ForbiddenError()
    if (appointment.status !== 'pending') throw new ValidationError('ไม่สามารถยกเลิกคำเชิญที่ปิดรับแล้ว')

    const updated = await this.appointmentRepository.updateStatus(id, 'cancelled', new Date().toISOString())
    if (!updated) throw new NotFoundError('Appointment')
    return updated
  }

  async expireOld(): Promise<number> {
    const expired = await this.appointmentRepository.expirePending(new Date().toISOString())
    return expired.length
  }

  async myReceived(userId: string): Promise<Appointment[]> {
    await this.expireOld()
    const items = await this.appointmentRepository.findByReceiver(userId)
    return items.filter((a) => a.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async mySent(userId: string): Promise<Appointment[]> {
    await this.expireOld()
    const items = await this.appointmentRepository.findBySender(userId)
    return items.filter((a) => a.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async mySchedule(userId: string): Promise<Appointment[]> {
    await this.expireOld()
    const items = await this.appointmentRepository.findByParticipant(userId)
    return items
      .filter((a) => a.status === 'accepted' || a.status === 'pending')
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))
  }

  async stats(userId: string): Promise<{ pending: number; accepted: number; total: number }> {
    await this.expireOld()
    const items = await this.appointmentRepository.findByParticipant(userId)
    return {
      pending: items.filter((a) => a.status === 'pending' && a.receiverId === userId).length,
      accepted: items.filter((a) => a.status === 'accepted').length,
      total: items.length,
    }
  }
}