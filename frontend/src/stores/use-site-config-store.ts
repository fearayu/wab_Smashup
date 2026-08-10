import { defineStore } from 'pinia'
import { siteConfigApi } from '@/apis/site-config-api'
import type { PublicSiteResponse, SiteConfig, UpdateSiteConfigBody } from '@/models'

export const useSiteConfigStore = defineStore('SiteConfigStore', () => {
  const config = ref<SiteConfig | null>(null)
  const publicSite = ref<PublicSiteResponse['data'] | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSiteConfig(slug: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await siteConfigApi.publicGet(slug)
      publicSite.value = res.data
      config.value = res.data.config
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateSiteConfig(venueId: string, body: UpdateSiteConfigBody) {
    const res = await siteConfigApi.update(venueId, body)
    config.value = res.data
    return res.data
  }

  return { config, publicSite, isLoading, error, fetchSiteConfig, updateSiteConfig }
})
