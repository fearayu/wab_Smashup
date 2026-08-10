export interface SiteConfig {
  theme: 'default' | 'dark' | 'minimal'
  hero_image_url?: string
  welcome_message?: string
  show_pricing: boolean
  show_map?: boolean
  social_links?: {
    line?: string
    facebook?: string
    instagram?: string
  }
}

export interface UpdateSiteConfigBody {
  theme?: 'default' | 'dark' | 'minimal'
  hero_image_url?: string
  welcome_message?: string
  show_pricing?: boolean
  show_map?: boolean
  social_links?: {
    line?: string
    facebook?: string
    instagram?: string
  }
}

export interface PublicSiteResponse {
  data: {
    venue: {
      id: string
      name: string
      slug: string
      description?: string
      address?: string
      phone?: string
      primary_color?: string
    }
    courts: {
      id: string
      name: string
      type: string
      hourly_rate: number
    }[]
    config: SiteConfig
  }
}

export interface SiteConfigResponse {
  data: SiteConfig
}
