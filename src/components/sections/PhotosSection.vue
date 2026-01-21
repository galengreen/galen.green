<script setup lang="ts">
import { computed, ref } from 'vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import MasonryGrid from '@/components/ui/MasonryGrid.vue'
import PhotoLightbox from '@/components/ui/PhotoLightbox.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import {
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
} from '@/composables/useMedia'
import type { Photo } from '@/types'

const props = defineProps<{
  title: string
  photos: Photo[]
  loading: boolean
  visible: boolean
}>()

const showLightbox = ref(false)
const lightboxIndex = ref(0)

const openPhoto = (id: string) => {
  const index = props.photos.findIndex((p) => p.id === id)
  if (index !== -1) {
    lightboxIndex.value = index
    showLightbox.value = true
  }
}

const photosWithDimensions = computed(() => {
  return props.photos.map((photo) => ({
    ...photo,
    width: photo.image?.width || 100,
    height: photo.image?.height || 100,
  }))
})
</script>

<template>
  <section id="photos" class="section fade-in" :class="{ visible }">
    <div class="container">
      <h2 class="section-title">{{ title }}</h2>

      <div v-if="loading" class="photos-grid-loading">
        <div v-for="i in 6" :key="i" class="photo-item">
          <SkeletonBox :aspect-ratio="3 / 4" rounded="sm" />
        </div>
      </div>

      <MasonryGrid
        v-else-if="photos.length"
        :photos="photosWithDimensions"
        :column-count="3"
        :gap="16"
        @photo-click="openPhoto"
      >
        <template #item="{ photo, aspectRatio }">
          <div class="photo-item">
            <LazyImage
              :src="getImageUrl(photo.image, 'md')"
              :srcset="getImageSrcset(photo.image)"
              :srcset-avif="getImageSrcsetAvif(photo.image)"
              :sizes="imageSizesPresets.photoGrid"
              :thumbnail-src="getImageUrl(photo.image, 'xs')"
              :alt="photo.title"
              :aspect-ratio="aspectRatio"
              class="photo-image"
            />
          </div>
        </template>
      </MasonryGrid>

      <EmptyState v-else message="Photos coming soon..." />

      <!-- Fullscreen lightbox -->
      <PhotoLightbox
        :photos="photos"
        :initial-index="lightboxIndex"
        :open="showLightbox"
        @close="showLightbox = false"
      />
    </div>
  </section>
</template>

<style scoped>
.photos-grid-loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.photo-item {
  overflow: hidden;
  border-radius: var(--space-2);
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.photo-image {
  width: 100%;
  display: block;
  border-radius: var(--space-2);
}

/* skeleton class is defined globally in transitions.css */

@media (max-width: 767px) {
  .photos-grid-loading {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}
</style>
