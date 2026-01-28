import { watch, onUnmounted, type Ref } from 'vue'

export interface LightboxOptions {
  onClose: () => void
  /** Set to true if keyboard handling is done elsewhere (e.g., useGalleryNavigation) */
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
  const { onClose, skipKeyboardHandling = false } = options

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
      onClose()
    }
  }

  watch(
    isOpen,
    (open) => {
      if (open) {
        document.body.style.overflow = 'hidden'
        if (!skipKeyboardHandling) {
          document.addEventListener('keydown', handleKeydown)
        }
      } else {
        document.body.style.overflow = ''
        if (!skipKeyboardHandling) {
          document.removeEventListener('keydown', handleKeydown)
        }
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    document.body.style.overflow = ''
    if (!skipKeyboardHandling) {
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return { handleBackdropClick }
}
