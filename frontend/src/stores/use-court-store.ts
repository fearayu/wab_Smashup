import { defineStore } from 'pinia'
import { courtApi } from '@/apis/court-api'
import type { Court, CreateCourtBody, UpdateCourtBody } from '@/models'

export const useCourtStore = defineStore('CourtStore', () => {
  const courts = ref<Court[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCourts(venueId: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await courtApi.list(venueId)
      courts.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createCourt(venueId: string, body: CreateCourtBody) {
    const res = await courtApi.create(venueId, body)
    courts.value.unshift(res.data)
    return res.data
  }

  async function updateCourt(id: string, body: UpdateCourtBody) {
    const res = await courtApi.update(id, body)
    const idx = courts.value.findIndex(c => c.id === id)
    if (idx !== -1) courts.value[idx] = res.data
    return res.data
  }

  async function deleteCourt(id: string) {
    await courtApi.remove(id)
    courts.value = courts.value.filter(c => c.id !== id)
  }

  return { courts, isLoading, error, fetchCourts, createCourt, updateCourt, deleteCourt }
})
