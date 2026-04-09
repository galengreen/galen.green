<script setup lang="ts">
import { computed } from 'vue'
import LazyImage from './LazyImage.vue'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'
import { useGalleryNavigation } from '@/composables/useGalleryNavigation'

export interface GalleryImage {
  src: string
  srcset?: string
  srcsetAvif?: string
  thumbnailSrc: string
  thumbnailSrcset?: string
  thumbnailSrcsetAvif?: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

const props = defineProps<{
  images: GalleryImage[]
}>()

const itemCount = computed(() => props.images.length)

const {
  currentIndex: activeIndex,
  goToPrevious,
  goToNext,
  goToIndex,
  handleKeydown,
} = useGalleryNavigation({
  itemCount,
  loop: true,
})

// activeImage is guaranteed to exist when images.length > 0 (guarded in template)
const activeImage = computed(() => props.images[activeIndex.value] as GalleryImage)
const showNavigation = computed(() => props.images.length > 1)
const showThumbnails = computed(() => props.images.length > 1)
</script>

<template>
  <div v-if="images.length > 0" class="w-full outline-none" tabindex="0" @keydown="handleKeydown">
    <!-- Main image container -->
    <div class="relative flex items-center justify-center">
      <!-- Navigation: Previous -->
      <button
        v-if="showNavigation"
        class="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg text-text transition hover:bg-surface md:h-10 md:w-10"
        aria-label="Previous image"
        @click="goToPrevious"
      >
        <IconChevronLeft />
      </button>

      <!-- Main image -->
      <div class="flex w-full justify-center">
        <LazyImage
          :key="activeIndex"
          :src="activeImage.src"
          :srcset="activeImage.srcset"
          :srcset-avif="activeImage.srcsetAvif"
          sizes="100vw"
          :thumbnail-src="activeImage.thumbnailSrc"
          :alt="activeImage.alt"
          :aspect-ratio="
            activeImage.width && activeImage.height
              ? activeImage.height / activeImage.width
              : undefined
          "
          class="max-w-full rounded-lg md:max-h-[300px]"
          eager
        />
      </div>

      <!-- Navigation: Next -->
      <button
        v-if="showNavigation"
        class="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg text-text transition hover:bg-surface md:h-10 md:w-10"
        aria-label="Next image"
        @click="goToNext"
      >
        <IconChevronRight />
      </button>
    </div>

    <!-- Caption -->
    <div v-if="activeImage.caption" class="mt-2 text-center text-sm text-muted">
      {{ activeImage.caption }}
    </div>

    <!-- Thumbnails -->
    <div v-if="showThumbnails" class="mt-3 flex flex-wrap justify-center gap-2">
      <button
        v-for="(thumb, index) in images"
        :key="index"
        class="rounded-lg transition"
        :class="index === activeIndex ? 'opacity-100' : 'opacity-60 hover:opacity-90'"
        :aria-label="`View image ${index + 1}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="goToIndex(index)"
      >
        <LazyImage
          :src="thumb.thumbnailSrc"
          :srcset="thumb.thumbnailSrcset"
          :srcset-avif="thumb.thumbnailSrcsetAvif"
          :alt="thumb.alt"
          :aspect-ratio="thumb.width && thumb.height ? thumb.height / thumb.width : 3 / 4"
          class="w-[60px] overflow-hidden rounded-md md:w-20"
          eager
        />
      </button>
    </div>
  </div>
</template>
