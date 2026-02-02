import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * Composable for hash-based deep links to content items.
 * Updates the URL hash when an item is selected and auto-opens
 * the matching item when the page loads with a hash.
 *
 * Hash format: #section/slug (e.g. #blog/my-first-post)
 */
export function useDeepLink<T extends { id: string; slug: string }>(
  section: string,
  items: () => T[],
) {
  const selectedId = ref<string | null>(null)

  const hashPrefix = `#${section}/`

  const getSlugFromHash = (): string | null => {
    const hash = window.location.hash
    if (hash.startsWith(hashPrefix)) {
      return hash.slice(hashPrefix.length)
    }
    return null
  }

  const open = (id: string) => {
    const item = items().find((i) => i.id === id)
    selectedId.value = id
    if (item) {
      history.replaceState(null, '', `${hashPrefix}${item.slug}`)
    }
  }

  const close = () => {
    selectedId.value = null
    // Restore the section hash so scroll position anchors still work
    history.replaceState(null, '', `#${section}`)
  }

  const onHashChange = () => {
    const slug = getSlugFromHash()
    if (slug) {
      const item = items().find((i) => i.slug === slug)
      if (item) {
        selectedId.value = item.id
      }
    } else if (!window.location.hash.startsWith(hashPrefix)) {
      selectedId.value = null
    }
  }

  // Auto-open from hash on mount, but only once items are available
  const stopWatch = watch(
    () => items(),
    (list) => {
      if (list.length === 0) return
      const slug = getSlugFromHash()
      if (slug) {
        const item = list.find((i) => i.slug === slug)
        if (item) {
          selectedId.value = item.id
        }
      }
      stopWatch()
    },
    { immediate: true },
  )

  onMounted(() => {
    window.addEventListener('hashchange', onHashChange)
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  })

  return { selectedId, open, close }
}
