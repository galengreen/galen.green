import { useHead } from '@unhead/vue'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import type { SocialLink } from '@/types'

const SITE_NAME = 'Galen Green'
const SITE_URL = 'https://galen.green'
const DEFAULT_DESCRIPTION =
  'Galen Green is a software engineer and photographer based in Wellington, New Zealand. Currently finishing his final year at Victoria University of Wellington specialising in AI, Galen builds full-stack web applications, works with machine learning, and explores autonomous robotics. Browse his projects, blog posts, and photography portfolio.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/android-chrome-512x512.png`

/**
 * Convert a relative media URL to an absolute URL for use in OG tags.
 */
export function toAbsoluteUrl(relativeUrl: string | undefined): string | undefined {
  if (!relativeUrl) return undefined
  if (relativeUrl.startsWith('http')) return relativeUrl
  return `${SITE_URL}${relativeUrl}`
}

/**
 * Convert CMS social links to an array of absolute URLs for JSON-LD sameAs.
 * Filters out email (mailto:) links as they aren't valid sameAs values.
 */
function socialsToSameAs(socials: SocialLink[] | undefined): string[] {
  if (!socials) return []
  return socials.filter((s) => s.platform !== 'email' && s.url).map((s) => s.url)
}

export interface SeoOptions {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  ogImage?: MaybeRefOrGetter<string | undefined>
  ogType?: 'website' | 'article' | 'profile'
  path?: MaybeRefOrGetter<string>
  publishedTime?: MaybeRefOrGetter<string | undefined>
  noindex?: boolean
  /** CMS social links — used to populate Person JSON-LD sameAs */
  socials?: MaybeRefOrGetter<SocialLink[] | undefined>
  /** Profile photo absolute URL for Person JSON-LD image */
  personImage?: MaybeRefOrGetter<string | undefined>
  /** Job title for Person JSON-LD (e.g., "Software Engineer") */
  jobTitle?: MaybeRefOrGetter<string | undefined>
}

/**
 * Composable for setting page-level SEO meta tags and structured data.
 *
 * Uses @unhead/vue (provided by vite-ssg) to manage <head> tags reactively.
 * Supports Open Graph, Twitter Cards, canonical URLs, and JSON-LD.
 */
export function useSeo(options: SeoOptions = {}) {
  const fullTitle = computed(() => {
    const title = toValue(options.title)
    return title ? `${title} | ${SITE_NAME}` : SITE_NAME
  })

  const description = computed(() => toValue(options.description) || DEFAULT_DESCRIPTION)
  const ogImage = computed(() => toValue(options.ogImage) || DEFAULT_OG_IMAGE)
  const canonicalUrl = computed(() => {
    const path = toValue(options.path) || '/'
    return `${SITE_URL}${path}`
  })

  // Person + ProfilePage JSON-LD (reactive — updates when CMS data arrives)
  const personJsonLd = computed(() => {
    const sameAs = socialsToSameAs(toValue(options.socials))
    const image = toValue(options.personImage)
    const job = toValue(options.jobTitle) || 'Software Developer'

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
      jobTitle: job,
      knowsAbout: ['Software Development', 'Web Development', 'Photography'],
      ...(sameAs.length > 0 ? { sameAs } : {}),
      ...(image ? { image } : {}),
    })
  })

  const profilePageJsonLd = computed(() => {
    const sameAs = socialsToSameAs(toValue(options.socials))
    const image = toValue(options.personImage)

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: SITE_NAME,
        url: SITE_URL,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        ...(image ? { image } : {}),
      },
    })
  })

  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: description },
      { name: 'author', content: SITE_NAME },

      // Open Graph
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: options.ogType || 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'en_NZ' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },

      // Published time (for articles)
      ...(options.publishedTime
        ? [
            {
              property: 'article:published_time',
              content: computed(() => toValue(options.publishedTime) || ''),
            },
          ]
        : []),

      // Robots
      ...(options.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    ],
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: personJsonLd,
      },
      {
        type: 'application/ld+json',
        innerHTML: profilePageJsonLd,
      },
    ],
  })
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION }
