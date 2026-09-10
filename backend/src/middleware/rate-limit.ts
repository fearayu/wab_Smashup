import { createMiddleware } from 'hono/factory'
import { TooManyRequestsError } from '../domain/errors'
import type { AppEnv } from '../types'

const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 10
const buckets = new Map<string, number[]>()

// Best-effort in-memory sliding-window limiter. On Workers this is per-isolate,
// not global across all isolates, but it still stops single-client brute force.
export function rateLimitAuth() {
  return createMiddleware<AppEnv>(async (c, next) => {
    const key =
      c.req.header('CF-Connecting-IP') ??
      c.req.header('x-real-ip') ??
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown'
    const now = Date.now()

    const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
    if (recent.length >= MAX_ATTEMPTS) {
      throw new TooManyRequestsError('Too many attempts, please try again later')
    }

    recent.push(now)
    buckets.set(key, recent)

    // Periodic cleanup: remove stale entries from all buckets
    if (buckets.size > 100) {
      for (const [k, times] of buckets) {
        const fresh = times.filter((t) => now - t < WINDOW_MS)
        if (fresh.length === 0) buckets.delete(k)
        else buckets.set(k, fresh)
      }
    }

    await next()
  })
}