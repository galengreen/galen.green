<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import { RouterView } from 'vue-router'
import ViewportFrame from '@/components/layout/ViewportFrame.vue'
import NavBar from '@/components/layout/NavBar.vue'
import LoadingScreen from '@/components/ui/LoadingScreen.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { api } from '@/services/payload'
import { getImageUrl } from '@/composables/useMedia'
import type { Media, SiteSettings } from '@/types'

const { criticalImagesLoaded, preloadCritical } = useImagePreloader()

// Site settings (shared with child components)
const siteSettings = ref<SiteSettings | null>(null)

// Loading messages from CMS
const loadingMessages = computed(() => siteSettings.value?.loadingMessages || [])

// Show loading screen until critical images are loaded
const showLoading = computed(() => !criticalImagesLoaded.value)

/**
 * Get the best image URL to preload based on viewport width
 * Matches the browser's srcset selection logic
 */
function getBestImageUrl(media: Media): string {
  const width = window.innerWidth
  const dpr = window.devicePixelRatio || 1
  const targetWidth = width * dpr

  // Check AVIF first (browser prefers it), then WebP
  const sizes = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const
  const sizeWidths = { xxl: 1920, xl: 1400, lg: 1024, md: 768, sm: 480, xs: 320 }

  // Find the smallest size that covers the target width
  let bestSize: (typeof sizes)[number] = 'xl'
  for (const size of [...sizes].reverse()) {
    if (sizeWidths[size] >= targetWidth) {
      bestSize = size
      break
    }
  }

  // Try AVIF first (what modern browsers will choose)
  const avifSize = `${bestSize}-avif` as const
  const avifUrl = getImageUrl(media, avifSize)
  if (avifUrl) return avifUrl

  // Fall back to WebP
  return getImageUrl(media, bestSize)
}

// Fetch site settings immediately (not in onMounted) and start preloading hero images
;(async () => {
  try {
    const settings = await api.globals.getSiteSettings()
    siteSettings.value = settings

    // Start preloading hero images immediately
    // Use the same URL the browser will select based on viewport/DPR
    const heroUrls: string[] = []
    if (settings.heroBackground?.light) {
      heroUrls.push(getBestImageUrl(settings.heroBackground.light))
    }
    if (settings.heroBackground?.dark) {
      heroUrls.push(getBestImageUrl(settings.heroBackground.dark))
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
