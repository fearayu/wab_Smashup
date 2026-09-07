import type { Context } from 'hono'
import type { CreateCourtInput, UpdateCourtInput } from '../domain/entities/court'
import type { CourtService } from '../services/court-service'
import { getJsonBody, param } from './http-utils'

export class CourtHandler {
  constructor(private readonly courtService: CourtService) {}

  listByVenue = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const courts = await this.courtService.listByVenue(param(c, 'venue_id'), ownerId)
    return c.json({ data: courts })
  }

  create = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<CreateCourtInput>(c)
    const court = await this.courtService.create(param(c, 'venue_id'), body, ownerId)
    return c.json({ data: court }, 201)
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<UpdateCourtInput>(c)
    const court = await this.courtService.update(param(c, 'id'), body, ownerId)
    return c.json({ data: court })
  }

  delete = async (c: Context) => {
    const ownerId = c.get('ownerId')
    await this.courtService.delete(param(c, 'id'), ownerId)
    return c.body(null, 204)
  }
}
