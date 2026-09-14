import type {
  BracketMatch,
  BracketPlayer,
  BracketRound,
  CreateTournamentInput,
  RegisterTournamentInput,
  Tournament,
  TournamentRegistration,
} from '../domain/entities/tournament'
import { TOURNAMENT_EVENTS, TOURNAMENT_TYPES } from '../domain/entities/tournament'
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'

// Level ladder used for seeding (port of shared/tournament.js rankOf). Aliases
// (A/A+/B/B+) collapse onto the combined tiers; unknown levels seed at 0.
const LEVEL_VALUES: Record<string, number> = {
  N: 1,
  D: 2,
  'S/BG': 2,
  'P-': 3,
  P: 4,
  'P+': 5,
  C: 6,
  'C+': 7,
  B: 8,
  'B+': 8,
  'B/B+': 8,
  A: 9,
  'A+': 9,
  'A/Pro': 9,
}

const ROUND_NAMES: Record<number, string | null> = {
  0: null,
  1: null,
  2: 'รอบ 16',
  3: 'รอบก่อนรองชนะเลิศ',
  4: 'รอบรองชนะเลิศ',
  5: 'รอบชิงชนะเลิศ',
}

const MAX_CAPACITY = 64

function rankOf(level: string | undefined): number {
  if (!level) return 0
  return LEVEL_VALUES[level] ?? 0
}

function freshId(): string {
  return 'TN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5)
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const left = a[i]!
    a[i] = a[j]!
    a[j] = left
  }
  return a
}

// Sort by level (strongest first); players of the same level are shuffled.
function seedByLevel(players: BracketPlayer[]): BracketPlayer[] {
  const groups = new Map<number, BracketPlayer[]>()
  for (const p of players) {
    const r = rankOf(p.level)
    const list = groups.get(r)
    if (list) list.push(p)
    else groups.set(r, [p])
  }
  const out: BracketPlayer[] = []
  ;[...groups.keys()]
    .sort((a, b) => b - a)
    .forEach((r) => out.push(...shuffle(groups.get(r)!)))
  return out
}

// Standard bracket slots so top seeds never meet early: seed 1 at slot 0,
// seed 2 at slot n-1, seed 3 middle-top, seed 4 middle-bottom, ...
function seedOrder(n: number): number[] {
  let order = [0, 1]
  let size = 2
  while (size < n) {
    const next: number[] = []
    for (let i = 0; i < order.length; i += 2) {
      const a = order[i]!
      next.push(a, 2 * size - 1 - a, size + a, 2 * size - 1 - (size + a))
    }
    order = next
    size *= 2
  }
  return order
}

export class TournamentService {
  constructor(private readonly tournamentRepository: TournamentRepository) {}

  async create(input: CreateTournamentInput): Promise<Tournament> {
    const name = String(input.name || '').trim()
    if (!name) throw new ValidationError('กรุณาระบุชื่อการแข่งขัน')

    const event = String(input.event || '').trim() || TOURNAMENT_EVENTS[0]
    if (!TOURNAMENT_EVENTS.includes(event as (typeof TOURNAMENT_EVENTS)[number])) {
      throw new ValidationError('เลือกรายการแข่งขัน')
    }

    const existing = await this.tournamentRepository.findAll()
    if (
      existing.some(
        (t) => t.event === event && t.status !== 'deleted' && t.status !== 'completed'
      )
    ) {
      throw new ConflictError('มีการแข่งขันรายการนี้กำลังเปิดรับสมัครหรือแข่งอยู่แล้ว')
    }

    const tournament: Tournament = {
      id: freshId(),
      name,
      event,
      status: 'registration',
      categories: input.categories && input.categories.length > 0 ? input.categories : [...TOURNAMENT_TYPES],
      registrations: [],
      brackets: {},
      startedAt: null,
      createdAt: new Date().toISOString(),
    }
    return this.tournamentRepository.create(tournament)
  }

  async list(): Promise<Tournament[]> {
    const all = await this.tournamentRepository.findAll()
    return all.filter((t) => t.status !== 'deleted')
  }

  async get(id: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(id)
    if (!tournament) throw new NotFoundError('Tournament')
    return tournament
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const tournament = await this.tournamentRepository.findById(id)
    if (!tournament) throw new NotFoundError('Tournament')
    const ok = await this.tournamentRepository.delete(id)
    if (!ok) throw new NotFoundError('Tournament')
    return { deleted: true }
  }

  async register(
    tournamentId: string,
    input: RegisterTournamentInput,
    userId: string
  ): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId)
    if (!tournament) throw new NotFoundError('Tournament')
    if (tournament.status !== 'registration') throw new ValidationError('ปิดรับสมัครแล้ว')

    const category = String(input.category || '').trim()
    if (!tournament.categories.includes(category)) throw new ValidationError('เลือกประเภทแข่งขัน')

    if (category === 'คู่ผสม' && !String(input.partner || '').trim()) {
      throw new ValidationError('ประเภทคู่ผสมต้องระบุชื่อคู่เล่น')
    }

    const same = tournament.registrations.filter(
      (r) => r.category === category && r.event === tournament.event && r.status !== 'cancelled'
    )
    if (same.some((r) => r.userId === userId)) throw new ConflictError('คุณลงชื่อประเภทนี้ไว้แล้ว')
    if (same.length >= MAX_CAPACITY) throw new ConflictError('ประเภทนี้เต็มแล้ว')

    const name = String(input.name || '').trim()
    if (!name) throw new ValidationError('กรุณาระบุชื่อผู้สมัคร')

    const reg: TournamentRegistration = {
      id: freshId(),
      userId,
      name,
      category,
      event: tournament.event,
      level: input.level ?? '',
      partner: category === 'คู่ผสม' ? String(input.partner || '').trim() : null,
      status: 'registered',
      createdAt: new Date().toISOString(),
    }
    const updated = await this.tournamentRepository.addRegistration(tournamentId, reg)
    if (!updated) throw new NotFoundError('Tournament')
    return updated
  }

  async cancelRegistration(tournamentId: string, regId: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId)
    if (!tournament) throw new NotFoundError('Tournament')
    if (tournament.status !== 'registration') {
      throw new ValidationError('ไม่สามารถยกเลิกได้หลังจากจัดสายการแข่งขันแล้ว')
    }
    const reg = tournament.registrations.find((r) => r.id === regId)
    if (!reg) throw new NotFoundError('Registration')
    if (reg.status === 'cancelled') throw new ValidationError('ยกเลิกไปแล้ว')

    const cancelled: TournamentRegistration = { ...reg, status: 'cancelled' }
    const updated = await this.tournamentRepository.updateRegistration(tournamentId, cancelled)
    if (!updated) throw new NotFoundError('Tournament')
    return updated
  }

  async buildBracket(tournamentId: string, category: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId)
    if (!tournament) throw new NotFoundError('Tournament')
    if (tournament.status === 'completed' || tournament.status === 'deleted') {
      throw new ValidationError('การแข่งขันนี้เสร็จสิ้นแล้ว')
    }
    if (!tournament.categories.includes(category)) throw new ValidationError('เลือกประเภทแข่งขัน')

    const regs = tournament.registrations.filter(
      (r) => r.category === category && r.status !== 'cancelled'
    )
    if (regs.length < 2) throw new ValidationError('สมาชิกไม่เพียงพอต่อการจับสาย')

    const seeded = seedByLevel(
      regs.map((r) => ({ id: r.userId, name: r.name, level: r.level }))
    )
    const size = 1 << Math.ceil(Math.log2(seeded.length))
    const arranged: Array<BracketPlayer | null> = new Array(size).fill(null)
    seedOrder(size).forEach((slot, idx) => {
      if (idx < seeded.length) arranged[slot] = seeded[idx]!
    })

    const rounds: BracketRound[] = []
    const totalRounds = Math.log2(size)
    for (let r = 0; r < totalRounds; r++) {
      const count = size >> (r + 1)
      const matches: BracketMatch[] = []
      for (let m = 0; m < count; m++) {
        const match: BracketMatch = {
          id: freshId(),
          category,
          round: r,
          position: m,
          player1: null,
          player2: null,
          winnerSlot: null,
          score: null,
        }
        if (r === 0) {
          match.player1 = arranged[m * 2] ?? null
          match.player2 = arranged[m * 2 + 1] ?? null
          if (!match.player1 && match.player2) {
            match.winnerSlot = 2
            match.score = 'BYE'
          } else if (match.player1 && !match.player2) {
            match.winnerSlot = 1
            match.score = 'BYE'
          }
        }
        matches.push(match)
      }
      rounds.push({ round: r, name: ROUND_NAMES[r] || 'รอบ ' + (r + 1), matches })
    }

    for (let r = 0; r < totalRounds - 1; r++) {
      rounds[r]!.matches.forEach((m, i) => {
        if (m.winnerSlot) {
          const winner = m.winnerSlot === 1 ? m.player1 : m.player2
          const nextM = rounds[r + 1]!.matches[Math.floor(i / 2)]!
          if (i % 2 === 0) nextM.player1 = winner
          else nextM.player2 = winner
        }
      })
    }

    tournament.brackets[category] = rounds
    tournament.status = 'in-progress'
    tournament.startedAt = new Date().toISOString()
    const updated = await this.tournamentRepository.update(tournamentId, tournament)
    if (!updated) throw new NotFoundError('Tournament')
    return updated
  }

  async setWinner(
    tournamentId: string,
    category: string,
    round: number,
    position: number,
    winnerSlot: 1 | 2,
    score: string
  ): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId)
    if (!tournament) throw new NotFoundError('Tournament')
    const rounds = tournament.brackets[category]
    if (!rounds) throw new NotFoundError('Bracket')
    if (round < 0 || round >= rounds.length) throw new ValidationError('รอบไม่ถูกต้อง')

    const m = rounds[round]!.matches[position]
    if (!m) throw new ValidationError('ไม่พบคู่แข่ง')
    if (!m.player1 || !m.player2) throw new ValidationError('คู่นี้ยังไม่มีผู้เล่นครบทั้งสองฝั่ง')
    if (winnerSlot !== 1 && winnerSlot !== 2) throw new ValidationError('เลือกฝั่งผู้ชนะ')

    m.winnerSlot = winnerSlot
    m.score = String(score || '')

    if (round + 1 < rounds.length) {
      const winner = winnerSlot === 1 ? m.player1 : m.player2
      const nextM = rounds[round + 1]!.matches[Math.floor(position / 2)]!
      if (position % 2 === 0) nextM.player1 = winner
      else nextM.player2 = winner
    }

    if (round === rounds.length - 1) tournament.status = 'completed'

    tournament.brackets[category] = rounds
    const updated = await this.tournamentRepository.update(tournamentId, tournament)
    if (!updated) throw new NotFoundError('Tournament')
    return updated
  }

  async getBrackets(tournamentId: string, category: string): Promise<BracketRound[]> {
    const tournament = await this.tournamentRepository.findById(tournamentId)
    if (!tournament) throw new NotFoundError('Tournament')
    return tournament.brackets[category] ?? []
  }

  async rankings(
    tournamentId: string,
    category: string
  ): Promise<Array<{ rank: number; id: string; name: string; level: string }>> {
    const tournament = await this.tournamentRepository.findById(tournamentId)
    if (!tournament) throw new NotFoundError('Tournament')
    const rounds = tournament.brackets[category]
    if (!rounds) return []

    const results: Array<{ rank: number; id: string; name: string; level: string }> = []
    const final = rounds[rounds.length - 1]!.matches[0]
    if (final && final.winnerSlot) {
      const winner = final.winnerSlot === 1 ? final.player1 : final.player2
      const loser = final.winnerSlot === 1 ? final.player2 : final.player1
      if (winner) results.push({ rank: 1, ...winner })
      if (loser) results.push({ rank: 2, ...loser })
    }

    if (rounds.length >= 2) {
      rounds[rounds.length - 2]!.matches.forEach((m) => {
        if (m.winnerSlot && m.player1 && m.player2) {
          const loser = m.winnerSlot === 1 ? m.player2 : m.player1
          if (loser) results.push({ rank: 3, ...loser })
        }
      })
    }
    return results
  }
}