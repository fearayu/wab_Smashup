import { defineStore } from 'pinia'
import { slotApi } from '@/apis/slot-api'
import type { GenerateSlotsBody, TimeSlot, UpdateSlotBody } from '@/models'

export const useSlotStore = defineStore('SlotStore', () => {
  const slots = ref<TimeSlot[]>([])
  const selectedDate = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSlots(venueId: string, date?: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await slotApi.list(venueId)
      slots.value = res.data
      if (date) selectedDate.value = date
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function generateSlots(venueId: string, body: GenerateSlotsBody) {
    const res = await slotApi.generate(venueId, body)
    slots.value = res.data
    return res.data
  }

  async function toggleSlotAvailability(id: string) {
    const slot = slots.value.find(s => s.id === id)
    if (!slot) return
    const res = await slotApi.update(id, { is_available: !slot.is_available })
    const idx = slots.value.findIndex(s => s.id === id)
    if (idx !== -1) slots.value[idx] = res.data
  }

  async function updateSlot(id: string, body: UpdateSlotBody) {
    const res = await slotApi.update(id, body)
    const idx = slots.value.findIndex(s => s.id === id)
    if (idx !== -1) slots.value[idx] = res.data
    return res.data
  }

  return { slots, selectedDate, isLoading, error, fetchSlots, generateSlots, toggleSlotAvailability, updateSlot }
})
