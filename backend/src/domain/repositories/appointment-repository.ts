import type { Appointment, AppointmentInput, AppointmentStatus } from '../entities/appointment'

export interface AppointmentRepository {
  create(input: AppointmentInput): Promise<Appointment>
  findById(id: string): Promise<Appointment | null>
  findByReceiver(receiverId: string): Promise<Appointment[]>
  findBySender(senderId: string): Promise<Appointment[]>
  findByParticipant(userId: string): Promise<Appointment[]>
  findDuplicate(senderId: string, receiverId: string, date: string): Promise<Appointment | null>
  expirePending(expiredBefore: string): Promise<Appointment[]>
  updateStatus(id: string, status: AppointmentStatus, at: string): Promise<Appointment | null>
}