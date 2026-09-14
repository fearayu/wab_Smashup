import type { Context } from 'hono'
import type { RespondAction, SendAppointmentInput } from '../domain/entities/appointment'
import { ValidationError } from '../domain/errors'
import type { AppointmentService } from '../services/appointment-service'
import { getJsonBody, param } from './http-utils'

export class AppointmentHandler {
  constructor(private readonly appointmentService: AppointmentService) {}

  send = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const body = await getJsonBody<SendAppointmentInput>(c)
    const appointment = await this.appointmentService.send(body, userId, c.get('ownerEmail') ?? '')
    return c.json({ data: appointment }, 201)
  }

  received = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const appointments = await this.appointmentService.myReceived(userId)
    return c.json({ data: appointments })
  }

  sent = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const appointments = await this.appointmentService.mySent(userId)
    return c.json({ data: appointments })
  }

  schedule = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const appointments = await this.appointmentService.mySchedule(userId)
    return c.json({ data: appointments })
  }

  stats = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const stats = await this.appointmentService.stats(userId)
    return c.json({ data: stats })
  }

  accept = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const body = await getJsonBody<{ action: RespondAction }>(c)
    const appointment = await this.appointmentService.respond(param(c, 'id'), body.action, userId)
    return c.json({ data: appointment })
  }

  decline = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const body = await getJsonBody<{ action: RespondAction }>(c)
    const appointment = await this.appointmentService.respond(param(c, 'id'), body.action, userId)
    return c.json({ data: appointment })
  }

  cancel = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const appointment = await this.appointmentService.cancel(param(c, 'id'), userId)
    return c.json({ data: appointment })
  }
}