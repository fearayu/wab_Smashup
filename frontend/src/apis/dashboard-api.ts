import type { DashboardResponse } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/dashboard`

export const dashboardApi = {
  summary: () => request<DashboardResponse>(`${BASE}/summary`),
}
