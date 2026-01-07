import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

/**
 * Composable for triggering animations when elements enter the viewport
 * Uses Intersection Observer API for efficient scroll-based animations
 */
export function useScrollAnimation(
  target: Ref<HTMLElement | null>,
  options: UseScrollAnimationOptions = {},
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options

  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        if (once && observer && target.value) {
          observer.unobserve(target.value)
        }
      } else if (!once) {
        isVisible.value = false
      }
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: show immediately if IntersectionObserver not supported
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    })

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return { isVisible }
}

/**
 * Directive-style composable for multiple elements
 * Returns a function to call in onMounted for each element
 */
export function useScrollAnimations(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options

  const visibleElements = ref<Set<string>>(new Set())
  let observer: IntersectionObserver | null = null
  const elements = new Map<string, HTMLElement>()

  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const id = (entry.target as HTMLElement).dataset.animateId
      if (!id) return

      if (entry.isIntersecting) {
        visibleElements.value = new Set([...visibleElements.value, id])
        if (once && observer) {
          observer.unobserve(entry.target)
        }
      } else if (!once) {
        const newSet = new Set(visibleElements.value)
        newSet.delete(id)
        visibleElements.value = newSet
      }
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    elements.clear()
  })

  const observe = (id: string, element: HTMLElement | null) => {
    if (!element || !observer) return

    element.dataset.animateId = id
    elements.set(id, element)
    observer.observe(element)
  }

  const isVisible = (id: string) => visibleElements.value.has(id)

  return { observe, isVisible, visibleElements }
}
