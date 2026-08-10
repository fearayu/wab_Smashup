import type { DashboardSummary } from '../../domain/entities/dashboard'
import type { DashboardRepository } from '../../domain/repositories/dashboard-repository'

export class D1DashboardRepository implements DashboardRepository {
  constructor(private readonly db: D1Database) {}

  async getSummary(ownerId: string): Promise<DashboardSummary> {
    const today = new Date().toISOString().slice(0, 10)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + 'T00:00:00Z'

    const { results: venueRows } = await this.db
      .prepare('SELECT id FROM venues WHERE owner_id = ? AND is_active = 1')
      .bind(ownerId)
      .all<{ id: string }>()

    const venueIds = venueRows.map((v) => v.id)
    if (venueIds.length === 0) {
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

    const placeholders = venueIds.map(() => '?').join(',')

    // Today bookings
    const todayRow = await this.db
      .prepare(`SELECT COUNT(*) as count FROM bookings WHERE venue_id IN (${placeholders}) AND created_at >= ? AND created_at < ?`)
      .bind(...venueIds, today + 'T00:00:00Z', today + 'T23:59:59Z')
      .first<{ count: number }>()

    // Today revenue (confirmed bookings today)
    const todayRevRow = await this.db
      .prepare(`SELECT COALESCE(SUM(total_amount), 0) as revenue FROM bookings WHERE venue_id IN (${placeholders}) AND status = 'confirmed' AND created_at >= ? AND created_at < ?`)
      .bind(...venueIds, today + 'T00:00:00Z', today + 'T23:59:59Z')
      .first<{ revenue: number }>()

    // Week bookings
    const weekRow = await this.db
      .prepare(`SELECT COUNT(*) as count FROM bookings WHERE venue_id IN (${placeholders}) AND created_at >= ?`)
      .bind(...venueIds, weekAgo)
      .first<{ count: number }>()

    // Week revenue
    const weekRevRow = await this.db
      .prepare(`SELECT COALESCE(SUM(total_amount), 0) as revenue FROM bookings WHERE venue_id IN (${placeholders}) AND status = 'confirmed' AND created_at >= ?`)
      .bind(...venueIds, weekAgo)
      .first<{ revenue: number }>()

    // Pending verification payments
    const pendingRow = await this.db
      .prepare(`SELECT COUNT(*) as count FROM payments p JOIN bookings b ON b.id = p.booking_id WHERE b.venue_id IN (${placeholders}) AND p.status = 'pending'`)
      .bind(...venueIds)
      .first<{ count: number }>()

    // Occupancy rate: booked slots / total slots for today across all courts
    const totalSlotsRow = await this.db
      .prepare(`SELECT COUNT(*) as total FROM time_slots ts JOIN courts c ON c.id = ts.court_id WHERE c.venue_id IN (${placeholders}) AND ts.slot_date = ?`)
      .bind(...venueIds, today)
      .first<{ total: number }>()

    const bookedSlotsRow = await this.db
      .prepare(`SELECT COUNT(*) as booked FROM time_slots ts JOIN courts c ON c.id = ts.court_id WHERE c.venue_id IN (${placeholders}) AND ts.slot_date = ? AND ts.is_available = 0`)
      .bind(...venueIds, today)
      .first<{ booked: number }>()

    const totalSlots = totalSlotsRow?.total ?? 0
    const bookedSlots = bookedSlotsRow?.booked ?? 0
    const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) / 100 : 0

    // Peak hours: bookings by hour for last 7 days
    const { results: peakRows } = await this.db
      .prepare(`
        SELECT ts.slot_time as hour, COUNT(*) as bookings
        FROM time_slots ts
        JOIN courts c ON c.id = ts.court_id
        WHERE c.venue_id IN (${placeholders})
          AND ts.slot_date >= ?
          AND ts.is_available = 0
        GROUP BY ts.slot_time
        ORDER BY bookings DESC
        LIMIT 5
      `)
      .bind(...venueIds, weekAgo)
      .all<{ hour: string; bookings: number }>()

    return {
      todayBookings: todayRow?.count ?? 0,
      todayRevenue: todayRevRow?.revenue ?? 0,
      weekBookings: weekRow?.count ?? 0,
      weekRevenue: weekRevRow?.revenue ?? 0,
      pendingVerification: pendingRow?.count ?? 0,
      occupancyRate,
      peakHours: peakRows.map((r) => ({ hour: r.hour, bookings: r.bookings })),
    }
  }
}
