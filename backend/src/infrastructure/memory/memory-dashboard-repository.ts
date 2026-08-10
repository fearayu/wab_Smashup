import type { DashboardSummary } from '../../domain/entities/dashboard'
import type { DashboardRepository } from '../../domain/repositories/dashboard-repository'

export class MemoryDashboardRepository implements DashboardRepository {
  async getSummary(_ownerId: string): Promise<DashboardSummary> {
    return {
      todayBookings: 0,
      todayRevenue: 0,
      weekBookings: 0,
      weekRevenue: 0,
      pendingVerification: 0,
      occupancyRate: 0,
      peakHours: [],
    }
  }
}
