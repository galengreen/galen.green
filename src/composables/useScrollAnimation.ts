import { ref, type Ref } from 'vue'

/**
 * Simple composable that always returns visible: true
 * Keeps the API compatible but removes IntersectionObserver complexity
 */
export function useScrollAnimation(_target: Ref<HTMLElement | null>) {
  const isVisible = ref(true)
  return { isVisible }
}

/**
 * Simple composable for multiple elements - always visible
 * Keeps the API compatible but removes IntersectionObserver complexity
 */
export function useScrollAnimations(_options?: Record<string, unknown>) {
  const visibleElements = ref<Set<string>>(new Set())

  const observe = (id: string, _element: HTMLElement | null) => {
    visibleElements.value = new Set([...visibleElements.value, id])
  }

  const isVisible = (id: string) => visibleElements.value.has(id)

  return { observe, isVisible, visibleElements }
}
