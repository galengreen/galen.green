import { ref, type Ref } from 'vue'

/**
 * Simple composable that always returns visible: true
 * Keeps the API compatible but removes IntersectionObserver complexity
 */
export function useScrollAnimation(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _target: Ref<HTMLElement | null>,
): { isVisible: import('vue').Ref<boolean> } {
  const isVisible = ref(true)
  return { isVisible }
}

/**
 * Simple composable for multiple elements - always visible
 * Keeps the API compatible but removes IntersectionObserver complexity
 */
export function useScrollAnimations(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: Record<string, unknown>,
): {
  observe: (id: string, element: HTMLElement | null) => void
  isVisible: (id: string) => boolean
  visibleElements: import('vue').Ref<Set<string>>
} {
  const visibleElements = ref<Set<string>>(new Set())

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const observe = (id: string, _element: HTMLElement | null): void => {
    visibleElements.value = new Set([...visibleElements.value, id])
  }

  const isVisible = (id: string) => visibleElements.value.has(id)

  return { observe, isVisible, visibleElements }
}
