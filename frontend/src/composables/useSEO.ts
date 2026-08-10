import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { PageSEO } from '@/config/seo.config'
import {
  defaultSEO,
  generateImageUrl,
  generateTitle,
  generateUrl,
} from '@/config/seo.config'

export function useSEO(pageSEO?: PageSEO) {
  const route = useRoute()

  const updateMetaTags = (seo?: PageSEO) => {
    const config = { ...seo }

    // Update title
    const fullTitle = generateTitle(config.title)
    document.title = fullTitle

    // Update or create meta tags
    const metaTags = [
      // Primary Meta Tags
      { name: 'title', content: fullTitle },
      {
        name: 'description',
        content: config.description || defaultSEO.description,
      },
      {
        name: 'keywords',
        content: config.keywords?.join(', ') || defaultSEO.keywords.join(', '),
      },
      { name: 'author', content: config.author || defaultSEO.author },
      {
        name: 'robots',
        content: config.noIndex ? 'noindex, nofollow' : 'index, follow',
      },

      // Open Graph
      { property: 'og:type', content: config.type || 'website' },
      { property: 'og:url', content: generateUrl(config.url || route.path) },
      { property: 'og:title', content: fullTitle },
      {
        property: 'og:description',
        content: config.description || defaultSEO.description,
      },
      { property: 'og:image', content: generateImageUrl(config.image) },
      { property: 'og:site_name', content: defaultSEO.siteName },
      { property: 'og:locale', content: defaultSEO.locale },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: generateUrl(config.url || route.path) },
      { name: 'twitter:title', content: fullTitle },
      {
        name: 'twitter:description',
        content: config.description || defaultSEO.description,
      },
      {
        name: 'twitter:image',
        content: generateImageUrl(config.image || defaultSEO.twitterImage),
      },
      { name: 'twitter:site', content: defaultSEO.twitterHandle },
      { name: 'twitter:creator', content: defaultSEO.twitterHandle },
    ]

    // Add article-specific tags
    if (config.type === 'article') {
      if (config.publishedTime) {
        metaTags.push({
          property: 'article:published_time',
          content: config.publishedTime,
        })
      }
      if (config.modifiedTime) {
        metaTags.push({
          property: 'article:modified_time',
          content: config.modifiedTime,
        })
      }
      if (config.author)
        metaTags.push({ property: 'article:author', content: config.author })
    }

    // Update meta tags
    metaTags.forEach(({ name, property, content }) => {
      const attribute = name ? 'name' : 'property'
      const value = name || property
      let element = document.querySelector(`meta[${attribute}="${value}"]`)

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, value!)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content || '')
    })

    // Update canonical link
    const canonicalUrl = generateUrl(config.url || route.path)
    let canonicalLink = document.querySelector('link[rel="canonical"]')

    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }

    canonicalLink.setAttribute('href', canonicalUrl)
  }

  // Update on mount
  onMounted(() => {
    updateMetaTags(pageSEO)
  })

  // Watch for route changes
  watch(
    () => route.path,
    () => {
      updateMetaTags(pageSEO)
    },
  )

  // Return update function for manual updates
  return {
    updateSEO: (newSEO: PageSEO) => updateMetaTags(newSEO),
  }
}

// Helper function for generating structured data (JSON-LD)
export function useStructuredData(data: Record<string, any>) {
  onMounted(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = 'structured-data'

    // Remove existing structured data
    const existing = document.getElementById('structured-data')
    if (existing)
      existing.remove()

    document.head.appendChild(script)
  })
}
