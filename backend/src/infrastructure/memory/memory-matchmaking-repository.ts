import type { MatchPlayer, MatchmakingSearch } from '../../domain/entities/matchmaking'
import type { MatchmakingRepository } from '../../domain/repositories/matchmaking-repository'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// Reference implementation for runtimes without D1 (AWS Lambda, local tests).
export class MemoryMatchmakingRepository implements MatchmakingRepository {
  private readonly searches = new Map<string, MatchmakingSearch>()

  constructor(private readonly players: MatchPlayer[] = []) {}

  async listPlayers(): Promise<MatchPlayer[]> {
    return this.players.map(clone)
  }

  async createSearch(search: MatchmakingSearch): Promise<MatchmakingSearch> {
    const stored = clone(search)
    this.searches.set(search.id, stored)
    return clone(search)
  }

  async listByUser(userId: string): Promise<MatchmakingSearch[]> {
    return [...this.searches.values()]
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone)
  }
}