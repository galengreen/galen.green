<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    srcset?: string
    srcsetAvif?: string // AVIF srcset for <picture> element
    sizes?: string
    thumbnailSrc?: string
    alt: string
    aspectRatio?: number
    class?: string
    eager?: boolean // Load immediately without waiting for viewport
    fetchpriority?: 'high' | 'low' | 'auto' // Hint for browser loading priority
  }>(),
  {
    eager: false,
    fetchpriority: 'auto',
  },
)

const imageRef = ref<HTMLImageElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
const isInView = ref(props.eager) // If eager, consider immediately in view
const hasError = ref(false)

let observer: IntersectionObserver | null = null

// Computed padding for aspect ratio
const paddingBottom = computed(() => {
  if (props.aspectRatio) {
    return `${props.aspectRatio * 100}%`
  }
  return '66.67%' // Default 3:2 aspect ratio
})

// Check if we should use <picture> element (when AVIF srcset is provided)
const usePicture = computed(() => !!props.srcsetAvif)

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  hasError.value = true
  isLoaded.value = true
}

// Check if image is already cached/complete (e.g., from preloading)
const checkIfAlreadyLoaded = () => {
  nextTick(() => {
    if (imageRef.value?.complete && imageRef.value.naturalWidth > 0) {
      isLoaded.value = true
    }
  })
}

// Watch for imageRef to be available and check if already loaded
watch(imageRef, (img) => {
  if (img?.complete && img.naturalWidth > 0) {
    isLoaded.value = true
  }
})

onMounted(() => {
  // If eager loading, skip IntersectionObserver
  if (props.eager) {
    isInView.value = true
    checkIfAlreadyLoaded()
    return
  }

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
      rootMargin: '200px 0px', // Increased from 50px - start loading earlier
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
  <div ref="containerRef" class="relative overflow-hidden bg-surface" :class="props.class">
    <!-- Aspect ratio placeholder -->
    <div class="aspect-placeholder" :style="{ paddingBottom }"></div>

    <!-- Blur placeholder (thumbnail) -->
    <img
      v-if="thumbnailSrc && !isLoaded"
      :src="thumbnailSrc"
      :alt="alt"
      class="absolute inset-0 h-full w-full scale-110 object-cover blur-[20px] transition-opacity duration-150 [transition-delay:250ms]"
      :class="isLoaded ? 'pointer-events-none opacity-0' : 'opacity-100'"
      aria-hidden="true"
    />

    <!-- Shimmer placeholder when no thumbnail -->
    <div v-else-if="!isLoaded" class="skeleton absolute inset-0"></div>

    <!-- Main image with <picture> for AVIF/WebP (only loads when in view) -->
    <picture v-if="isInView && !hasError && usePicture" class="absolute inset-0 h-full w-full">
      <source :srcset="srcsetAvif" :sizes="sizes" type="image/avif" />
      <source :srcset="srcset" :sizes="sizes" type="image/webp" />
      <img
        ref="imageRef"
        :src="src"
        :alt="alt"
        :fetchpriority="fetchpriority"
        class="image-main absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
        :class="isLoaded ? 'opacity-100' : 'opacity-0'"
        @load="handleLoad"
        @error="handleError"
      />
    </picture>

    <!-- Fallback: simple img when no AVIF srcset -->
    <img
      v-else-if="isInView && !hasError"
      ref="imageRef"
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :fetchpriority="fetchpriority"
      class="image-main absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Error state -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-surface text-sm text-muted"
    >
      <span>Failed to load</span>
    </div>
  </div>
</template>

<style scoped>
.aspect-placeholder {
  width: 100%;
}
</style>
