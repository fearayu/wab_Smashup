import type { Context } from 'hono'
import { ValidationError } from '../domain/errors'
import type { DashboardService } from '../services/dashboard-service'

export class DashboardHandler {
  constructor(private readonly dashboardService: DashboardService) {}

  summary = async (c: Context) => {
    const ownerId = c.get('ownerId')
    if (!ownerId) throw new ValidationError('ownerId not set')
    const summary = await this.dashboardService.getSummary(ownerId)
    return c.json({ data: summary })
  }
}
