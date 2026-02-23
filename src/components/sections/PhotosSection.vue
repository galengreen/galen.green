<script setup lang="ts">
import { computed, ref } from 'vue'
import SectionShell from '@/components/sections/SectionShell.vue'
import ResponsiveImage from '@/components/ui/ResponsiveImage.vue'
import MasonryGrid from '@/components/ui/MasonryGrid.vue'
import PhotoLightbox from '@/components/ui/PhotoLightbox.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import type { Photo } from '@/types'

const props = defineProps<{
  title: string
  photos: Photo[]
  loading: boolean
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
  <SectionShell id="photos" :title="title">
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
          <ResponsiveImage
            :media="photo.image"
            :alt="photo.title"
            size="md"
            sizes-preset="photoGrid"
            thumbnail-size="xs"
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
  </SectionShell>
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
