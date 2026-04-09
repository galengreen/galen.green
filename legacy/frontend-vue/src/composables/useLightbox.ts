import { nextTick, onUnmounted, watch, type Ref } from 'vue'

export interface LightboxOptions {
  containerRef?: Ref<HTMLElement | null>
  initialFocusRef?: Ref<HTMLElement | null>
  onClose: () => void
  /** Set to true if Escape handling is done elsewhere (e.g., useGalleryNavigation) */
  skipKeyboardHandling?: boolean
}

/**
 * Composable for shared lightbox behaviour:
 * - Locks body scroll when open
 * - Handles Escape key to close (unless skipKeyboardHandling is true)
 * - Provides backdrop click handler
 * - Cleans up on unmount
 */
export function useLightbox(isOpen: Ref<boolean>, options: LightboxOptions) {
  const { onClose, containerRef, initialFocusRef, skipKeyboardHandling = false } = options
  let previousFocusedElement: HTMLElement | null = null

  function getFocusableElements() {
    const container = containerRef?.value
    if (!container) return []

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'))
  }

  function focusInitialElement() {
    const container = containerRef?.value
    const initialElement = initialFocusRef?.value

    if (initialElement) {
      initialElement.focus()
      return
    }

    const firstFocusable = getFocusableElements()[0]
    if (firstFocusable) {
      firstFocusable.focus()
      return
    }

    container?.focus()
  }

  function restoreFocus() {
    previousFocusedElement?.focus()
    previousFocusedElement = null
  }

  function trapFocus(event: KeyboardEvent) {
    const container = containerRef?.value
    if (!container) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) {
      event.preventDefault()
      container.focus()
      return
    }

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement as HTMLElement | null
    const isFocusInside = activeElement ? container.contains(activeElement) : false

    if (event.shiftKey) {
      if (!isFocusInside || activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable?.focus()
      }
      return
    }

    if (!isFocusInside || activeElement === lastFocusable) {
      event.preventDefault()
      firstFocusable?.focus()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return

    if (e.key === 'Tab') {
      trapFocus(e)
      return
    }

    if (e.key === 'Escape' && !skipKeyboardHandling) {
      onClose()
    }
  }

  watch(
    isOpen,
    async (open) => {
      if (typeof document === 'undefined') return

      if (open) {
        previousFocusedElement = document.activeElement as HTMLElement | null
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeydown)
        await nextTick()
        focusInitialElement()
      } else {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleKeydown)
        restoreFocus()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (typeof document === 'undefined') return

    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeydown)
    restoreFocus()
  })

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return { handleBackdropClick }
}
