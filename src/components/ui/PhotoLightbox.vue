<script setup lang="ts">
import { ref, computed, toRef, onUnmounted, watch } from 'vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import { IconChevronLeft, IconChevronRight, IconClose, IconInfo } from '@/components/icons'
import { formatDate, getImageUrl, getImageSrcset, getImageSrcsetAvif } from '@/composables/useMedia'
import { useGalleryNavigation } from '@/composables/useGalleryNavigation'
import type { Photo } from '@/types'

const props = withDefaults(
  defineProps<{
    photos: Photo[]
    initialIndex?: number
    open: boolean
  }>(),
  {
    initialIndex: 0,
    open: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

const showInfo = ref(false)

function toggleInfo() {
  showInfo.value = !showInfo.value
}

function close() {
  emit('close')
}

const itemCount = computed(() => props.photos.length)
const isActive = toRef(props, 'open')

const { currentIndex, goToPrevious, goToNext } = useGalleryNavigation({
  itemCount,
  initialIndex: props.initialIndex,
  loop: true,
  onClose: close,
  customKeys: {
    i: toggleInfo,
    I: toggleInfo,
  },
  isActive,
  useDocumentListener: true,
})

// currentPhoto is guaranteed to exist when photos.length > 0 (guarded in template)
const currentPhoto = computed(() => props.photos[currentIndex.value] as Photo)
const hasMultiple = computed(() => props.photos.length > 1)

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close()
  }
}

// Lock body scroll when lightbox is open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})

// Reset to initial index when initialIndex prop changes
watch(
  () => props.initialIndex,
  (newIndex) => {
    currentIndex.value = newIndex
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="scale-fade">
      <div v-if="open" class="lightbox-overlay" @click="handleBackdropClick">
        <!-- Close button -->
        <button class="lightbox-btn lightbox-close" aria-label="Close" @click="close">
          <IconClose />
        </button>

        <!-- Info toggle button -->
        <button
          class="lightbox-btn lightbox-info-toggle"
          :class="{ active: showInfo }"
          aria-label="Toggle info"
          @click="toggleInfo"
        >
          <IconInfo />
        </button>

        <!-- Main content area -->
        <div class="lightbox-content" :class="{ 'info-open': showInfo }">
          <!-- Image container -->
          <div class="lightbox-image-container">
            <!-- Previous button -->
            <button
              v-if="hasMultiple"
              class="lightbox-nav lightbox-nav-prev"
              aria-label="Previous photo"
              @click="goToPrevious"
            >
              <IconChevronLeft :size="32" />
            </button>

            <!-- Photo -->
            <div class="lightbox-image-wrapper">
              <LazyImage
                :key="currentPhoto.id"
                :src="getImageUrl(currentPhoto.image, 'xxl')"
                :srcset="getImageSrcset(currentPhoto.image)"
                :srcset-avif="getImageSrcsetAvif(currentPhoto.image)"
                sizes="100vw"
                :thumbnail-src="getImageUrl(currentPhoto.image, 'md')"
                :alt="currentPhoto.title"
                :aspect-ratio="currentPhoto.image.height / currentPhoto.image.width"
                class="lightbox-image"
                eager
              />
            </div>

            <!-- Next button -->
            <button
              v-if="hasMultiple"
              class="lightbox-nav lightbox-nav-next"
              aria-label="Next photo"
              @click="goToNext"
            >
              <IconChevronRight :size="32" />
            </button>
          </div>

          <!-- Info panel -->
          <Transition name="slide-left">
            <aside v-if="showInfo" class="lightbox-info">
              <h3 class="lightbox-title">{{ currentPhoto.title }}</h3>
              <p v-if="currentPhoto.description" class="lightbox-description">
                {{ currentPhoto.description }}
              </p>
              <time class="lightbox-date">{{ formatDate(currentPhoto.date) }}</time>
            </aside>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Top buttons */
.lightbox-btn {
  position: absolute;
  top: var(--space-4);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 50%;
  transition:
    color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
  z-index: 10;
}

.lightbox-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.lightbox-close {
  left: var(--space-4);
}

.lightbox-info-toggle {
  right: var(--space-4);
}

.lightbox-info-toggle.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

/* Main content */
.lightbox-content {
  display: flex;
  width: 100%;
  height: 100%;
  padding: var(--space-16) var(--space-4);
  transition: padding var(--duration-normal) var(--ease-out);
}

.lightbox-content.info-open {
  padding-right: 0;
}

/* Image container */
.lightbox-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 0;
}

.lightbox-image-wrapper {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: calc(100vh - var(--space-16) * 2);
  width: auto;
  height: auto;
  border-radius: var(--radius-sm);
}

/* Override LazyImage styles for lightbox */
.lightbox-image :deep(.lazy-image-container) {
  background: transparent;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100vh - var(--space-16) * 2);
}

.lightbox-image :deep(.aspect-placeholder) {
  display: none;
}

.lightbox-image :deep(.image-main),
.lightbox-image :deep(.image-blur) {
  position: relative;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100vh - var(--space-16) * 2);
  object-fit: contain;
}

/* Navigation buttons */
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: 50%;
  opacity: 0;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
  z-index: 10;
}

.lightbox-nav:hover {
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.lightbox-nav-prev {
  left: var(--space-4);
}

.lightbox-nav-next {
  right: var(--space-4);
}

.lightbox-overlay:hover .lightbox-nav {
  opacity: 1;
}

/* Info panel */
.lightbox-info {
  width: 320px;
  flex-shrink: 0;
  padding: var(--space-16) var(--space-6) var(--space-6);
  color: white;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
}

.lightbox-title {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
}

.lightbox-description {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.lightbox-date {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.5);
  margin-top: auto;
}

/* Slide transition for info panel */
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform var(--duration-normal) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .lightbox-content {
    flex-direction: column;
    padding: var(--space-16) var(--space-2);
  }

  .lightbox-content.info-open {
    padding-right: var(--space-2);
  }

  .lightbox-nav {
    width: 44px;
    height: 44px;
    opacity: 1;
  }

  .lightbox-nav-prev {
    left: var(--space-2);
  }

  .lightbox-nav-next {
    right: var(--space-2);
  }

  .lightbox-info {
    width: 100%;
    max-height: 40vh;
    padding: var(--space-4);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .lightbox-image :deep(.image-main),
  .lightbox-image :deep(.image-blur),
  .lightbox-image :deep(.lazy-image-container) {
    max-height: calc(60vh - var(--space-16));
  }

  .slide-left-enter-from,
  .slide-left-leave-to {
    transform: translateY(100%);
  }
}
</style>
