<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getImageUrl, imageSizesPresets } from '@/composables/useMedia'
import { useTheme } from '@/composables/useTheme'
import { useImagePreloader } from '@/composables/useImagePreloader'
import type { About, Media } from '@/types'
import PictureImage from '@/components/ui/PictureImage.vue'
import ResponsiveImage from '@/components/ui/ResponsiveImage.vue'

const props = defineProps<{
  about: About | null
  firstName: string
  lastName: string
  backgroundImageLight?: Media
  backgroundImageDark?: Media
  foregroundImageLight?: Media
  foregroundImageDark?: Media
}>()

const { isDark } = useTheme()
const { preloadCritical } = useImagePreloader()

const hasBackground = computed(() => props.backgroundImageLight || props.backgroundImageDark)

const portraitMedia = computed(() => props.about?.photo)

// Preload portrait image when about data arrives
// (hero backgrounds are preloaded in App.vue)
watch(
  portraitMedia,
  (media) => {
    if (media) {
      preloadCritical([getImageUrl(media, 'lg')])
    }
  },
  { immediate: true },
)

// Parallax effect - each layer scrolls at a different speed
const parallaxOffset = ref(0)
const BACKGROUND_PARALLAX_SPEED = 0.5 // Background moves more (further from viewer)
const FOREGROUND_PARALLAX_SPEED = 0.3 // Foreground moves less (closer to viewer)
let scrollContainer: HTMLElement | null = null
let rafId: number | null = null
let ticking = false

const updateParallax = () => {
  if (scrollContainer) {
    parallaxOffset.value = scrollContainer.scrollTop
  }
  ticking = false
}

const handleScroll = () => {
  if (!ticking) {
    rafId = requestAnimationFrame(updateParallax)
    ticking = true
  }
}

onMounted(() => {
  scrollContainer = document.getElementById('scroll-root')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
})

const backgroundParallaxStyle = computed(() => ({
  transform: `translateY(${parallaxOffset.value * BACKGROUND_PARALLAX_SPEED}px)`,
}))

const foregroundParallaxStyle = computed(() => ({
  transform: `translateY(${parallaxOffset.value * FOREGROUND_PARALLAX_SPEED}px)`,
}))
</script>

<template>
  <section
    id="hero"
    class="hero-section fade-in visible"
    :class="{ 'has-background': hasBackground }"
  >
    <!-- Background layer (slowest parallax) -->
    <PictureImage
      v-if="backgroundImageLight"
      :media="backgroundImageLight"
      size="xl"
      :sizes="imageSizesPresets.hero"
      alt=""
      class="hero-layer hero-layer--background"
      :class="{ active: !isDark }"
      fetchpriority="high"
      :img-style="backgroundParallaxStyle"
      aria-hidden
    />

    <PictureImage
      v-if="backgroundImageDark"
      :media="backgroundImageDark"
      size="xl"
      :sizes="imageSizesPresets.hero"
      alt=""
      class="hero-layer hero-layer--background"
      :class="{ active: isDark }"
      fetchpriority="high"
      :img-style="backgroundParallaxStyle"
      aria-hidden
    />

    <!-- Foreground layer (faster parallax) -->
    <PictureImage
      v-if="foregroundImageLight"
      :media="foregroundImageLight"
      size="xl"
      :sizes="imageSizesPresets.hero"
      alt=""
      class="hero-layer hero-layer--foreground"
      :class="{ active: !isDark }"
      :img-style="foregroundParallaxStyle"
      aria-hidden
    />

    <PictureImage
      v-if="foregroundImageDark"
      :media="foregroundImageDark"
      size="xl"
      :sizes="imageSizesPresets.hero"
      alt=""
      class="hero-layer hero-layer--foreground"
      :class="{ active: isDark }"
      :img-style="foregroundParallaxStyle"
      aria-hidden
    />

    <div class="hero-content container">
      <div class="hero-image">
        <ResponsiveImage
          v-if="portraitMedia"
          :media="portraitMedia"
          size="lg"
          sizes-preset="avatar"
          :alt="about?.photo?.alt || 'Profile photo'"
          class="hero-photo"
          :aspect-ratio="1"
          eager
          fetchpriority="high"
        />
        <div v-else class="hero-image-placeholder"></div>
      </div>
      <div class="hero-text">
        <h1 class="hero-name">{{ firstName }} {{ lastName }}</h1>
        <p class="hero-subtitle">
          {{ about?.subtitle }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: var(--space-16) 0;
  position: relative;
}

.hero-section.has-background {
  min-height: 100vh;
  margin-top: calc(-1 * (var(--navbar-height) + var(--navbar-top) + var(--space-8)));
  padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-16));
  overflow: visible;
}

/* Shared styles for parallax layers */
.hero-layer {
  position: absolute;
  top: -300px;
  left: 0;
  width: 100%;
  height: calc(100% + 300px);
  pointer-events: none;
  opacity: 0;
}

.hero-layer :deep(img) {
  width: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: top center;
  will-change: transform;
}

.hero-layer.active {
  opacity: 1;
}

.hero-layer--background {
  z-index: 0;
}

.hero-layer--foreground {
  z-index: 1;
}

.hero-section.has-background .hero-content {
  position: relative;
  z-index: 2;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

:deep(.hero-photo.lazy-image-container) {
  max-width: 400px;
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  box-shadow: var(--shadow-md);
}

:deep(.hero-photo .aspect-placeholder) {
  border-radius: 50%;
  background: transparent;
}

:deep(.hero-photo .image-main),
:deep(.hero-photo .image-blur),
:deep(.hero-photo .image-shimmer) {
  border-radius: 50%;
}

.hero-image-placeholder {
  aspect-ratio: 1/1;
  max-width: 400px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subtle);
  box-shadow: var(--shadow-md);
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero-name {
  display: flex;
  flex-direction: column;
  font-size: var(--text-6xl);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: var(--text-shadow-hero);
}

.hero-subtitle {
  font-size: var(--text-2xl);
  text-shadow: var(--text-shadow-hero);
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 70vh;
    padding: var(--space-8) 0;
  }

  .hero-section.has-background {
    min-height: 100vh;
    margin-top: calc(-1 * (var(--navbar-height) + var(--navbar-top) + var(--space-4)));
    padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-8));
  }

  .hero-layer {
    top: 0;
    height: 100%;
  }

  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--space-8);
  }

  :deep(.hero-photo.lazy-image-container),
  .hero-image-placeholder {
    margin: 0 auto;
    max-width: 280px;
  }

  .hero-name {
    font-size: var(--text-6xl);
  }
}

@media (max-width: 480px) {
  .hero-name {
    font-size: var(--text-5xl);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
  }

  :deep(.hero-photo.lazy-image-container),
  .hero-image-placeholder {
    max-width: 220px;
  }
}
</style>
