import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware } from '../middleware/auth'
import { errorResponseSchema, idParamSchema } from '../schemas/common-schemas'
import {
  bracketCategoryParamSchema,
  bracketRoundsResponseSchema,
  buildBracketSchema,
  cancelRegistrationParamSchema,
  createTournamentSchema,
  deleteTournamentResponseSchema,
  rankingsResponseSchema,
  registerTournamentSchema,
  setWinnerSchema,
  tournamentListResponseSchema,
  tournamentResponseSchema,
  winnerParamSchema,
} from '../schemas/tournament-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createTournamentRouter() {
  const router = new Hono<AppEnv>()

  router.post(
    '/',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Create a tournament',
      responses: {
        201: { description: 'Tournament created', content: jsonContent(tournamentResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        409: { description: 'An open tournament already exists for this event', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', createTournamentSchema),
    (c) => c.get('container').tournamentHandler.create(c)
  )

  router.get(
    '/',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'List tournaments (excludes deleted)',
      responses: {
        200: { description: 'Tournaments list', content: jsonContent(tournamentListResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').tournamentHandler.list(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Get a tournament',
      responses: {
        200: { description: 'Tournament found', content: jsonContent(tournamentResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    (c) => c.get('container').tournamentHandler.get(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Delete a tournament (marks status deleted)',
      responses: {
        200: { description: 'Tournament deleted', content: jsonContent(deleteTournamentResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    (c) => c.get('container').tournamentHandler.remove(c)
  )

  router.post(
    '/:id/register',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Register the current user for a tournament category',
      responses: {
        201: { description: 'Registration added', content: jsonContent(tournamentResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament not found', content: jsonContent(errorResponseSchema) },
        409: { description: 'Already registered or category full', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    v('json', registerTournamentSchema),
    (c) => c.get('container').tournamentHandler.register(c)
  )

  router.post(
    '/:id/registrations/:regId/cancel',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Cancel a tournament registration',
      responses: {
        200: { description: 'Registration cancelled', content: jsonContent(tournamentResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament or registration not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', cancelRegistrationParamSchema),
    (c) => c.get('container').tournamentHandler.cancelRegistration(c)
  )

  router.post(
    '/:id/brackets',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Build/rebuild a seeded single-elimination bracket for a category',
      responses: {
        200: { description: 'Bracket built, tournament now in-progress', content: jsonContent(tournamentResponseSchema) },
        400: { description: 'Invalid input or too few members', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    v('json', buildBracketSchema),
    (c) => c.get('container').tournamentHandler.buildBracket(c)
  )

  router.get(
    '/:id/brackets/:category',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Get the bracket rounds for a category',
      responses: {
        200: { description: 'Bracket rounds (empty if not built yet)', content: jsonContent(bracketRoundsResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', bracketCategoryParamSchema),
    (c) => c.get('container').tournamentHandler.getBrackets(c)
  )

  router.post(
    '/:id/brackets/:category/:round/:position/winner',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Record a match winner; winner auto-advances to the next round',
      responses: {
        200: { description: 'Winner recorded', content: jsonContent(tournamentResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament or bracket not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', winnerParamSchema),
    v('json', setWinnerSchema),
    (c) => c.get('container').tournamentHandler.setWinner(c)
  )

  router.get(
    '/:id/rankings/:category',
    describeRoute({
      tags: ['Tournaments'],
      summary: 'Rankings (1/2/3) for a tournament category',
      responses: {
        200: { description: 'Rankings', content: jsonContent(rankingsResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'Tournament not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', bracketCategoryParamSchema),
    (c) => c.get('container').tournamentHandler.rankings(c)
  )

  return router
}