<script setup lang="ts">
import { computed } from 'vue'
import ImageGallery, { type GalleryImage } from './ImageGallery.vue'
import { getImageUrl, getImageSrcset, getImageSrcsetAvif } from '@/composables/useMedia'
import type { ProjectImage } from '@/types'

const props = defineProps<{
  images: ProjectImage[]
  projectTitle: string
}>()

// Transform images for ImageGallery format with AVIF support
const galleryImages = computed<GalleryImage[]>(() => {
  return props.images.map((img, index) => ({
    src: getImageUrl(img.image, 'lg'),
    srcset: getImageSrcset(img.image, ['sm', 'md', 'lg', 'xl']),
    srcsetAvif: getImageSrcsetAvif(img.image, ['sm', 'md', 'lg', 'xl']),
    thumbnailSrc: getImageUrl(img.image, 'xs'),
    thumbnailSrcset: getImageSrcset(img.image, ['xs', 'sm']),
    thumbnailSrcsetAvif: getImageSrcsetAvif(img.image, ['xs', 'sm']),
    alt: img.caption || `${props.projectTitle} screenshot ${index + 1}`,
    caption: img.caption,
    width: img.image.width,
    height: img.image.height,
  }))
})
</script>

<template>
  <div class="project-gallery">
    <ImageGallery :images="galleryImages" />
  </div>
</template>

<style scoped>
.project-gallery {
  width: 100%;
  margin-top: var(--space-5);
}
</style>
