import type { Context } from 'hono'
import type { CreateVenueInput, UpdateVenueInput } from '../domain/entities/venue'
import type { VenueService } from '../services/venue-service'
import { getJsonBody, param } from './http-utils'

export class VenueHandler {
  constructor(private readonly venueService: VenueService) {}

  list = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const venues = await this.venueService.listByOwner(ownerId)
    return c.json({ data: venues })
  }

  get = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const venue = await this.venueService.getById(param(c, 'id'), ownerId)
    return c.json({ data: venue })
  }

  create = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<CreateVenueInput>(c)
    const venue = await this.venueService.create(body, ownerId)
    return c.json({ data: venue }, 201)
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    const body = await getJsonBody<UpdateVenueInput>(c)
    const venue = await this.venueService.update(param(c, 'id'), body, ownerId)
    return c.json({ data: venue })
  }

  delete = async (c: Context) => {
    const ownerId = c.get('ownerId')
    await this.venueService.delete(param(c, 'id'), ownerId)
    return c.body(null, 204)
  }
}
