import type {
  BracketRound,
  Tournament,
  TournamentRegistration,
  TournamentStatus,
} from '../../domain/entities/tournament'
import type { TournamentRepository } from '../../domain/repositories/tournament-repository'

interface TournamentRow {
  id: string
  name: string
  event: string
  status: string
  categories: string
  started_at: string | null
  created_at: string
}

interface RegistrationRow {
  id: string
  tournament_id: string
  user_id: string
  name: string
  category: string
  event: string
  level: string
  partner: string | null
  status: string
  created_at: string
}

interface BracketRow {
  tournament_id: string
  category: string
  rounds: string
  updated_at: string
}

function parseCategories(raw: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid categories in tournaments row')
  }
  if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) return parsed
  throw new Error('Invalid categories in tournaments row')
}

function parseRounds(raw: string): BracketRound[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid rounds in tournament_brackets row')
  }
  if (Array.isArray(parsed)) return parsed as BracketRound[]
  throw new Error('Invalid rounds in tournament_brackets row')
}

function toRegistration(row: RegistrationRow): TournamentRegistration {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    event: row.event,
    level: row.level,
    partner: row.partner,
    status: row.status as TournamentRegistration['status'],
    createdAt: row.created_at,
  }
}

function toTournament(row: TournamentRow, regs: RegistrationRow[], brackets: BracketRow[]): Tournament {
  const bracketData: Record<string, BracketRound[]> = {}
  for (const b of brackets) bracketData[b.category] = parseRounds(b.rounds)
  return {
    id: row.id,
    name: row.name,
    event: row.event,
    status: row.status as TournamentStatus,
    categories: parseCategories(row.categories),
    registrations: regs.map(toRegistration),
    brackets: bracketData,
    startedAt: row.started_at,
    createdAt: row.created_at,
  }
}

export class D1TournamentRepository implements TournamentRepository {
  constructor(private readonly db: D1Database) {}

  private async hydrate(row: TournamentRow): Promise<Tournament> {
    const { results: regs } = await this.db
      .prepare(
        'SELECT id, tournament_id, user_id, name, category, event, level, partner, status, created_at FROM tournament_registrations WHERE tournament_id = ?'
      )
      .bind(row.id)
      .all<RegistrationRow>()
    const { results: brackets } = await this.db
      .prepare('SELECT tournament_id, category, rounds, updated_at FROM tournament_brackets WHERE tournament_id = ?')
      .bind(row.id)
      .all<BracketRow>()
    return toTournament(row, regs, brackets)
  }

  private static readonly TOURNAMENT_COLUMNS =
    'id, name, event, status, categories, started_at, created_at'

  async create(tournament: Tournament): Promise<Tournament> {
    await this.db
      .prepare(`INSERT INTO tournaments (${D1TournamentRepository.TOURNAMENT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        tournament.id,
        tournament.name,
        tournament.event,
        tournament.status,
        JSON.stringify(tournament.categories),
        tournament.startedAt,
        tournament.createdAt
      )
      .run()
    return tournament
  }

  async findAll(): Promise<Tournament[]> {
    const { results: rows } = await this.db
      .prepare(`SELECT ${D1TournamentRepository.TOURNAMENT_COLUMNS} FROM tournaments ORDER BY created_at DESC`)
      .all<TournamentRow>()
    if (rows.length === 0) return []
    const ids = rows.map((r) => r.id)
    const placeholders = ids.map(() => '?').join(',')
    const { results: regs } = await this.db
      .prepare(
        `SELECT id, tournament_id, user_id, name, category, event, level, partner, status, created_at FROM tournament_registrations WHERE tournament_id IN (${placeholders})`
      )
      .bind(...ids)
      .all<RegistrationRow>()
    const { results: brackets } = await this.db
      .prepare(
        `SELECT tournament_id, category, rounds, updated_at FROM tournament_brackets WHERE tournament_id IN (${placeholders})`
      )
      .bind(...ids)
      .all<BracketRow>()
    const regsByTournament = new Map<string, RegistrationRow[]>()
    for (const reg of regs) {
      const list = regsByTournament.get(reg.tournament_id)
      if (list) list.push(reg)
      else regsByTournament.set(reg.tournament_id, [reg])
    }
    const bracketsByTournament = new Map<string, BracketRow[]>()
    for (const bracket of brackets) {
      const list = bracketsByTournament.get(bracket.tournament_id)
      if (list) list.push(bracket)
      else bracketsByTournament.set(bracket.tournament_id, [bracket])
    }
    return rows.map((row) =>
      toTournament(row, regsByTournament.get(row.id) ?? [], bracketsByTournament.get(row.id) ?? [])
    )
  }

  async findById(id: string): Promise<Tournament | null> {
    const row = await this.db
      .prepare(`SELECT ${D1TournamentRepository.TOURNAMENT_COLUMNS} FROM tournaments WHERE id = ?`)
      .bind(id)
      .first<TournamentRow>()
    return row ? this.hydrate(row) : null
  }

  async update(id: string, tournament: Tournament): Promise<Tournament | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const now = new Date().toISOString()
    const statements: D1PreparedStatement[] = [
      this.db
        .prepare('UPDATE tournaments SET name = ?, event = ?, status = ?, categories = ?, started_at = ?, created_at = ? WHERE id = ?')
        .bind(
          tournament.name,
          tournament.event,
          tournament.status,
          JSON.stringify(tournament.categories),
          tournament.startedAt,
          tournament.createdAt,
          id
        ),
    ]

    const regIds = tournament.registrations.map((r) => r.id)
    if (regIds.length > 0) {
      const regPlaceholders = regIds.map(() => '?').join(',')
      statements.push(
        this.db
          .prepare(`DELETE FROM tournament_registrations WHERE tournament_id = ? AND id NOT IN (${regPlaceholders})`)
          .bind(id, ...regIds)
      )
      for (const reg of tournament.registrations) {
        statements.push(
          this.db
            .prepare(
              'INSERT OR REPLACE INTO tournament_registrations (id, tournament_id, user_id, name, category, event, level, partner, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )
            .bind(reg.id, id, reg.userId, reg.name, reg.category, reg.event, reg.level, reg.partner, reg.status, reg.createdAt)
        )
      }
    } else {
      statements.push(this.db.prepare('DELETE FROM tournament_registrations WHERE tournament_id = ?').bind(id))
    }

    const bracketCategories = Object.keys(tournament.brackets)
    if (bracketCategories.length > 0) {
      const categoryPlaceholders = bracketCategories.map(() => '?').join(',')
      statements.push(
        this.db
          .prepare(`DELETE FROM tournament_brackets WHERE tournament_id = ? AND category NOT IN (${categoryPlaceholders})`)
          .bind(id, ...bracketCategories)
      )
      for (const [category, rounds] of Object.entries(tournament.brackets)) {
        statements.push(
          this.db
            .prepare('INSERT OR REPLACE INTO tournament_brackets (tournament_id, category, rounds, updated_at) VALUES (?, ?, ?, ?)')
            .bind(id, category, JSON.stringify(rounds), now)
        )
      }
    } else {
      statements.push(this.db.prepare('DELETE FROM tournament_brackets WHERE tournament_id = ?').bind(id))
    }

    await this.db.batch(statements)
    return tournament
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE tournaments SET status = ? WHERE id = ?')
      .bind('deleted', id)
      .run()
    return result.meta.changes > 0
  }

  private async upsertRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null> {
    await this.db
      .prepare(
        'INSERT OR REPLACE INTO tournament_registrations (id, tournament_id, user_id, name, category, event, level, partner, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(reg.id, tournamentId, reg.userId, reg.name, reg.category, reg.event, reg.level, reg.partner, reg.status, reg.createdAt)
      .run()
    return this.findById(tournamentId)
  }

  async addRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null> {
    return this.upsertRegistration(tournamentId, reg)
  }

  async updateRegistration(tournamentId: string, reg: TournamentRegistration): Promise<Tournament | null> {
    return this.upsertRegistration(tournamentId, reg)
  }

  async saveBrackets(tournamentId: string, category: string, rounds: BracketRound[]): Promise<void> {
    await this.db
      .prepare('INSERT OR REPLACE INTO tournament_brackets (tournament_id, category, rounds, updated_at) VALUES (?, ?, ?, ?)')
      .bind(tournamentId, category, JSON.stringify(rounds), new Date().toISOString())
      .run()
  }

  async getBrackets(tournamentId: string, category: string): Promise<BracketRound[] | null> {
    const row = await this.db
      .prepare('SELECT rounds FROM tournament_brackets WHERE tournament_id = ? AND category = ?')
      .bind(tournamentId, category)
      .first<{ rounds: string }>()
    return row ? parseRounds(row.rounds) : null
  }
}