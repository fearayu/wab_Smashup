export interface MatchSearchInput {
  myLevel: string
  playDate?: string
  playTime: string
  maxDistance?: string
}

export interface MatchPlayer {
  id: string
  username: string
  name: string
  level: string
  bucket: string
  label: string
  levelSource: { source: string; label: string } | null
  distanceKm: number | null
  distanceLabel: string
  time: string
  format: 'single' | 'double'
  fake: boolean
}

export interface ScoredCandidate extends MatchPlayer {
  total: number
  skill: number
  schedule: number
  travel: number
  gap: number
  reasons: string[]
}

export interface MatchmakingSearch {
  id: string
  userId: string
  myLevel: string
  playDate: string | null
  playTime: string
  maxDistance: string
  results: ScoredCandidate[]
  createdAt: string
}

// Full ladder values (port of shared/match-core.js levelRank) — single-letter
// aliases collapse onto the combined tiers so they never score as rank 0.
export const LEVEL_VALUES: Record<string, number> = {
  N: 1,
  'S/BG': 2,
  'P-': 3,
  P: 4,
  'P+': 5,
  C: 6,
  'C+': 7,
  'B/B+': 8,
  'A/Pro': 9,
}

const ALIAS: Record<string, string> = {
  A: 'A/Pro',
  'A+': 'A/Pro',
  B: 'B/B+',
  'B+': 'B/B+',
}

export function levelRank(code: string | null | undefined): number {
  const c = code == null ? '' : ALIAS[code] ?? code
  const value = LEVEL_VALUES[c]
  return value !== undefined ? value : 0
}

// Coarse bucket used for the filter dropdown (mirrors shared/match-core.js bucket).
export function levelBucket(levelCode: string): 'beginner' | 'intermediate' | 'advanced' {
  const rank = levelRank(levelCode)
  if (rank <= 3) return 'beginner'
  if (rank <= 6) return 'intermediate'
  return 'advanced'
}

export const BUCKET_LABEL: Record<'beginner' | 'intermediate' | 'advanced', string> = {
  beginner: 'มือใหม่',
  intermediate: 'ระดับกลาง',
  advanced: 'ระดับสูง',
}