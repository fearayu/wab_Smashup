export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  author: string
  siteUrl: string
  siteName: string
  twitterHandle?: string
  locale: string
  themeColor: string
  ogImage?: string
  twitterImage?: string
}

export interface PageSEO {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  noIndex?: boolean
}

// Default SEO Configuration
export const defaultSEO: SEOConfig = {
  title: 'Smashup - Badminton Court Booking Platform',
  description: 'Build your own badminton court booking website in 5 minutes. No coding required. Accept bookings 24/7, auto-verify payments, and eliminate overbooking.',
  keywords: [
    'badminton',
    'court booking',
    'sports venue',
    'booking system',
    'no-code',
    'smashup',
    'thailand',
    'สนามแบดมินตัน',
    'จองสนาม',
  ],
  author: 'Smashup Team',
  siteUrl: import.meta.env.VITE_APP_URL || 'https://smashup.pages.dev',
  siteName: 'Smashup',
  twitterHandle: import.meta.env.VITE_TWITTER_HANDLE || '@smashupth',
  locale: 'th_TH',
  themeColor: '#030213',
  ogImage: '/og-image.png',
  twitterImage: '/twitter-image.png',
}

// Generate full title
export function generateTitle(pageTitle?: string): string {
  if (!pageTitle)
    return defaultSEO.title

  return `${pageTitle} | ${defaultSEO.siteName}`
}

// Generate full URL
export function generateUrl(path?: string): string {
  const baseUrl = defaultSEO.siteUrl.replace(/\/$/, '')
  if (!path)
    return baseUrl

  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${cleanPath}`
}

// Generate full image URL
export function generateImageUrl(image?: string): string {
  if (!image)
    return generateUrl(defaultSEO.ogImage)

  // If image is already a full URL, return it
  if (image.startsWith('http://') || image.startsWith('https://'))
    return image

  return generateUrl(image)
}
