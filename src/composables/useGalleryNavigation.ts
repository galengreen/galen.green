import { ref, onUnmounted, watch, type Ref } from 'vue'

export interface GalleryNavigationOptions {
  /** Total number of items in the gallery */
  itemCount: Ref<number>
  /** Initial index to start at */
  initialIndex?: number
  /** Whether to loop around at boundaries */
  loop?: boolean
  /** Callback when close is requested (Escape key) */
  onClose?: () => void
  /** Custom key handlers */
  customKeys?: Record<string, () => void>
  /** Whether navigation is currently active (for modals) */
  isActive?: Ref<boolean>
  /** Use document-level listeners (for modals) vs element-scoped */
  useDocumentListener?: boolean
}

/**
 * Composable for gallery/lightbox keyboard navigation
 * Handles arrow key navigation, escape to close, and custom key bindings
 */
export function useGalleryNavigation(options: GalleryNavigationOptions) {
  const {
    itemCount,
    initialIndex = 0,
    loop = true,
    onClose,
    customKeys = {},
    isActive,
    useDocumentListener = false,
  } = options

  const currentIndex = ref(initialIndex)

  function goToPrevious() {
    if (itemCount.value <= 1) return

    if (currentIndex.value > 0) {
      currentIndex.value--
    } else if (loop) {
      currentIndex.value = itemCount.value - 1
    }
  }

  function goToNext() {
    if (itemCount.value <= 1) return

    if (currentIndex.value < itemCount.value - 1) {
      currentIndex.value++
    } else if (loop) {
      currentIndex.value = 0
    }
  }

  function goToIndex(index: number) {
    if (index >= 0 && index < itemCount.value) {
      currentIndex.value = index
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    // Check custom keys first
    const customHandler = customKeys[event.key] || customKeys[event.key.toLowerCase()]
    if (customHandler) {
      customHandler()
      return
    }

    switch (event.key) {
      case 'ArrowLeft':
        goToPrevious()
        break
      case 'ArrowRight':
        goToNext()
        break
      case 'Escape':
        onClose?.()
        break
    }
  }

  // For document-level listeners (modals/lightboxes)
  if (useDocumentListener && isActive) {
    watch(
      isActive,
      (active) => {
        if (active) {
          document.addEventListener('keydown', handleKeydown)
        } else {
          document.removeEventListener('keydown', handleKeydown)
        }
      },
      { immediate: true },
    )

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })
  }

  // Reset index when item count changes (if current index would be out of bounds)
  watch(itemCount, (count) => {
    if (currentIndex.value >= count) {
      currentIndex.value = Math.max(0, count - 1)
    }
  })

  return {
    currentIndex,
    goToPrevious,
    goToNext,
    goToIndex,
    handleKeydown,
  }
}
