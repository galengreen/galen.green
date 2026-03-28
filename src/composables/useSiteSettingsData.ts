import { computed, onServerPrefetch, ref } from 'vue'
import { useCmsState } from '@/composables/useCmsState'
import { api } from '@/services/payload'
import type { SiteSettings } from '@/types'

export function useSiteSettingsData() {
  const cmsState = useCmsState()
  const siteSettings = ref<SiteSettings | null>(cmsState.siteSettings)
  const loadingMessages = computed(() => siteSettings.value?.loadingMessages || [])

  let request: Promise<SiteSettings | null> | null = null

  async function loadSiteSettings(): Promise<SiteSettings | null> {
    if (siteSettings.value) {
      return siteSettings.value
    }

    if (request) {
      return request
    }

    request = api.globals
      .getSiteSettings()
      .then((settings) => {
        siteSettings.value = settings
        cmsState.siteSettings = settings
        return settings
      })
      .catch(() => null)
      .finally(() => {
        request = null
      })

    return request
  }

  if (import.meta.env.SSR) {
    onServerPrefetch(loadSiteSettings)
  }

  return {
    siteSettings,
    loadingMessages,
    loadSiteSettings,
  }
}
