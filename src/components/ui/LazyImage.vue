<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  src: string
  thumbnailSrc?: string
  alt: string
  aspectRatio?: number
  class?: string
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
const isInView = ref(false)
const hasError = ref(false)

let observer: IntersectionObserver | null = null

// Computed padding for aspect ratio
const paddingBottom = computed(() => {
  if (props.aspectRatio) {
    return `${props.aspectRatio * 100}%`
  }
  return '66.67%' // Default 3:2 aspect ratio
})

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  hasError.value = true
  isLoaded.value = true
}

onMounted(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately if no IntersectionObserver
    isInView.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          // Stop observing once in view
          if (observer && containerRef.value) {
            observer.unobserve(containerRef.value)
          }
        }
      })
    },
    {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01,
    },
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="lazy-image-container"
    :class="[props.class, { loaded: isLoaded, error: hasError }]"
  >
    <!-- Aspect ratio placeholder -->
    <div class="aspect-placeholder" :style="{ paddingBottom }"></div>

    <!-- Blur placeholder (thumbnail) -->
    <img
      v-if="thumbnailSrc && !isLoaded"
      :src="thumbnailSrc"
      :alt="alt"
      class="image-blur"
      aria-hidden="true"
    />

    <!-- Shimmer placeholder when no thumbnail -->
    <div v-else-if="!isLoaded && !thumbnailSrc" class="image-shimmer"></div>

    <!-- Main image (only loads when in view) -->
    <img
      v-if="isInView && !hasError"
      ref="imageRef"
      :src="src"
      :alt="alt"
      class="image-main"
      :class="{ visible: isLoaded }"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Error state -->
    <div v-if="hasError" class="image-error">
      <span>Failed to load</span>
    </div>
  </div>
</template>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: var(--color-surface);
}

.aspect-placeholder {
  width: 100%;
}

.image-blur,
.image-main,
.image-shimmer,
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Blur placeholder */
.image-blur {
  filter: blur(20px);
  transform: scale(1.1);
  transition:
    opacity var(--duration-normal) var(--ease-out),
    filter var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.loaded .image-blur {
  opacity: 0;
}

/* Shimmer effect when no thumbnail */
.image-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-border) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.loaded .image-shimmer {
  display: none;
}

/* Main image */
.image-main {
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.image-main.visible {
  opacity: 1;
}

/* Error state */
.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
