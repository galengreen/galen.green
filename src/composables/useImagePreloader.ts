/**
 * Composable for image preloading and loading state management
 *
 * Handles:
 * - Critical image preloading (hero, portrait, theme backgrounds)
 * - Idle-time prefetching for remaining images
 * - Loading progress tracking
 */

import { ref, computed } from 'vue'
import type { Media } from '@/types'
import { getImageUrl } from '@/composables/useMedia'

// Module-level state (shared across all uses)
const criticalImagesLoaded = ref(false)
const loadedCount = ref(0)
const totalCount = ref(0)
const prefetchedUrls = new Set<string>()

// Track pending critical image loads
const pendingLoads = new Set<string>()
const loadedUrls = new Set<string>()

/**
 * Preload a single image and return a promise
 */
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve()
      return
    }

    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => {
      // Don't reject - we don't want one failed image to break everything
      console.warn(`Failed to preload image: ${url}`)
      resolve()
    }
    img.src = url
  })
}

/**
 * Check if all critical images are loaded
 */
function checkAllLoaded(): void {
  if (pendingLoads.size === 0 && loadedUrls.size > 0) {
    criticalImagesLoaded.value = true
  }
}

/**
 * Preload critical images (hero backgrounds, portrait)
 * Can be called multiple times - tracks all URLs across calls
 */
async function preloadCritical(urls: string[]): Promise<void> {
  const validUrls = urls.filter((url) => url && url.length > 0 && !loadedUrls.has(url))

  if (validUrls.length === 0) {
    // If no new URLs and nothing pending, mark as loaded
    if (pendingLoads.size === 0) {
      criticalImagesLoaded.value = true
    }
    return
  }

  // Add to pending set
  for (const url of validUrls) {
    pendingLoads.add(url)
  }
  totalCount.value = pendingLoads.size + loadedUrls.size

  // Load all images
  const promises = validUrls.map(async (url) => {
    await preloadImage(url)
    pendingLoads.delete(url)
    loadedUrls.add(url)
    loadedCount.value = loadedUrls.size
    checkAllLoaded()
  })

  await Promise.all(promises)
}

/**
 * Preload critical images from Media objects
 * Convenience wrapper that extracts URLs at the optimal size
 */
async function preloadCriticalMedia(
  mediaItems: (Media | undefined)[],
  size: 'lg' | 'xl' | 'xxl' = 'xl',
): Promise<void> {
  const urls = mediaItems
    .filter((m): m is Media => !!m)
    .map((m) => getImageUrl(m, size))
    .filter((url) => url.length > 0)

  return preloadCritical(urls)
}

/**
 * Prefetch images during browser idle time
 * These are non-critical images that should be ready when scrolled to
 */
function prefetchOnIdle(urls: string[]): void {
  if (typeof window === 'undefined') return

  const validUrls = urls.filter((url) => url && !prefetchedUrls.has(url))

  if (validUrls.length === 0) return

  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduleIdle =
    'requestIdleCallback' in window
      ? (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 1)

  scheduleIdle(() => {
    validUrls.forEach((url) => {
      // Use link prefetch for better browser handling
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)

      prefetchedUrls.add(url)
    })
  })
}

/**
 * Prefetch images from Media objects during idle time
 */
function prefetchMediaOnIdle(
  mediaItems: (Media | undefined)[],
  size: 'sm' | 'md' | 'lg' = 'md',
): void {
  const urls = mediaItems
    .filter((m): m is Media => !!m)
    .map((m) => getImageUrl(m, size))
    .filter((url) => url.length > 0)

  prefetchOnIdle(urls)
}

/**
 * Reset preloader state (useful for testing)
 */
function reset(): void {
  criticalImagesLoaded.value = false
  loadedCount.value = 0
  totalCount.value = 0
  pendingLoads.clear()
  loadedUrls.clear()
}

/**
 * Main composable export
 */
export function useImagePreloader() {
  const loadProgress = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((loadedCount.value / totalCount.value) * 100)
  })

  return {
    // State
    criticalImagesLoaded,
    loadProgress,

    // Methods
    preloadCritical,
    preloadCriticalMedia,
    prefetchOnIdle,
    prefetchMediaOnIdle,
    reset,
  }
}
