<script setup lang="ts">
import { ref, computed } from 'vue'

export interface GalleryImage {
  src: string
  srcset?: string
  srcsetAvif?: string
  thumbnailSrc: string
  thumbnailSrcset?: string
  thumbnailSrcsetAvif?: string
  alt: string
  caption?: string
}

const props = defineProps<{
  images: GalleryImage[]
}>()

const activeIndex = ref(0)

// activeImage is guaranteed to exist when images.length > 0 (guarded in template)
const activeImage = computed(() => props.images[activeIndex.value] as GalleryImage)
const showNavigation = computed(() => props.images.length > 1)
const showThumbnails = computed(() => props.images.length > 1)

function goToPrevious() {
  activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : props.images.length - 1
}

function goToNext() {
  activeIndex.value = activeIndex.value < props.images.length - 1 ? activeIndex.value + 1 : 0
}

function selectImage(index: number) {
  activeIndex.value = index
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    goToPrevious()
  } else if (event.key === 'ArrowRight') {
    goToNext()
  }
}
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Main image -->
      <div class="gallery-image-wrapper">
        <picture v-if="activeImage.srcsetAvif">
          <source :srcset="activeImage.srcsetAvif" sizes="100vw" type="image/avif" />
          <source :srcset="activeImage.srcset" sizes="100vw" type="image/webp" />
          <img
            :key="activeIndex"
            :src="activeImage.src"
            :alt="activeImage.alt"
            class="gallery-image"
          />
        </picture>
        <img
          v-else
          :key="activeIndex"
          :src="activeImage.src"
          :srcset="activeImage.srcset"
          sizes="100vw"
          :alt="activeImage.alt"
          class="gallery-image"
        />
      </div>

      <!-- Navigation: Next -->
      <button
        v-if="showNavigation"
        class="gallery-nav gallery-nav-next"
        aria-label="Next image"
        @click="goToNext"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
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
        @click="selectImage(index)"
      >
        <picture v-if="thumb.thumbnailSrcsetAvif">
          <source :srcset="thumb.thumbnailSrcsetAvif" type="image/avif" />
          <source :srcset="thumb.thumbnailSrcset" type="image/webp" />
          <img :src="thumb.thumbnailSrc" :alt="thumb.alt" class="thumbnail-image" />
        </picture>
        <img v-else :src="thumb.thumbnailSrc" :alt="thumb.alt" class="thumbnail-image" />
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
  max-width: 100%;
  object-fit: contain;
  background: var(--color-surface);
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
  height: 60px;
  object-fit: cover;
  border-radius: calc(var(--radius-sm) - 2px);
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
    height: 45px;
  }
}

@media (max-width: 480px) {
  .thumbnail-image {
    width: 50px;
    height: 38px;
  }
}
</style>
