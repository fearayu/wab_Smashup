import type {
  BracketRound,
  Tournament,
  TournamentRegistration,
} from '../entities/tournament'

export interface TournamentRepository {
  create(tournament: Tournament): Promise<Tournament>
  findAll(): Promise<Tournament[]>
  findById(id: string): Promise<Tournament | null>
  /** Replaces the aggregate (registrations + brackets recomputed in memory then re-saved). */
  update(id: string, tournament: Tournament): Promise<Tournament | null>
  /** Marks the tournament status 'deleted'. */
  delete(id: string): Promise<boolean>
  addRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null>
  updateRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null>
  saveBrackets(tournamentId: string, category: string, rounds: BracketRound[]): Promise<void>
  getBrackets(tournamentId: string, category: string): Promise<BracketRound[] | null>
}