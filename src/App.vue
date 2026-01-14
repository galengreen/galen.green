<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import ViewportFrame from '@/components/layout/ViewportFrame.vue'
import NavBar from '@/components/layout/NavBar.vue'
import LoadingScreen from '@/components/ui/LoadingScreen.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { api } from '@/services/payload'
import type { LoadingMessage } from '@/types'

const { criticalImagesLoaded, markVisited, isFirstVisit } = useImagePreloader()

// Loading messages from CMS
const loadingMessages = ref<LoadingMessage[]>([])

// Track if loading screen should be visible
const showLoading = ref(isFirstVisit())

// Fetch loading messages early (before main content)
onMounted(async () => {
  if (isFirstVisit()) {
    try {
      const settings = await api.globals.getSiteSettings()
      loadingMessages.value = settings.loadingMessages || []
    } catch {
      // Silently fail - we'll show a default message
    }
  }
})

// Hide loading screen when critical images are loaded
const onLoadingHidden = () => {
  markVisited()
}

// Provide preloader state to child components
provide('imagePreloader', useImagePreloader())
</script>

<template>
  <!-- Loading screen (first visit only) -->
  <LoadingScreen
    :visible="showLoading && !criticalImagesLoaded"
    :messages="loadingMessages"
    @hidden="onLoadingHidden"
  />

  <ViewportFrame>
    <NavBar />
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </ViewportFrame>
</template>
