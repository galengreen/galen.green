<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getImageUrl } from '@/composables/useMedia'
import { useTheme } from '@/composables/useTheme'
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

const hasBackground = computed(() => props.backgroundImageLight || props.backgroundImageDark)

const lightImageUrl = computed(() =>
  props.backgroundImageLight ? getImageUrl(props.backgroundImageLight, 'large') : null,
)
const darkImageUrl = computed(() =>
  props.backgroundImageDark ? getImageUrl(props.backgroundImageDark, 'large') : null,
)

const backgroundImage = computed(() => {
  const image = isDark.value ? props.backgroundImageDark : props.backgroundImageLight
  const url = isDark.value ? darkImageUrl.value : lightImageUrl.value
  if (!image || !url) return null
  return {
    url,
    alt: image.alt || 'Hero background',
  }
})

// Preload both images so theme switching is instant
const preloadImage = (url: string | null) => {
  if (url) {
    const img = new Image()
    img.src = url
  }
}

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
  // Preload both theme images
  preloadImage(lightImageUrl.value)
  preloadImage(darkImageUrl.value)

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
    <img
      v-if="backgroundImage"
      :src="backgroundImage.url"
      :alt="backgroundImage.alt"
      class="hero-background"
      :style="parallaxStyle"
    />
    <div class="hero-content container">
      <div class="hero-image">
        <img
          v-if="about?.photo"
          :src="getImageUrl(about.photo, 'large')"
          :alt="about.photo.alt || 'Profile photo'"
          class="hero-photo"
        />
        <div v-else class="hero-image-placeholder"></div>
      </div>
      <div class="hero-text">
        <h1 class="hero-name">
          <span class="name-first">{{ firstName }}</span>
          <span class="name-last">{{ lastName }}</span>
        </h1>
        <p class="hero-subtitle text-muted">
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
  object-fit: cover;
  object-position: top center;
  z-index: 0;
  pointer-events: none;
  will-change: transform;
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
