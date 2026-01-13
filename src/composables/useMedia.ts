/**
 * Composable for media URL handling and date formatting
 *
 * All media URLs are converted to relative paths and proxied:
 * - In development: Vite proxies to CMS_URL (local or remote)
 * - In production: nginx proxies to CMS container
 */

/**
 * Convert absolute URL to relative path for proxying
 */
function toRelativeUrl(url: string): string {
  if (!url) return ''
  // Strip any domain to make it relative (e.g., https://galen.green/api/media/... → /api/media/...)
  try {
    const parsed = new URL(url, 'http://localhost')
    return parsed.pathname
  } catch {
    return url
  }
}

/**
 * Get the URL for a media item, optionally at a specific size
 * Always returns a relative URL for proxying
 */
export function getImageUrl(
  media: { url?: string; sizes?: Record<string, { url?: string }> } | undefined,
  size?: 'thumbnail' | 'medium' | 'large',
): string {
  if (!media) return ''

  if (size && media.sizes?.[size]?.url) {
    return toRelativeUrl(media.sizes[size].url || '')
  }

  return toRelativeUrl(media.url || '')
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
  }
}
