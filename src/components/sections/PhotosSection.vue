<script setup lang="ts">
import { computed, ref } from 'vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import MasonryGrid from '@/components/ui/MasonryGrid.vue'
import { formatDate, getImageUrl } from '@/composables/useMedia'
import type { Photo } from '@/types'

const props = defineProps<{
  title: string
  photos: Photo[]
  loading: boolean
  visible: boolean
}>()

const expandedPhoto = ref<string | null>(null)

const togglePhoto = (id: string) => {
  expandedPhoto.value = expandedPhoto.value === id ? null : id
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
          <div class="skeleton photo-placeholder"></div>
        </div>
      </div>

      <MasonryGrid
        v-else-if="photos.length"
        :photos="photosWithDimensions"
        :column-count="3"
        :gap="16"
        @photo-click="togglePhoto"
      >
        <template #item="{ photo, aspectRatio }">
          <div class="photo-item" :class="{ expanded: expandedPhoto === photo.id }">
            <LazyImage
              :src="getImageUrl(photo.image, 'medium')"
              :thumbnail-src="getImageUrl(photo.image, 'thumbnail')"
              :alt="photo.title"
              :aspect-ratio="aspectRatio"
              class="photo-image"
            />
            <div v-if="expandedPhoto === photo.id" class="photo-expanded">
              <LazyImage
                :src="getImageUrl(photo.image, 'large')"
                :thumbnail-src="getImageUrl(photo.image, 'medium')"
                :alt="photo.title"
                class="photo-full"
              />
              <div class="photo-info">
                <h4>{{ photo.title }}</h4>
                <p v-if="photo.description" class="text-muted">{{ photo.description }}</p>
                <time class="text-subtle">{{ formatDate(photo.date) }}</time>
              </div>
            </div>
          </div>
        </template>
      </MasonryGrid>

      <div v-else class="empty-state">
        <p class="text-muted">Photos coming soon...</p>
      </div>
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
}

.photo-image {
  width: 100%;
  display: block;
  border-radius: var(--space-2);
}

.photo-placeholder {
  aspect-ratio: 4/3;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
}

.photo-expanded {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--space-2);
}

.photo-full {
  width: 100%;
  border-radius: var(--space-2);
}

.photo-info {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.empty-state {
  padding: var(--space-12);
  text-align: center;
}

/* skeleton class is defined globally in transitions.css */

@media (max-width: 768px) {
  .photos-grid-loading {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
}

@media (max-width: 480px) {
  .photos-grid-loading {
    grid-template-columns: 1fr;
  }

  .photo-info h4 {
    font-size: var(--text-base);
  }
}
</style>
