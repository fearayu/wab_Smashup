import type {
  MatchPlayer,
  MatchSearchInput,
  MatchmakingSearch,
  ScoredCandidate,
} from '../domain/entities/matchmaking'
import { levelRank } from '../domain/entities/matchmaking'
import type { MatchmakingRepository } from '../domain/repositories/matchmaking-repository'

// Rule-based scoring ported from shared/match-core.js (NOT a model, NOT a
// success guarantee). Weights: skill 70%, free-time closeness 15%, distance 15%.

function skillScore(myLevel: string, otherLevel: string): number {
  const gap = Math.abs(levelRank(myLevel) - levelRank(otherLevel))
  if (gap === 0) return 100
  if (gap === 1) return 65
  return 30
}

function timeScore(myTime: string, otherTime: string): number {
  if (!myTime || !otherTime) return 50
  const a = Number(String(myTime).slice(0, 2))
  const b = Number(String(otherTime).slice(0, 2))
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 50
  if (a === b) return 100
  return Math.max(40, 100 - Math.abs(a - b) * 15)
}

// Travel distance against an optional max distance. Backend users carry no
// distance data: unknown distance is a no-penalty 100, never fabricated.
function travelScore(maxDistance: string, distanceKm: number | null): number {
  if (distanceKm === null) return 100
  const max = Number(maxDistance)
  if (!Number.isFinite(max) || max <= 0) return 100
  if (distanceKm > max) return 0
  return Math.max(0, Math.round(100 - (distanceKm / max) * 100))
}

function scoreCandidate(
  myLevel: string,
  myTime: string,
  maxDistance: string,
  candidate: MatchPlayer
): ScoredCandidate {
  const skill = skillScore(myLevel, candidate.level)
  const schedule = timeScore(myTime, candidate.time)
  const travel = travelScore(maxDistance, candidate.distanceKm)
  const total = Math.round(skill * 0.7 + schedule * 0.15 + travel * 0.15)
  const gap = Math.abs(levelRank(myLevel) - levelRank(candidate.level))

  const reasons: string[] = []
  reasons.push(
    gap === 0 ? 'ระดับเดียวกัน' : gap === 1 ? 'ระดับใกล้เคียง (ต่าง 1 ชั้น)' : 'ระดับต่างกันเกิน 1 ชั้น'
  )
  if (candidate.time && myTime) {
    reasons.push(
      String(candidate.time).slice(0, 2) === String(myTime).slice(0, 2)
        ? 'เวลาที่สะดวกตรงกัน'
        : 'เวลาที่สะดวกใกล้กัน'
    )
  } else {
    reasons.push('ยังไม่ระบุเวลาที่สะดวก')
  }
  if (candidate.distanceKm == null) reasons.push('ยังไม่ระบุระยะทาง')
  else reasons.push('ระยะทาง ' + candidate.distanceKm + ' กม.')

  return { ...candidate, total, skill, schedule, travel, gap, reasons }
}

const TOP_RESULTS = 20

export class MatchmakingService {
  constructor(private readonly matchmakingRepository: MatchmakingRepository) {}

  async search(
    userId: string,
    input: MatchSearchInput
  ): Promise<{ candidates: ScoredCandidate[]; saved: MatchmakingSearch }> {
    const players = await this.matchmakingRepository.listPlayers()
    const myLevel = input.myLevel ?? ''
    const myTime = input.playTime ?? ''
    const maxDistance = input.maxDistance ?? '20'

    const candidates = players
      .filter((p) => p.id !== userId)
      .map((p) => scoreCandidate(myLevel, myTime, maxDistance, p))
      .sort((a, b) => b.total - a.total)
      .slice(0, TOP_RESULTS)

    const search: MatchmakingSearch = {
      id: crypto.randomUUID(),
      userId,
      myLevel,
      playDate: input.playDate ?? null,
      playTime: myTime,
      maxDistance,
      results: candidates,
      createdAt: new Date().toISOString(),
    }
    const saved = await this.matchmakingRepository.createSearch(search)
    return { candidates, saved }
  }

  async mySearches(userId: string): Promise<MatchmakingSearch[]> {
    return this.matchmakingRepository.listByUser(userId)
  }
}