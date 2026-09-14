import type { Context } from 'hono'
import type { CreateTournamentInput, RegisterTournamentInput } from '../domain/entities/tournament'
import { ValidationError } from '../domain/errors'
import type { TournamentService } from '../services/tournament-service'
import { getJsonBody, param } from './http-utils'

function numberParam(c: Context, name: string): number {
  const value = Number(param(c, name))
  return value
}

export class TournamentHandler {
  constructor(private readonly tournamentService: TournamentService) {}

  create = async (c: Context) => {
    const body = await getJsonBody<CreateTournamentInput>(c)
    const tournament = await this.tournamentService.create(body)
    return c.json({ data: tournament }, 201)
  }

  list = async (c: Context) => {
    const tournaments = await this.tournamentService.list()
    return c.json({ data: tournaments })
  }

  get = async (c: Context) => {
    const tournament = await this.tournamentService.get(param(c, 'id'))
    return c.json({ data: tournament })
  }

  remove = async (c: Context) => {
    const result = await this.tournamentService.remove(param(c, 'id'))
    return c.json({ data: result })
  }

  register = async (c: Context) => {
    const userId = c.get('ownerId')
    if (!userId) throw new ValidationError('ownerId not set')
    const body = await getJsonBody<RegisterTournamentInput>(c)
    const tournament = await this.tournamentService.register(param(c, 'id'), body, userId)
    return c.json({ data: tournament }, 201)
  }

  cancelRegistration = async (c: Context) => {
    const tournament = await this.tournamentService.cancelRegistration(
      param(c, 'id'),
      param(c, 'regId')
    )
    return c.json({ data: tournament })
  }

  buildBracket = async (c: Context) => {
    const body = await getJsonBody<{ category: string }>(c)
    const tournament = await this.tournamentService.buildBracket(param(c, 'id'), body.category)
    return c.json({ data: tournament })
  }

  getBrackets = async (c: Context) => {
    const rounds = await this.tournamentService.getBrackets(param(c, 'id'), param(c, 'category'))
    return c.json({ data: rounds })
  }

  setWinner = async (c: Context) => {
    const body = await getJsonBody<{ winnerSlot: 1 | 2; score: string }>(c)
    const tournament = await this.tournamentService.setWinner(
      param(c, 'id'),
      param(c, 'category'),
      numberParam(c, 'round'),
      numberParam(c, 'position'),
      body.winnerSlot,
      body.score
    )
    return c.json({ data: tournament })
  }

  rankings = async (c: Context) => {
    const rankings = await this.tournamentService.rankings(param(c, 'id'), param(c, 'category'))
    return c.json({ data: rankings })
  }
}