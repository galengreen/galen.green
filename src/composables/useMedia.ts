/**
 * Composable for media URL handling and date formatting
 */

// In production, nginx proxies /media/ and /api/ to the CMS, so we use relative URLs.
// In development, the CMS runs on a different port, so we need the full URL.
const CMS_URL = import.meta.env.PROD
  ? ''
  : import.meta.env.VITE_PAYLOAD_URL || 'http://localhost:3000'

/**
 * Get the full URL for a media item, optionally at a specific size
 */
export function getImageUrl(
  media: { url?: string; sizes?: Record<string, { url?: string }> } | undefined,
  size?: 'thumbnail' | 'medium' | 'large',
): string {
  if (!media) return ''

  let url = ''

  if (size && media.sizes?.[size]?.url) {
    url = media.sizes[size].url || ''
  } else {
    url = media.url || ''
  }

  // Prepend CMS URL if it's a relative path (only in development)
  if (url && url.startsWith('/')) {
    return `${CMS_URL}${url}`
  }

  return url
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Composable that returns media utilities
 */
export function useMedia() {
  return {
    getImageUrl,
    formatDate,
    cmsUrl: CMS_URL,
  }
}
