<script setup lang="ts">
import { computed, provide } from 'vue'
import { RouterView } from 'vue-router'
import ViewportFrame from '@/components/layout/ViewportFrame.vue'
import NavBar from '@/components/layout/NavBar.vue'
import LoadingScreen from '@/components/ui/LoadingScreen.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { useSiteSettingsData } from '@/composables/useSiteSettingsData'
import { getBestImageUrlForWidth, getBestImageUrlForWidthAndFormat } from '@/composables/useMedia'
import type { Media } from '@/types'

const { criticalImagesLoaded, preloadCritical } = useImagePreloader()
const { siteSettings, loadingMessages, loadSiteSettings } = useSiteSettingsData()

// Show loading screen until critical images are loaded
const showLoading = computed(() => !import.meta.env.SSR && !criticalImagesLoaded.value)

/**
 * Get the best image URL to preload based on viewport width
 * Matches the browser's srcset selection logic
 */
function getBestImageUrl(media: Media): string {
  if (typeof window === 'undefined') {
    return getBestImageUrlForWidth(media, 1400)
  }

  const width = window.innerWidth
  const dpr = window.devicePixelRatio || 1
  const targetWidth = width * dpr

  const avifUrl = getBestImageUrlForWidthAndFormat(media, targetWidth, 'avif')
  if (avifUrl) {
    return avifUrl
  }

  return getBestImageUrlForWidth(media, targetWidth)
}

const preloadHeroImages = async () => {
  const settings = await loadSiteSettings()
  const heroUrls: string[] = []

  if (settings?.heroBackground?.light) {
    heroUrls.push(getBestImageUrl(settings.heroBackground.light))
  }

  if (settings?.heroBackground?.dark) {
    heroUrls.push(getBestImageUrl(settings.heroBackground.dark))
  }

  await preloadCritical(heroUrls)
}

void preloadHeroImages()

// Provide site settings and preloader state to child components
provide('siteSettings', siteSettings)
</script>

<template>
  <!-- Loading screen (until critical images loaded) -->
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
