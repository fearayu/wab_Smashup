import type { DashboardSummary } from '../entities/dashboard'

export interface DashboardRepository {
  getSummary(ownerId: string): Promise<DashboardSummary>
}
