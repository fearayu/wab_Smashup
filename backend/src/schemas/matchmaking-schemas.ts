import z from 'zod'

// HTTP contract schemas for /api/v1/matchmaking — used by routers for
// validation (hono-openapi validator) and OpenAPI spec generation.
// Keep in sync with the domain entity.

export const matchSearchInputSchema = z.object({
  myLevel: z.string().max(20),
  playDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  playTime: z.string().max(20).optional(),
  maxDistance: z.string().max(10).optional(),
})

export const matchPlayerSchema = z.object({
  id: z.string().min(1),
  username: z.string(),
  name: z.string(),
  level: z.string(),
  bucket: z.string(),
  label: z.string(),
  levelSource: z.object({ source: z.string(), label: z.string() }).nullable(),
  distanceKm: z.number().nullable(),
  distanceLabel: z.string(),
  time: z.string(),
  format: z.enum(['single', 'double']),
  fake: z.boolean(),
})

export const scoredCandidateSchema = matchPlayerSchema.extend({
  total: z.number().int(),
  skill: z.number().int(),
  schedule: z.number().int(),
  travel: z.number().int(),
  gap: z.number().int(),
  reasons: z.array(z.string()),
})

export const matchmakingSearchSchema = z.object({
  id: z.uuid(),
  userId: z.string().min(1),
  myLevel: z.string(),
  playDate: z.string().nullable(),
  playTime: z.string(),
  maxDistance: z.string(),
  results: z.array(scoredCandidateSchema),
  createdAt: z.iso.datetime(),
})

export const searchResponseSchema = z.object({
  data: z.object({
    candidates: z.array(scoredCandidateSchema),
    saved: matchmakingSearchSchema,
  }),
})

export const mySearchesResponseSchema = z.object({
  data: z.array(matchmakingSearchSchema),
})