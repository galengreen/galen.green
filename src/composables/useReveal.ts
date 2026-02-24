import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useReveal(target: Ref<Element | null>, options?: IntersectionObserverInit) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            if (observer && target.value) {
              observer.unobserve(target.value)
            }
          }
        })
      },
      // Use a 0 threshold so very tall sections still reveal on small viewports.
      { rootMargin: '0px 0px -10% 0px', threshold: 0, ...options },
    )

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
