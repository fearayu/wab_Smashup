import type { BracketRound, Tournament, TournamentRegistration } from '../../domain/entities/tournament'
import type { TournamentRepository } from '../../domain/repositories/tournament-repository'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// Reference implementation for runtimes without D1 (AWS Lambda, local tests).
// Entries are mutated through clones so callers never corrupt the store.
export class MemoryTournamentRepository implements TournamentRepository {
  private readonly tournaments = new Map<string, Tournament>()

  async create(tournament: Tournament): Promise<Tournament> {
    this.tournaments.set(tournament.id, clone(tournament))
    return clone(tournament)
  }

  async findAll(): Promise<Tournament[]> {
    return [...this.tournaments.values()].map(clone)
  }

  async findById(id: string): Promise<Tournament | null> {
    const tournament = this.tournaments.get(id)
    return tournament ? clone(tournament) : null
  }

  async update(id: string, tournament: Tournament): Promise<Tournament | null> {
    if (!this.tournaments.has(id)) return null
    this.tournaments.set(id, clone(tournament))
    return clone(tournament)
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.tournaments.get(id)
    if (!existing) return false
    this.tournaments.set(id, { ...existing, status: 'deleted' })
    return true
  }

  private upsertRegistration(tournamentId: string, reg: TournamentRegistration): Tournament | null {
    const existing = this.tournaments.get(tournamentId)
    if (!existing) return null
    const registrations = existing.registrations.some((r) => r.id === reg.id)
      ? existing.registrations.map((r) => (r.id === reg.id ? clone(reg) : r))
      : [...existing.registrations, clone(reg)]
    this.tournaments.set(tournamentId, { ...existing, registrations })
    return clone(this.tournaments.get(tournamentId)!)
  }

  async addRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null> {
    return this.upsertRegistration(tournamentId, reg)
  }

  async updateRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null> {
    return this.upsertRegistration(tournamentId, reg)
  }

  async saveBrackets(tournamentId: string, category: string, rounds: BracketRound[]): Promise<void> {
    const existing = this.tournaments.get(tournamentId)
    if (!existing) return
    this.tournaments.set(tournamentId, {
      ...existing,
      brackets: { ...existing.brackets, [category]: clone(rounds) },
    })
  }

  async getBrackets(tournamentId: string, category: string): Promise<BracketRound[] | null> {
    const existing = this.tournaments.get(tournamentId)
    if (!existing) return null
    const rounds = existing.brackets[category]
    return rounds ? clone(rounds) : null
  }
}