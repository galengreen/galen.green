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
    <div v-if="loading" class="grid gap-3 md:grid-cols-3 md:gap-4">
      <div v-for="i in 6" :key="i" class="overflow-hidden rounded-xl shadow-soft">
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
        <div class="cursor-pointer overflow-hidden rounded-xl shadow-soft">
          <ResponsiveImage
            :media="photo.image"
            :alt="photo.title"
            size="md"
            sizes-preset="photoGrid"
            thumbnail-size="xs"
            :aspect-ratio="aspectRatio"
            class="block w-full rounded-xl"
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
