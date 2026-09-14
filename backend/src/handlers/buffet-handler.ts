import type { Context } from 'hono'
import { ValidationError } from '../domain/errors'
import type { BuffetService } from '../services/buffet-service'
import { getJsonBody, param } from './http-utils'

export class BuffetHandler {
  constructor(private readonly buffetService: BuffetService) {}
  create = async (c: Context) => { const userId = c.get('ownerId'); if (!userId) throw new ValidationError('ownerId not set'); return c.json({ data: await this.buffetService.create(await getJsonBody(c), userId) }, 201) }
  mine = async (c: Context) => { const userId = c.get('ownerId'); if (!userId) throw new ValidationError('ownerId not set'); return c.json({ data: await this.buffetService.mine(userId) }) }
  list = async (c: Context) => c.json({ data: await this.buffetService.list(c.req.query('date') ?? '', c.req.query('session') ?? '') })
  cancel = async (c: Context) => { const userId = c.get('ownerId'); if (!userId) throw new ValidationError('ownerId not set'); return c.json({ data: await this.buffetService.cancel(param(c, 'id'), userId) }) }
}
