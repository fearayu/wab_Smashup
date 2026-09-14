export const BUFFET_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const
export type BuffetStatus = (typeof BUFFET_STATUSES)[number]

export interface BuffetBooking {
  id: string
  userId: string
  name: string
  phone: string
  date: string
  session: string
  level: string
  levelSource: string
  note: string
  shuttle: number
  amount: number
  group: string
  status: BuffetStatus
  paymentStatus: string
  queueNumber: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateBuffetBookingInput {
  userId: string
  name: string
  phone: string
  date: string
  session: string
  level?: string
  levelSource?: string
  note?: string
  shuttle?: number
  amount?: number
  group?: string
}
