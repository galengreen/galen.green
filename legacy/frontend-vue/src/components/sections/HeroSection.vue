<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getImageUrl, imageSizesPresets } from '@/composables/useMedia'
import { useTheme } from '@/composables/useTheme'
import { useImagePreloader } from '@/composables/useImagePreloader'
import ContentContainer from '@/components/layout/ContentContainer.vue'
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

const heroSectionClass = computed(() => {
  return [
    'hero-section fade-in visible relative flex min-h-[70vh] items-center py-8 md:min-h-[80vh] md:py-16',
    hasBackground.value
      ? 'min-h-screen -mt-[calc(var(--navbar-height)+var(--navbar-top)+1rem)] overflow-visible pt-[calc(var(--navbar-height)+var(--navbar-top)+2rem)] md:-mt-[calc(var(--navbar-height)+var(--navbar-top)+2rem)] md:pt-[calc(var(--navbar-height)+var(--navbar-top)+4rem)]'
      : '',
  ]
})
</script>

<template>
  <section id="hero" :class="heroSectionClass">
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

    <ContentContainer
      class="relative z-[2] grid items-center gap-8 text-center md:grid-cols-2 md:gap-12 md:text-left"
    >
      <div class="w-full">
        <ResponsiveImage
          v-if="portraitMedia"
          :media="portraitMedia"
          size="lg"
          sizes-preset="avatar"
          :alt="about?.photo?.alt || 'Profile photo'"
          class="hero-photo mx-auto w-full max-w-[220px] overflow-hidden rounded-full bg-transparent shadow-soft sm:max-w-[280px] md:mx-0 md:max-w-[400px] [&_.aspect-placeholder]:rounded-full [&_.aspect-placeholder]:bg-transparent [&_.image-main]:rounded-full [&_.image-blur]:rounded-full [&_.image-shimmer]:rounded-full"
          :aspect-ratio="1"
          eager
          fetchpriority="high"
        />
        <div
          v-else
          class="mx-auto aspect-square w-full max-w-[220px] rounded-full border border-border bg-surface shadow-soft sm:max-w-[280px] md:mx-0 md:max-w-[400px]"
        ></div>
      </div>
      <div class="flex flex-col gap-4">
        <h1
          class="flex flex-col text-5xl font-bold leading-none tracking-[-0.02em] text-text md:text-[4.3rem]"
        >
          {{ firstName }} {{ lastName }}
        </h1>
        <p class="text-lg text-text md:text-2xl">
          {{ about?.subtitle }}
        </p>
      </div>
    </ContentContainer>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
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

.hero-section :deep(.hero-photo img),
.hero-section :deep(.hero-photo .image-main),
.hero-section :deep(.hero-photo .image-blur),
.hero-section :deep(.hero-photo .image-shimmer) {
  text-shadow: var(--text-shadow-hero);
}

.hero-section h1,
.hero-section p {
  text-shadow: var(--text-shadow-hero);
}

@media (max-width: 768px) {
  .hero-layer {
    top: 0;
    height: 100%;
  }
}
</style>
