import z from 'zod'

export const dashboardSummarySchema = z.object({
  data: z.object({
    todayBookings: z.number().int(),
    todayRevenue: z.number().int(),
    weekBookings: z.number().int(),
    weekRevenue: z.number().int(),
    pendingVerification: z.number().int(),
    occupancyRate: z.number(),
    peakHours: z.array(z.object({
      hour: z.string(),
      bookings: z.number().int(),
    })),
  }),
})
