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
  <div v-if="images.length > 0" class="image-gallery" tabindex="0" @keydown="handleKeydown">
    <!-- Main image container -->
    <div class="gallery-main">
      <!-- Navigation: Previous -->
      <button
        v-if="showNavigation"
        class="gallery-nav gallery-nav-prev"
        aria-label="Previous image"
        @click="goToPrevious"
      >
        <IconChevronLeft />
      </button>

      <!-- Main image -->
      <div class="gallery-image-wrapper">
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
          class="gallery-image"
          eager
        />
      </div>

      <!-- Navigation: Next -->
      <button
        v-if="showNavigation"
        class="gallery-nav gallery-nav-next"
        aria-label="Next image"
        @click="goToNext"
      >
        <IconChevronRight />
      </button>
    </div>

    <!-- Caption -->
    <div v-if="activeImage.caption" class="gallery-caption">
      {{ activeImage.caption }}
    </div>

    <!-- Thumbnails -->
    <div v-if="showThumbnails" class="gallery-thumbnails">
      <button
        v-for="(thumb, index) in images"
        :key="index"
        class="thumbnail-item"
        :class="{ active: index === activeIndex }"
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
          class="thumbnail-image"
          eager
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.image-gallery {
  width: 100%;
  outline: none;
}

/* Main image area */
.gallery-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.gallery-image {
  width: 100%;
  max-width: 100%;
  border-radius: var(--radius-sm);
}

/* Navigation buttons */
.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text);
  cursor: pointer;
  outline: none;
  opacity: 0;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
  z-index: 1;
}

.gallery-nav:hover {
  background: var(--color-surface);
}

.gallery-nav-prev {
  left: var(--space-2);
}

.gallery-nav-next {
  right: var(--space-2);
}

.image-gallery:hover .gallery-nav,
.image-gallery:focus-within .gallery-nav {
  opacity: 1;
}

/* Caption */
.gallery-caption {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
}

/* Thumbnails */
.gallery-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-3);
}

.thumbnail-item {
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
  outline: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.thumbnail-item:hover {
  opacity: 0.9;
}

.thumbnail-item.active {
  opacity: 1;
}

.thumbnail-image {
  display: block;
  width: 80px;
  border-radius: calc(var(--radius-sm) - 2px);
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-image {
    max-height: 300px;
  }

  .gallery-nav {
    width: 32px;
    height: 32px;
    opacity: 1;
  }

  .thumbnail-image {
    width: 60px;
  }
}

@media (max-width: 480px) {
  .thumbnail-image {
    width: 50px;
  }
}
</style>
