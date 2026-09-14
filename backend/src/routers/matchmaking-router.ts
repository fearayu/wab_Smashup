import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import { errorResponseSchema } from '../schemas/common-schemas'
import {
  matchSearchInputSchema,
  mySearchesResponseSchema,
  searchResponseSchema,
} from '../schemas/matchmaking-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createMatchmakingRouter() {
  const router = new Hono<AppEnv>()

  router.post(
    '/search',
    describeRoute({
      tags: ['Matchmaking'],
      summary: 'Score candidate players against my level/time/distance preferences',
      description: 'Read-only scored view over registered players. Results are saved to the search history.',
      responses: {
        200: { description: 'Scored candidates and saved search', content: jsonContent(searchResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', matchSearchInputSchema),
    (c) => c.get('container').matchmakingHandler.search(c)
  )

  router.get(
    '/searches',
    describeRoute({
      tags: ['Matchmaking'],
      summary: 'List saved matchmaking searches for the current user',
      responses: {
        200: { description: 'Saved searches', content: jsonContent(mySearchesResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').matchmakingHandler.mySearches(c)
  )

  return router
}