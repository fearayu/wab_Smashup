export const slotListCacheKey = (courtId: string, date: string) => `slots:${courtId}:${date}`

export interface CacheRepository {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}
