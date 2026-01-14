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
import type { About, Media } from '@/types'

const props = defineProps<{
  about: About | null
  firstName: string
  lastName: string
  backgroundImageLight?: Media
  backgroundImageDark?: Media
  visible: boolean
}>()

const { isDark } = useTheme()
const { preloadCritical } = useImagePreloader()

const hasBackground = computed(() => props.backgroundImageLight || props.backgroundImageDark)

// Image URLs for both themes (using xl size for hero)
const lightImageUrl = computed(() =>
  props.backgroundImageLight ? getImageUrl(props.backgroundImageLight, 'xl') : null,
)
const darkImageUrl = computed(() =>
  props.backgroundImageDark ? getImageUrl(props.backgroundImageDark, 'xl') : null,
)

// Srcset for responsive hero backgrounds (WebP)
const lightImageSrcset = computed(() =>
  props.backgroundImageLight ? getImageSrcset(props.backgroundImageLight) : '',
)
const darkImageSrcset = computed(() =>
  props.backgroundImageDark ? getImageSrcset(props.backgroundImageDark) : '',
)

// Srcset for responsive hero backgrounds (AVIF)
const lightImageSrcsetAvif = computed(() =>
  props.backgroundImageLight ? getImageSrcsetAvif(props.backgroundImageLight) : '',
)
const darkImageSrcsetAvif = computed(() =>
  props.backgroundImageDark ? getImageSrcsetAvif(props.backgroundImageDark) : '',
)

// Portrait image
const portraitUrl = computed(() =>
  props.about?.photo ? getImageUrl(props.about.photo, 'lg') : null,
)
const portraitSrcset = computed(() => (props.about?.photo ? getImageSrcset(props.about.photo) : ''))
const portraitSrcsetAvif = computed(() =>
  props.about?.photo ? getImageSrcsetAvif(props.about.photo) : '',
)

// Track which images are loaded for instant theme switching
const lightLoaded = ref(false)
const darkLoaded = ref(false)

// Preload portrait image when about data arrives
// (hero backgrounds are preloaded in App.vue)
watch(
  () => props.about?.photo,
  (photo) => {
    if (photo) {
      const url = getImageUrl(photo, 'lg')
      if (url) {
        preloadCritical([url])
      }
    }
  },
  { immediate: true },
)

// Parallax effect - image scrolls faster than content
const parallaxOffset = ref(0)
const PARALLAX_SPEED = 0.3 // Extra scroll speed (image moves 1.4x faster)
let scrollContainer: HTMLElement | null = null

const handleScroll = () => {
  if (scrollContainer) {
    parallaxOffset.value = scrollContainer.scrollTop * PARALLAX_SPEED
  }
}

onMounted(() => {
  // Set up parallax scroll listener
  scrollContainer = document.getElementById('scroll-root')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})

const parallaxStyle = computed(() => ({
  transform: `translateY(${parallaxOffset.value}px)`,
}))
</script>

<template>
  <section
    id="hero"
    class="hero-section fade-in"
    :class="{ visible, 'has-background': hasBackground }"
  >
    <!-- Preload both theme backgrounds for instant switching -->
    <!-- Light theme background (hidden when dark) -->
    <picture
      v-if="lightImageUrl"
      class="hero-background hero-background-light"
      :class="{ active: !isDark }"
    >
      <source :srcset="lightImageSrcsetAvif" :sizes="imageSizesPresets.hero" type="image/avif" />
      <source :srcset="lightImageSrcset" :sizes="imageSizesPresets.hero" type="image/webp" />
      <img
        :src="lightImageUrl"
        alt=""
        aria-hidden="true"
        :style="parallaxStyle"
        fetchpriority="high"
        @load="lightLoaded = true"
      />
    </picture>

    <!-- Dark theme background (hidden when light) -->
    <picture
      v-if="darkImageUrl"
      class="hero-background hero-background-dark"
      :class="{ active: isDark }"
    >
      <source :srcset="darkImageSrcsetAvif" :sizes="imageSizesPresets.hero" type="image/avif" />
      <source :srcset="darkImageSrcset" :sizes="imageSizesPresets.hero" type="image/webp" />
      <img
        :src="darkImageUrl"
        alt=""
        aria-hidden="true"
        :style="parallaxStyle"
        fetchpriority="high"
        @load="darkLoaded = true"
      />
    </picture>

    <div class="hero-content container">
      <div class="hero-image">
        <picture v-if="about?.photo">
          <source
            :srcset="portraitSrcsetAvif"
            :sizes="imageSizesPresets.avatar"
            type="image/avif"
          />
          <source :srcset="portraitSrcset" :sizes="imageSizesPresets.avatar" type="image/webp" />
          <img
            :src="portraitUrl || ''"
            :alt="about.photo.alt || 'Profile photo'"
            class="hero-photo"
            fetchpriority="high"
          />
        </picture>
        <div v-else class="hero-image-placeholder"></div>
      </div>
      <div class="hero-text">
        <h1 class="hero-name">
          <span class="name-first">{{ firstName }}</span>
          <span class="name-last">{{ lastName }}</span>
        </h1>
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

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  z-index: 0;
  pointer-events: none;
  /* Both backgrounds are rendered but only one is visible */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hero-background img {
  width: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: top center;
  will-change: transform;
}

.hero-background.active {
  opacity: 1;
}

.hero-section.has-background .hero-content {
  position: relative;
  z-index: 1;
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
}

.hero-subtitle {
  font-size: var(--text-xl);
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
    font-size: var(--text-5xl);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 60vh;
  }

  .hero-section.has-background {
    min-height: 100vh;
    margin-top: calc(-1 * (var(--navbar-height) + var(--navbar-top) + var(--space-4)));
    padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-8));
  }

  .hero-name {
    font-size: var(--text-4xl);
  }

  .hero-photo,
  .hero-image-placeholder {
    max-width: 220px;
  }
}
</style>
