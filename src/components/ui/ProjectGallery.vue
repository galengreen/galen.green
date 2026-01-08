<script setup lang="ts">
import Galleria from "primevue/galleria";
import { computed } from "vue";
import type { Media, ProjectImage } from "@/types";

const props = defineProps<{
  images: ProjectImage[];
  projectTitle: string;
}>();

// CMS URL for media files
const CMS_URL = import.meta.env.VITE_PAYLOAD_URL || "http://localhost:3000";

// Transform images for Galleria format
const galleriaImages = computed(() => {
  return props.images.map((img, index) => ({
    itemImageSrc: getImageUrl(img.image, "large"),
    thumbnailImageSrc: getImageUrl(img.image, "thumbnail"),
    alt: img.caption || `${props.projectTitle} screenshot ${index + 1}`,
    caption: img.caption,
  }));
});

// Get image URL with size variant
function getImageUrl(
  media: Media,
  size?: "thumbnail" | "medium" | "large",
): string {
  if (!media) return "";

  const sized = media as { sizes?: Record<string, { url: string }> };
  let url = "";

  if (size && sized.sizes?.[size]?.url) {
    url = sized.sizes[size].url;
  } else {
    url = media.url || "";
  }

  if (url && url.startsWith("/")) {
    return `${CMS_URL}${url}`;
  }

  return url;
}

// Responsive options for thumbnails
const responsiveOptions = [
  {
    breakpoint: "1024px",
    numVisible: 5,
  },
  {
    breakpoint: "768px",
    numVisible: 3,
  },
  {
    breakpoint: "480px",
    numVisible: 2,
  },
];
</script>

<template>
  <div class="project-gallery">
    <Galleria :value="galleriaImages" :responsiveOptions="responsiveOptions" :numVisible="5" :circular="true"
      :showItemNavigators="galleriaImages.length > 1" :showThumbnails="galleriaImages.length > 1" :pt="{
        root: { class: 'galleria-root' },
        content: { class: 'galleria-content' },
        itemsContainer: { class: 'galleria-items-container' },
        item: { class: 'galleria-item' },
        thumbnails: { class: 'galleria-thumbnails' },
        thumbnailItem: { class: 'galleria-thumbnail-item' },
        thumbnailsContent: { class: 'galleria-thumbnails-content' },
        previousItemButton: { class: 'galleria-nav galleria-nav-prev' },
        nextItemButton: { class: 'galleria-nav galleria-nav-next' },
        previousThumbnailButton: { class: 'galleria-thumb-nav galleria-thumb-nav-prev' },
        nextThumbnailButton: { class: 'galleria-thumb-nav galleria-thumb-nav-next' },
      }">
      <template #item="slotProps">
        <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" class="gallery-image" />
        <div v-if="slotProps.item.caption" class="gallery-caption">
          {{ slotProps.item.caption }}
        </div>
      </template>
      <template #thumbnail="slotProps">
        <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" class="gallery-thumbnail" />
      </template>
    </Galleria>
  </div>
</template>

<style scoped>
.project-gallery {
  width: 100%;
  margin-top: var(--space-5);
}

/* Main gallery container */
:deep(.galleria-root) {
  background: transparent;
}

:deep(.galleria-content) {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

:deep(.galleria-items-container) {
  position: relative;
}

:deep(.galleria-item) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-image {
  width: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.gallery-caption {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
}

/* Navigation buttons */
:deep(.galleria-nav) {
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
  border-radius: var(--radius-full);
  color: var(--color-text);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
  z-index: 1;
}

:deep(.galleria-nav:hover) {
  background: var(--color-surface);
}

:deep(.galleria-nav-prev) {
  left: var(--space-2);
}

:deep(.galleria-nav-next) {
  right: var(--space-2);
}

.project-gallery:hover :deep(.galleria-nav) {
  opacity: 1;
}

/* Thumbnails */
:deep(.galleria-thumbnails) {
  padding: 0;
}

:deep(.galleria-thumbnails-content) {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

:deep(.galleria-thumbnail-item) {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--duration-fast) var(--ease-out);
}

:deep(.galleria-thumbnail-item:hover),
:deep(.galleria-thumbnail-item[data-p-active='true']) {
  opacity: 1;
}

.gallery-thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 2px solid transparent;
  transition: border-color var(--duration-fast) var(--ease-out);
}

:deep(.galleria-thumbnail-item[data-p-active='true']) .gallery-thumbnail {
  border-color: var(--color-text);
}

/* Thumbnail navigation */
:deep(.galleria-thumb-nav) {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

:deep(.galleria-thumb-nav:hover) {
  color: var(--color-text);
  background: var(--color-surface);
}

@media (max-width: 768px) {
  .gallery-image {
    max-height: 300px;
  }

  .gallery-thumbnail {
    width: 60px;
    height: 45px;
  }

  :deep(.galleria-nav) {
    width: 32px;
    height: 32px;
    opacity: 1;
  }
}
</style>
