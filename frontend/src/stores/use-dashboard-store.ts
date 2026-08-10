import { defineStore } from 'pinia'
import { dashboardApi } from '@/apis/dashboard-api'
import type { DashboardSummary } from '@/models'

export const useDashboardStore = defineStore('DashboardStore', () => {
  const summary = ref<DashboardSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSummary() {
    isLoading.value = true
    error.value = null
    try {
      const res = await dashboardApi.summary()
      summary.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  return { summary, isLoading, error, fetchSummary }
})
