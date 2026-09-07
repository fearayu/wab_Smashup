export interface DashboardSummary {
  todayBookings: number
  todayRevenue: number
  weekBookings: number
  weekRevenue: number
  pendingVerification: number
  occupancyRate: number
  peakHours: Array<{ hour: string; bookings: number }>
}
