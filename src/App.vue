<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import { RouterView } from 'vue-router'
import ViewportFrame from '@/components/layout/ViewportFrame.vue'
import NavBar from '@/components/layout/NavBar.vue'
import LoadingScreen from '@/components/ui/LoadingScreen.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { api } from '@/services/payload'
import { getImageUrl } from '@/composables/useMedia'
import type { SiteSettings } from '@/types'

const { criticalImagesLoaded, preloadCritical } = useImagePreloader()

// Site settings (shared with child components)
const siteSettings = ref<SiteSettings | null>(null)

// Loading messages from CMS
const loadingMessages = computed(() => siteSettings.value?.loadingMessages || [])

// Minimum loading time (2 seconds)
const MIN_LOADING_TIME = 2000
const minTimeElapsed = ref(false)

// Show loading screen until both conditions are met
const showLoading = computed(() => !criticalImagesLoaded.value || !minTimeElapsed.value)

// Start minimum time timer immediately
setTimeout(() => {
  minTimeElapsed.value = true
}, MIN_LOADING_TIME)

// Fetch site settings immediately (not in onMounted) and start preloading hero images
;(async () => {
  try {
    const settings = await api.globals.getSiteSettings()
    siteSettings.value = settings

    // Start preloading hero images immediately
    const heroUrls: string[] = []
    if (settings.heroBackground?.light) {
      heroUrls.push(getImageUrl(settings.heroBackground.light, 'xl'))
    }
    if (settings.heroBackground?.dark) {
      heroUrls.push(getImageUrl(settings.heroBackground.dark, 'xl'))
    }
    if (heroUrls.length > 0) {
      preloadCritical(heroUrls)
    }
  } catch {
    // Silently fail - we'll show a default message
  }
})()

// Provide site settings and preloader state to child components
provide('siteSettings', siteSettings)
provide('imagePreloader', useImagePreloader())
</script>

<template>
  <!-- Loading screen (until critical images loaded and min time elapsed) -->
  <LoadingScreen :visible="showLoading" :messages="loadingMessages" />

  <ViewportFrame>
    <NavBar />
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </ViewportFrame>
</template>
