import type { MatchPlayer, MatchmakingSearch } from '../entities/matchmaking'

export interface MatchmakingRepository {
  listPlayers(): Promise<MatchPlayer[]>
  createSearch(search: MatchmakingSearch): Promise<MatchmakingSearch>
  listByUser(userId: string): Promise<MatchmakingSearch[]>
}