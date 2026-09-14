import z from 'zod'
import {
  REGISTRATION_STATUSES,
  TOURNAMENT_EVENTS,
  TOURNAMENT_STATUSES,
  TOURNAMENT_TYPES,
} from '../domain/entities/tournament'

// HTTP contract schemas for /api/v1/tournaments — used by routers for
// validation (hono-openapi validator) and OpenAPI spec generation.
// Keep in sync with the domain entity.

export const bracketPlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  level: z.string(),
})

export const bracketMatchSchema = z.object({
  id: z.string().min(1),
  category: z.string(),
  round: z.number().int(),
  position: z.number().int(),
  player1: bracketPlayerSchema.nullable(),
  player2: bracketPlayerSchema.nullable(),
  winnerSlot: z.union([z.literal(1), z.literal(2)]).nullable(),
  score: z.string().nullable(),
})

export const bracketRoundSchema = z.object({
  round: z.number().int(),
  name: z.string().nullable(),
  matches: z.array(bracketMatchSchema),
})

export const tournamentRegistrationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string(),
  category: z.enum(TOURNAMENT_TYPES),
  event: z.enum(TOURNAMENT_EVENTS),
  level: z.string(),
  partner: z.string().nullable(),
  status: z.enum(REGISTRATION_STATUSES),
  createdAt: z.iso.datetime(),
})

export const tournamentSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  event: z.enum(TOURNAMENT_EVENTS),
  status: z.enum(TOURNAMENT_STATUSES),
  categories: z.array(z.enum(TOURNAMENT_TYPES)),
  registrations: z.array(tournamentRegistrationSchema),
  brackets: z.record(z.string(), z.array(bracketRoundSchema)),
  startedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})

export const createTournamentSchema = z.object({
  name: z.string().min(1).max(200),
  event: z.string().optional(),
  categories: z.array(z.string()).min(1).optional(),
})

export const registerTournamentSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1).max(100),
  level: z.string().max(20).optional(),
  partner: z.string().max(100).optional(),
})

export const setWinnerSchema = z.object({
  winnerSlot: z.union([z.literal(1), z.literal(2)]),
  score: z.string().max(50),
})

export const buildBracketSchema = z.object({
  category: z.string().min(1),
})

export const rankingsSchema = z.array(
  z.object({
    rank: z.number().int(),
    id: z.string(),
    name: z.string(),
    level: z.string(),
  })
)

export const tournamentIdParamSchema = z.object({
  id: z.string().min(1),
})

export const cancelRegistrationParamSchema = z.object({
  id: z.string().min(1),
  regId: z.string().min(1),
})

export const bracketCategoryParamSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
})

export const winnerParamSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  round: z.coerce.number().int(),
  position: z.coerce.number().int(),
})

export const tournamentResponseSchema = z.object({
  data: tournamentSchema,
})

export const tournamentListResponseSchema = z.object({
  data: z.array(tournamentSchema),
})

export const bracketRoundsResponseSchema = z.object({
  data: z.array(bracketRoundSchema),
})

export const rankingsResponseSchema = z.object({
  data: rankingsSchema,
})

export const deleteTournamentResponseSchema = z.object({
  data: z.object({ deleted: z.boolean() }),
})