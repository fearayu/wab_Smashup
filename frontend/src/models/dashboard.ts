export interface DashboardSummary {
  today_bookings: number
  today_revenue: number
  week_bookings: number
  week_revenue: number
  pending_verification: number
  occupancy_rate: number
  peak_hours: {
    hour: string
    bookings: number
  }[]
}

export interface DashboardResponse {
  data: DashboardSummary
}
