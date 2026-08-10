import type { Context } from 'hono'
import type { CreateVenueInput, UpdateVenueInput } from '../domain/entities/venue'
import { ValidationError } from '../domain/errors'
import type { VenueService } from '../services/venue-service'

export class VenueHandler {
  constructor(private readonly venueService: VenueService) {}

  list = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const venues = await this.venueService.listByOwner(ownerId)
    return c.json({ data: venues })
  }

  get = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const venue = await this.venueService.getById(this.param(c, 'id'), ownerId)
    return c.json({ data: venue })
  }

  create = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await this.parseJson<CreateVenueInput>(c)
    const venue = await this.venueService.create(body, ownerId)
    return c.json({ data: venue }, 201)
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await this.parseJson<UpdateVenueInput>(c)
    const venue = await this.venueService.update(this.param(c, 'id'), body, ownerId)
    return c.json({ data: venue })
  }

  delete = async (c: Context) => {
    const ownerId = c.get('ownerId')
    await this.venueService.delete(this.param(c, 'id'), ownerId)
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
