import { defineStore } from 'pinia'
import { venueApi } from '@/apis/venue-api'
import type { CreateVenueBody, UpdateVenueBody, Venue } from '@/models'

export const useVenueStore = defineStore('VenueStore', () => {
  const venues = ref<Venue[]>([])
  const currentVenue = ref<Venue | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchVenues() {
    isLoading.value = true
    error.value = null
    try {
      const res = await venueApi.list()
      venues.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createVenue(body: CreateVenueBody) {
    const res = await venueApi.create(body)
    venues.value.unshift(res.data)
    return res.data
  }

  async function updateVenue(id: string, body: UpdateVenueBody) {
    const res = await venueApi.update(id, body)
    const idx = venues.value.findIndex(v => v.id === id)
    if (idx !== -1) venues.value[idx] = res.data
    if (currentVenue.value?.id === id) currentVenue.value = res.data
    return res.data
  }

  async function deleteVenue(id: string) {
    await venueApi.remove(id)
    venues.value = venues.value.filter(v => v.id !== id)
    if (currentVenue.value?.id === id) currentVenue.value = null
  }

  function setCurrentVenue(id: string) {
    currentVenue.value = venues.value.find(v => v.id === id) ?? null
  }

  return { venues, currentVenue, isLoading, error, fetchVenues, createVenue, updateVenue, deleteVenue, setCurrentVenue }
})
