import type { MatchPlayer, MatchmakingSearch } from '../../domain/entities/matchmaking'
import { levelBucket } from '../../domain/entities/matchmaking'
import type { MatchmakingRepository } from '../../domain/repositories/matchmaking-repository'

interface PlayerRow {
  id: string
  email: string
  name: string
  display_name: string | null
  level: string
}

function toMatchPlayer(row: PlayerRow): MatchPlayer {
  const name = row.display_name || row.name || row.email || 'ผู้เล่น'
  return {
    id: row.id,
    username: row.email ? row.email.split('@')[0] || name : name,
    name,
    level: row.level,
    bucket: levelBucket(row.level),
    label: '',
    levelSource: null,
    distanceKm: null,
    distanceLabel: 'ไม่ระบุระยะทาง',
    time: '',
    format: 'double',
    fake: false,
  }
}

interface SearchRow {
  id: string
  user_id: string
  my_level: string
  play_date: string | null
  play_time: string
  max_distance: string
  results: string
  created_at: string
}

function parseResults(raw: string): MatchmakingSearch['results'] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid results in matchmaking_searches row')
  }
  if (Array.isArray(parsed)) return parsed as MatchmakingSearch['results']
  throw new Error('Invalid results in matchmaking_searches row')
}

function toSearch(row: SearchRow): MatchmakingSearch {
  return {
    id: row.id,
    userId: row.user_id,
    myLevel: row.my_level,
    playDate: row.play_date,
    playTime: row.play_time,
    maxDistance: row.max_distance,
    results: parseResults(row.results),
    createdAt: row.created_at,
  }
}

export class D1MatchmakingRepository implements MatchmakingRepository {
  constructor(private readonly db: D1Database) {}

  async listPlayers(): Promise<MatchPlayer[]> {
    const { results } = await this.db
      .prepare(
        "SELECT id, email, name, display_name, level FROM users WHERE level IS NOT NULL AND level != ''"
      )
      .all<PlayerRow>()
    return results.map(toMatchPlayer)
  }

  async createSearch(search: MatchmakingSearch): Promise<MatchmakingSearch> {
    await this.db
      .prepare(
        'INSERT INTO matchmaking_searches (id, user_id, my_level, play_date, play_time, max_distance, results, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        search.id,
        search.userId,
        search.myLevel,
        search.playDate,
        search.playTime,
        search.maxDistance,
        JSON.stringify(search.results),
        search.createdAt
      )
      .run()
    return search
  }

  async listByUser(userId: string): Promise<MatchmakingSearch[]> {
    const { results } = await this.db
      .prepare(
        'SELECT id, user_id, my_level, play_date, play_time, max_distance, results, created_at FROM matchmaking_searches WHERE user_id = ? ORDER BY created_at DESC'
      )
      .bind(userId)
      .all<SearchRow>()
    return results.map(toSearch)
  }
}