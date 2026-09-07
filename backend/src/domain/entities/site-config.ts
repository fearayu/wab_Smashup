export interface SiteConfig {
  id: string
  venueId: string
  theme: 'default' | 'dark' | 'minimal'
  heroImageUrl: string | null
  welcomeMessage: string | null
  showPricing: boolean
  showMap: boolean
  customCss: string | null
  socialLinks: {
    line?: string
    facebook?: string
    instagram?: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface UpdateSiteConfigInput {
  theme?: 'default' | 'dark' | 'minimal'
  heroImageUrl?: string
  welcomeMessage?: string
  showPricing?: boolean
  showMap?: boolean
  socialLinks?: {
    line?: string
    facebook?: string
    instagram?: string
  }
}
