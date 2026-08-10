import type { Context } from 'hono'
import type { CreateCourtInput, UpdateCourtInput } from '../domain/entities/court'
import { ValidationError } from '../domain/errors'
import type { CourtService } from '../services/court-service'

export class CourtHandler {
  constructor(private readonly courtService: CourtService) {}

  listByVenue = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const courts = await this.courtService.listByVenue(this.param(c, 'venue_id'), ownerId)
    return c.json({ data: courts })
  }

  create = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await this.parseJson<CreateCourtInput>(c)
    const court = await this.courtService.create(this.param(c, 'venue_id'), body, ownerId)
    return c.json({ data: court }, 201)
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await this.parseJson<UpdateCourtInput>(c)
    const court = await this.courtService.update(this.param(c, 'id'), body, ownerId)
    return c.json({ data: court })
  }

  delete = async (c: Context) => {
    const ownerId = c.get('ownerId')
    await this.courtService.delete(this.param(c, 'id'), ownerId)
    return c.body(null, 204)
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
