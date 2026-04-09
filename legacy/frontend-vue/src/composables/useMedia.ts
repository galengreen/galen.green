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
  full: 0,
}

// Ordered responsive sizes for srcset (smallest to largest)
const RESPONSIVE_SIZES: ImageSizeName[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
const WEBP_SIZES: ImageSizeName[] = [...RESPONSIVE_SIZES, 'full']
const AVIF_SIZES: ImageSizeNameAvif[] = [
  'xs-avif',
  'sm-avif',
  'md-avif',
  'lg-avif',
  'xl-avif',
  'xxl-avif',
  'full-avif',
]

// Map base size to AVIF size name
const toAvifSize = (size: ImageSizeName): ImageSizeNameAvif | null => {
  const avifSizes: Record<string, ImageSizeNameAvif> = {
    xs: 'xs-avif',
    sm: 'sm-avif',
    md: 'md-avif',
    lg: 'lg-avif',
    xl: 'xl-avif',
    xxl: 'xxl-avif',
    full: 'full-avif',
  }
  return avifSizes[size] || null
}

function getSizeWidth(
  media: Media | undefined,
  size: ImageSizeName,
  sizeData?: { width?: number },
): number {
  return sizeData?.width || (size === 'full' ? media?.width || 0 : IMAGE_SIZE_WIDTHS[size])
}

function appendSrcsetPart(
  srcsetParts: string[],
  seen: Set<string>,
  url: string,
  width: number,
): void {
  if (!url || !width) return

  const key = `${url}|${width}`
  if (seen.has(key)) return

  seen.add(key)
  srcsetParts.push(`${url} ${width}w`)
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
  const seen = new Set<string>()

  for (const size of sizes) {
    const sizeData = media.sizes[size]
    if (sizeData?.url) {
      const url = toRelativeUrl(sizeData.url)
      const width = getSizeWidth(media, size, sizeData)
      appendSrcsetPart(srcsetParts, seen, url, width)
    }
  }

  const fullSize = media.sizes.full
  if (fullSize?.url) {
    appendSrcsetPart(
      srcsetParts,
      seen,
      toRelativeUrl(fullSize.url),
      getSizeWidth(media, 'full', fullSize),
    )
  } else if (media.url) {
    appendSrcsetPart(srcsetParts, seen, toRelativeUrl(media.url), media.width)
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
  const seen = new Set<string>()

  for (const size of sizes) {
    const avifSize = toAvifSize(size)
    if (!avifSize) continue

    const sizeData = media.sizes[avifSize]
    if (sizeData?.url) {
      const url = toRelativeUrl(sizeData.url)
      const width = getSizeWidth(media, size, sizeData)
      appendSrcsetPart(srcsetParts, seen, url, width)
    }
  }

  const fullAvif = media.sizes['full-avif']
  if (fullAvif?.url) {
    appendSrcsetPart(srcsetParts, seen, toRelativeUrl(fullAvif.url), fullAvif.width || media.width)
  }

  return srcsetParts.join(', ')
}

export function getBestImageUrlForWidth(media: Media | undefined, targetWidth: number): string {
  if (!media) return ''

  return getBestImageUrlForWidthAndFormat(media, targetWidth, 'webp')
}

export function getBestImageUrlForWidthAndFormat(
  media: Media | undefined,
  targetWidth: number,
  format: 'webp' | 'avif',
): string {
  if (!media) return ''

  const availableSizes = (format === 'avif' ? AVIF_SIZES : WEBP_SIZES)
    .map((size) => {
      const sizeData = media.sizes?.[size]
      if (!sizeData?.url) return null

      const width =
        size.endsWith('-avif') && size !== 'full-avif'
          ? getSizeWidth(media, size.replace(/-avif$/, '') as ImageSizeName, sizeData)
          : size === 'full-avif'
            ? sizeData.width || media.width
            : getSizeWidth(media, size as ImageSizeName, sizeData)

      return {
        url: toRelativeUrl(sizeData.url),
        width,
      }
    })
    .filter((entry): entry is { url: string; width: number } => Boolean(entry?.url && entry.width))
    .sort((a, b) => a.width - b.width)

  const bestMatch = availableSizes.find((entry) => entry.width >= targetWidth)
  if (bestMatch) return bestMatch.url

  return availableSizes[availableSizes.length - 1]?.url || toRelativeUrl(media.url || '')
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

  const urls = new Set<string>()

  // Add all size URLs
  if (media.sizes) {
    for (const size of Object.values(media.sizes)) {
      if (size?.url) {
        urls.add(toRelativeUrl(size.url))
      }
    }
  }

  // Add original URL
  if (media.url) {
    urls.add(toRelativeUrl(media.url))
  }

  return Array.from(urls)
}

export interface FormatDateOptions {
  /** Include short weekday (e.g., "Thu, 16 Jan 2026") */
  includeWeekday?: boolean
  /** Use long month name (e.g., "January" instead of "Jan") */
  longMonth?: boolean
}

/**
 * Format a date string for display
 * @param dateString - ISO date string to format
 * @param options - Formatting options
 */
export function formatDate(dateString: string, options?: FormatDateOptions): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: options?.longMonth ? 'long' : 'short',
    year: 'numeric',
  }

  if (options?.includeWeekday) {
    formatOptions.weekday = 'short'
  }

  return new Date(dateString).toLocaleDateString('en-NZ', formatOptions)
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
    getBestImageUrlForWidth,
    getBestImageUrlForWidthAndFormat,
    getAllImageUrls,
    imageSizesPresets,
    formatDate,
  }
}
