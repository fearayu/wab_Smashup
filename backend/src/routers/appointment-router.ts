import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import { errorResponseSchema, idParamSchema } from '../schemas/common-schemas'
import { appointmentListResponseSchema, appointmentResponseSchema, appointmentStatsResponseSchema, respondSchema, sendAppointmentSchema } from '../schemas/appointment-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createAppointmentRouter() {
  const router = new Hono<AppEnv>()
  router.use('*', authMiddleware)
  router.get('/received', describeRoute({ tags: ['Appointments'], summary: 'Received pending invites', responses: { 200: { description: 'Received invites', content: jsonContent(appointmentListResponseSchema) } } }), (c) => c.get('container').appointmentHandler.received(c))
  router.get('/sent', describeRoute({ tags: ['Appointments'], summary: 'Sent pending invites', responses: { 200: { description: 'Sent invites', content: jsonContent(appointmentListResponseSchema) } } }), (c) => c.get('container').appointmentHandler.sent(c))
  router.get('/schedule', describeRoute({ tags: ['Appointments'], summary: 'My appointment schedule', responses: { 200: { description: 'Appointment schedule', content: jsonContent(appointmentListResponseSchema) } } }), (c) => c.get('container').appointmentHandler.schedule(c))
  router.get('/stats', describeRoute({ tags: ['Appointments'], summary: 'Appointment stats', responses: { 200: { description: 'Appointment stats', content: jsonContent(appointmentStatsResponseSchema) } } }), (c) => c.get('container').appointmentHandler.stats(c))
  router.post('/', describeRoute({ tags: ['Appointments'], summary: 'Send an appointment invite', responses: { 201: { description: 'Invite created', content: jsonContent(appointmentResponseSchema) }, 400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) } } }), v('json', sendAppointmentSchema), (c) => c.get('container').appointmentHandler.send(c))
  router.post('/:id/respond', describeRoute({ tags: ['Appointments'], summary: 'Accept or decline an invite', responses: { 200: { description: 'Invite updated', content: jsonContent(appointmentResponseSchema) } } }), v('param', idParamSchema), v('json', respondSchema), (c) => c.get('container').appointmentHandler.accept(c))
  router.post('/:id/cancel', describeRoute({ tags: ['Appointments'], summary: 'Cancel an invite', responses: { 200: { description: 'Invite cancelled', content: jsonContent(appointmentResponseSchema) } } }), v('param', idParamSchema), (c) => c.get('container').appointmentHandler.cancel(c))
  return router
}