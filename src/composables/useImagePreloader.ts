/**
 * Composable for image preloading and loading state management
 *
 * Handles:
 * - Critical image preloading (hero, portrait, theme backgrounds)
 * - Idle-time prefetching for remaining images
 * - Loading progress tracking
 * - First-visit-only loading screen logic
 */

import { ref, computed } from 'vue'
import type { Media } from '@/types'
import { getImageUrl } from '@/composables/useMedia'

// Module-level state (shared across all uses)
const criticalImagesLoaded = ref(false)
const loadedCount = ref(0)
const totalCount = ref(0)
const prefetchedUrls = new Set<string>()

// Session storage key for first-visit tracking
const FIRST_VISIT_KEY = 'app-loaded-this-session'

/**
 * Check if this is the first visit in the current session
 */
function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true
  return !sessionStorage.getItem(FIRST_VISIT_KEY)
}

/**
 * Mark that the app has loaded this session
 */
function markVisited(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(FIRST_VISIT_KEY, 'true')
}

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
 * Preload critical images (hero backgrounds, portrait)
 * Returns a promise that resolves when all critical images are loaded
 */
async function preloadCritical(urls: string[]): Promise<void> {
  const validUrls = urls.filter((url) => url && url.length > 0)

  if (validUrls.length === 0) {
    criticalImagesLoaded.value = true
    return
  }

  totalCount.value = validUrls.length
  loadedCount.value = 0

  const promises = validUrls.map(async (url) => {
    await preloadImage(url)
    loadedCount.value++
  })

  await Promise.all(promises)
  criticalImagesLoaded.value = true
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
}

/**
 * Main composable export
 */
export function useImagePreloader() {
  const loadProgress = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((loadedCount.value / totalCount.value) * 100)
  })

  const shouldShowLoadingScreen = computed(() => {
    return isFirstVisit() && !criticalImagesLoaded.value
  })

  return {
    // State
    criticalImagesLoaded,
    loadProgress,
    shouldShowLoadingScreen,

    // Methods
    preloadCritical,
    preloadCriticalMedia,
    prefetchOnIdle,
    prefetchMediaOnIdle,
    markVisited,
    isFirstVisit,
    reset,
  }
}
