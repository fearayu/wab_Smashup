export const TOURNAMENT_TYPES = ['ชายเดี่ยว', 'หญิงเดี่ยว', 'คู่ผสม'] as const
export const TOURNAMENT_EVENTS = ['SMASHUP CHAMPIONSHIP #1', 'OPEN DOUBLES DAY'] as const
export const TOURNAMENT_STATUSES = ['registration', 'in-progress', 'completed', 'deleted'] as const
export const REGISTRATION_STATUSES = ['registered', 'cancelled'] as const

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number]
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]
export type TournamentCategory = (typeof TOURNAMENT_TYPES)[number]

export interface TournamentRegistration {
  id: string
  userId: string
  name: string
  category: string
  event: string
  level: string
  partner: string | null
  status: RegistrationStatus
  createdAt: string
}

export interface BracketPlayer {
  id: string
  name: string
  level: string
}

export interface BracketMatch {
  id: string
  category: string
  round: number
  position: number
  player1: BracketPlayer | null
  player2: BracketPlayer | null
  winnerSlot: 1 | 2 | null
  score: string | null
}

export interface BracketRound {
  round: number
  name: string | null
  matches: BracketMatch[]
}

export interface Tournament {
  id: string
  name: string
  event: string
  status: TournamentStatus
  categories: string[]
  registrations: TournamentRegistration[]
  brackets: Record<string, BracketRound[]>
  startedAt: string | null
  createdAt: string
}

export interface CreateTournamentInput {
  name: string
  event?: string
  categories?: string[]
}

export interface RegisterTournamentInput {
  category: string
  name: string
  level?: string
  partner?: string
}
