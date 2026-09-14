import type { Context } from 'hono'
import type { MatchSearchInput } from '../domain/entities/matchmaking'
import { ValidationError } from '../domain/errors'
import type { MatchmakingService } from '../services/matchmaking-service'
import { getJsonBody } from './http-utils'

export class MatchmakingHandler {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  search = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const body = await getJsonBody<MatchSearchInput>(c)
    const result = await this.matchmakingService.search(userId, body)
    return c.json({ data: result })
  }

  mySearches = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const searches = await this.matchmakingService.mySearches(userId)
    return c.json({ data: searches })
  }
}