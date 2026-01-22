<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
} from '@/composables/useMedia'
import { useTheme } from '@/composables/useTheme'
import { useImagePreloader } from '@/composables/useImagePreloader'
import type { About, Media, ImageSizeName } from '@/types'

const props = defineProps<{
  about: About | null
  firstName: string
  lastName: string
  backgroundImageLight?: Media
  backgroundImageDark?: Media
  foregroundImageLight?: Media
  foregroundImageDark?: Media
  visible: boolean
}>()

const { isDark } = useTheme()
const { preloadCritical } = useImagePreloader()

// Helper to generate image data for a Media object
function getImageData(media: Media | undefined, size: ImageSizeName = 'xl') {
  if (!media) return null
  return {
    url: getImageUrl(media, size),
    srcset: getImageSrcset(media),
    srcsetAvif: getImageSrcsetAvif(media),
  }
}

const hasBackground = computed(() => props.backgroundImageLight || props.backgroundImageDark)

// Computed image data for all layers
const backgroundLight = computed(() => getImageData(props.backgroundImageLight))
const backgroundDark = computed(() => getImageData(props.backgroundImageDark))
const foregroundLight = computed(() => getImageData(props.foregroundImageLight))
const foregroundDark = computed(() => getImageData(props.foregroundImageDark))
const portrait = computed(() => getImageData(props.about?.photo, 'lg'))

// Preload portrait image when about data arrives
// (hero backgrounds are preloaded in App.vue)
watch(
  portrait,
  (data) => {
    if (data?.url) {
      preloadCritical([data.url])
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
    class="hero-section fade-in"
    :class="{ visible, 'has-background': hasBackground }"
  >
    <!-- Background layer (slowest parallax) -->
    <picture
      v-if="backgroundLight"
      class="hero-layer hero-layer--background"
      :class="{ active: !isDark }"
    >
      <source
        :srcset="backgroundLight.srcsetAvif"
        :sizes="imageSizesPresets.hero"
        type="image/avif"
      />
      <source :srcset="backgroundLight.srcset" :sizes="imageSizesPresets.hero" type="image/webp" />
      <img
        :src="backgroundLight.url"
        alt=""
        aria-hidden="true"
        :style="backgroundParallaxStyle"
        fetchpriority="high"
      />
    </picture>

    <picture
      v-if="backgroundDark"
      class="hero-layer hero-layer--background"
      :class="{ active: isDark }"
    >
      <source
        :srcset="backgroundDark.srcsetAvif"
        :sizes="imageSizesPresets.hero"
        type="image/avif"
      />
      <source :srcset="backgroundDark.srcset" :sizes="imageSizesPresets.hero" type="image/webp" />
      <img
        :src="backgroundDark.url"
        alt=""
        aria-hidden="true"
        :style="backgroundParallaxStyle"
        fetchpriority="high"
      />
    </picture>

    <!-- Foreground layer (faster parallax) -->
    <picture
      v-if="foregroundLight"
      class="hero-layer hero-layer--foreground"
      :class="{ active: !isDark }"
    >
      <source
        :srcset="foregroundLight.srcsetAvif"
        :sizes="imageSizesPresets.hero"
        type="image/avif"
      />
      <source :srcset="foregroundLight.srcset" :sizes="imageSizesPresets.hero" type="image/webp" />
      <img :src="foregroundLight.url" alt="" aria-hidden="true" :style="foregroundParallaxStyle" />
    </picture>

    <picture
      v-if="foregroundDark"
      class="hero-layer hero-layer--foreground"
      :class="{ active: isDark }"
    >
      <source
        :srcset="foregroundDark.srcsetAvif"
        :sizes="imageSizesPresets.hero"
        type="image/avif"
      />
      <source :srcset="foregroundDark.srcset" :sizes="imageSizesPresets.hero" type="image/webp" />
      <img :src="foregroundDark.url" alt="" aria-hidden="true" :style="foregroundParallaxStyle" />
    </picture>

    <div class="hero-content container">
      <div class="hero-image">
        <picture v-if="portrait">
          <source
            :srcset="portrait.srcsetAvif"
            :sizes="imageSizesPresets.avatar"
            type="image/avif"
          />
          <source :srcset="portrait.srcset" :sizes="imageSizesPresets.avatar" type="image/webp" />
          <img
            :src="portrait.url || ''"
            :alt="about?.photo?.alt || 'Profile photo'"
            class="hero-photo"
            fetchpriority="high"
          />
        </picture>
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

.hero-layer img {
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

.hero-photo {
  max-width: 400px;
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: var(--shadow-md);
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

  .hero-photo,
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

  .hero-photo,
  .hero-image-placeholder {
    max-width: 220px;
  }
}
</style>
