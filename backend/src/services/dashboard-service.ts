import type { DashboardSummary } from '../domain/entities/dashboard'
import type { DashboardRepository } from '../domain/repositories/dashboard-repository'

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getSummary(ownerId: string): Promise<DashboardSummary> {
    return this.dashboardRepository.getSummary(ownerId)
  }
}
