import type { PublicSiteResponse, SiteConfigResponse, UpdateSiteConfigBody } from '@/models'
import { request } from './request'

const BASE = (venueId: string) => `${import.meta.env.VITE_BACKEND_URL}/api/v1/venues/${venueId}/site-config`

export const siteConfigApi = {
  publicGet: (slug: string) => request<PublicSiteResponse>(`${import.meta.env.VITE_BACKEND_URL}/api/v1/public/sites/${slug}`),
  update: (venueId: string, body: UpdateSiteConfigBody) => request<SiteConfigResponse>(BASE(venueId), { method: 'PATCH', body: JSON.stringify(body) }),
}
