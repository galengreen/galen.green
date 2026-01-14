/**
 * Composable for media URL handling and date formatting
 *
 * All media URLs are converted to relative paths and proxied:
 * - In development: Vite proxies to CMS_URL (local or remote)
 * - In production: nginx proxies to CMS container
 */

import type { AllImageSizeName, ImageSizeName, ImageSizeNameAvif, Media } from '@/types'

// Image size widths for srcset generation
const IMAGE_SIZE_WIDTHS: Record<ImageSizeName, number> = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1400,
  xxl: 1920,
  // Legacy sizes
  thumbnail: 400,
  medium: 800,
  large: 1400,
}

// Ordered responsive sizes for srcset (smallest to largest)
const RESPONSIVE_SIZES: ImageSizeName[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

// Map base size to AVIF size name
const toAvifSize = (size: ImageSizeName): ImageSizeNameAvif | null => {
  const avifSizes: Record<string, ImageSizeNameAvif> = {
    xs: 'xs-avif',
    sm: 'sm-avif',
    md: 'md-avif',
    lg: 'lg-avif',
    xl: 'xl-avif',
    xxl: 'xxl-avif',
  }
  return avifSizes[size] || null
}

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
  size?: AllImageSizeName,
): string {
  if (!media) return ''

  if (size && media.sizes?.[size]?.url) {
    return toRelativeUrl(media.sizes[size].url || '')
  }

  return toRelativeUrl(media.url || '')
}

/**
 * Generate srcset string for responsive images (WebP format)
 * @param media - Media object with sizes
 * @param sizes - Array of size names to include (defaults to all responsive sizes)
 * @returns srcset string like "url-sm.webp 480w, url-md.webp 768w, ..."
 */
export function getImageSrcset(
  media: Media | undefined,
  sizes: ImageSizeName[] = RESPONSIVE_SIZES,
): string {
  if (!media?.sizes) return ''

  const srcsetParts: string[] = []

  for (const size of sizes) {
    const sizeData = media.sizes[size]
    if (sizeData?.url) {
      const url = toRelativeUrl(sizeData.url)
      const width = sizeData.width || IMAGE_SIZE_WIDTHS[size]
      srcsetParts.push(`${url} ${width}w`)
    }
  }

  // Add original as fallback for larger screens if no xxl
  if (!sizes.includes('xxl') && media.url) {
    srcsetParts.push(`${toRelativeUrl(media.url)} ${media.width}w`)
  }

  return srcsetParts.join(', ')
}

/**
 * Generate srcset string for AVIF format
 * @param media - Media object with sizes
 * @param sizes - Array of base size names to include (defaults to all responsive sizes)
 * @returns srcset string like "url-sm-avif.avif 480w, url-md-avif.avif 768w, ..."
 */
export function getImageSrcsetAvif(
  media: Media | undefined,
  sizes: ImageSizeName[] = RESPONSIVE_SIZES,
): string {
  if (!media?.sizes) return ''

  const srcsetParts: string[] = []

  for (const size of sizes) {
    const avifSize = toAvifSize(size)
    if (!avifSize) continue

    const sizeData = media.sizes[avifSize]
    if (sizeData?.url) {
      const url = toRelativeUrl(sizeData.url)
      const width = sizeData.width || IMAGE_SIZE_WIDTHS[size]
      srcsetParts.push(`${url} ${width}w`)
    }
  }

  return srcsetParts.join(', ')
}

/**
 * Get both AVIF and WebP srcsets for use in <picture> element
 */
export function getImageSrcsets(
  media: Media | undefined,
  sizes: ImageSizeName[] = RESPONSIVE_SIZES,
): { avif: string; webp: string } {
  return {
    avif: getImageSrcsetAvif(media, sizes),
    webp: getImageSrcset(media, sizes),
  }
}

/**
 * Generate common sizes attribute patterns for responsive images
 */
export const imageSizesPresets = {
  // Full width on mobile, constrained on larger screens
  fullWidth: '100vw',
  // Card/thumbnail: full width mobile, half on tablet, fixed on desktop
  card: '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 400px',
  // Hero image: always full viewport width
  hero: '100vw',
  // Gallery thumbnail
  galleryThumb: '(max-width: 480px) 50vw, (max-width: 768px) 33vw, 200px',
  // Photo grid: responsive columns
  photoGrid: '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px',
  // Profile/avatar
  avatar: '(max-width: 768px) 280px, 400px',
} as const

export type ImageSizesPreset = keyof typeof imageSizesPresets

/**
 * Get all available image URLs from a media object (all sizes + original)
 * Useful for preloading
 */
export function getAllImageUrls(media: Media | undefined): string[] {
  if (!media) return []

  const urls: string[] = []

  // Add all size URLs
  if (media.sizes) {
    for (const size of Object.values(media.sizes)) {
      if (size?.url) {
        urls.push(toRelativeUrl(size.url))
      }
    }
  }

  // Add original URL
  if (media.url) {
    urls.push(toRelativeUrl(media.url))
  }

  return urls
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
    getImageSrcset,
    getImageSrcsetAvif,
    getImageSrcsets,
    getAllImageUrls,
    imageSizesPresets,
    formatDate,
  }
}
