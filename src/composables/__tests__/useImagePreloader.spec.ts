import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useImagePreloader } from '../useImagePreloader'

class MockImage {
  onload: null | (() => void) = null
  onerror: null | (() => void) = null

  set src(_value: string) {
    queueMicrotask(() => {
      this.onload?.()
    })
  }
}

describe('useImagePreloader', () => {
  const originalRequestIdleCallback = (window as { requestIdleCallback?: unknown })
    .requestIdleCallback

  beforeEach(() => {
    vi.stubGlobal('Image', MockImage)
    ;(
      window as {
        requestIdleCallback: (cb: (deadline: IdleDeadline) => void) => number
      }
    ).requestIdleCallback = (cb) => {
      cb({
        didTimeout: false,
        timeRemaining: () => 50,
      })
      return 1
    }

    document.head.querySelectorAll('link[rel="prefetch"]').forEach((el) => {
      el.remove()
    })

    const preloader = useImagePreloader()
    preloader.reset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()

    if (originalRequestIdleCallback) {
      ;(window as { requestIdleCallback: unknown }).requestIdleCallback =
        originalRequestIdleCallback
    } else {
      ;(window as { requestIdleCallback?: unknown }).requestIdleCallback = undefined
    }
  })

  it('tracks critical image loading progress and resets state', async () => {
    const preloader = useImagePreloader()

    expect(preloader.criticalImagesLoaded.value).toBe(false)
    expect(preloader.loadProgress.value).toBe(0)

    await preloader.preloadCritical(['hero.jpg', 'portrait.jpg'])

    expect(preloader.criticalImagesLoaded.value).toBe(true)
    expect(preloader.loadProgress.value).toBe(100)

    preloader.reset()

    expect(preloader.criticalImagesLoaded.value).toBe(false)
    expect(preloader.loadProgress.value).toBe(0)
  })

  it('marks critical images loaded when preload is called with empty urls', async () => {
    const preloader = useImagePreloader()

    await preloader.preloadCritical([])

    expect(preloader.criticalImagesLoaded.value).toBe(true)
  })

  it('deduplicates prefetch urls and ignores already-prefetched urls', () => {
    const preloader = useImagePreloader()

    preloader.prefetchOnIdle(['a.jpg', 'a.jpg', 'b.jpg'])
    expect(document.head.querySelectorAll('link[rel="prefetch"]')).toHaveLength(2)

    preloader.prefetchOnIdle(['a.jpg', 'b.jpg', 'c.jpg'])
    expect(document.head.querySelectorAll('link[rel="prefetch"]')).toHaveLength(3)
  })

  it('clears prefetched url cache on reset', () => {
    const preloader = useImagePreloader()

    preloader.prefetchOnIdle(['resettable.jpg'])
    expect(document.head.querySelectorAll('link[rel="prefetch"]')).toHaveLength(1)

    preloader.prefetchOnIdle(['resettable.jpg'])
    expect(document.head.querySelectorAll('link[rel="prefetch"]')).toHaveLength(1)

    preloader.reset()
    preloader.prefetchOnIdle(['resettable.jpg'])

    expect(document.head.querySelectorAll('link[rel="prefetch"]')).toHaveLength(2)
  })
})
