import { defineStore } from 'pinia'
import { bookingApi } from '@/apis/booking-api'
import type { Booking, CreateBookingBody, UpdateBookingBody } from '@/models'

export const useBookingStore = defineStore('BookingStore', () => {
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBookings(filters?: { venue_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number; offset?: number }) {
    isLoading.value = true
    error.value = null
    try {
      const res = await bookingApi.list(filters)
      bookings.value = res.data.items
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createBooking(body: CreateBookingBody) {
    const res = await bookingApi.publicCreate(body)
    currentBooking.value = res.data
    return res.data
  }

  async function updateBookingStatus(id: string, body: UpdateBookingBody) {
    const res = await bookingApi.update(id, body)
    const idx = bookings.value.findIndex(b => b.id === id)
    if (idx !== -1) bookings.value[idx] = res.data
    if (currentBooking.value?.id === id) currentBooking.value = res.data
    return res.data
  }

  async function fetchBookingById(id: string) {
    const res = await bookingApi.get(id)
    currentBooking.value = res.data
    return res.data
  }

  return { bookings, currentBooking, isLoading, error, fetchBookings, createBooking, updateBookingStatus, fetchBookingById }
})
