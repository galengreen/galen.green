<script setup lang="ts">
import { ref, computed, toRef, watch } from 'vue'
import BaseLightbox from '@/components/ui/BaseLightbox.vue'
import ResponsiveImage from '@/components/ui/ResponsiveImage.vue'
import { IconChevronLeft, IconChevronRight, IconInfo } from '@/components/icons'
import { formatDate } from '@/composables/useMedia'
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

// Reset to initial index when initialIndex prop changes
watch(
  () => props.initialIndex,
  (newIndex) => {
    currentIndex.value = newIndex
  },
)
</script>

<template>
  <BaseLightbox :open="open" label="Photo viewer" skip-keyboard-handling @close="close">
    <template #buttons>
      <!-- Previous button -->
      <button
        v-if="hasMultiple"
        class="absolute left-3 top-[47%] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white/70 transition hover:bg-black/90 hover:text-white md:left-6"
        aria-label="Previous photo"
        @click="goToPrevious"
      >
        <IconChevronLeft />
      </button>

      <!-- Info toggle button -->
      <button
        class="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white/70 transition hover:bg-black/90 hover:text-white md:right-6 md:top-6"
        :class="showInfo ? 'bg-black/95 text-white' : ''"
        aria-label="Toggle info"
        @click="toggleInfo"
      >
        <IconInfo />
      </button>

      <!-- Next button -->
      <button
        v-if="hasMultiple"
        class="absolute right-3 top-[47%] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white/70 transition hover:bg-black/90 hover:text-white md:right-6"
        aria-label="Next photo"
        @click="goToNext"
      >
        <IconChevronRight />
      </button>
    </template>

    <!-- Main content area -->
    <div
      class="flex h-full w-full flex-col p-2 md:flex-row md:p-4"
      :class="showInfo ? 'md:pr-0' : ''"
    >
      <!-- Image container -->
      <div class="relative flex min-w-0 flex-1 items-center justify-center">
        <!-- Photo -->
        <div class="flex max-h-full max-w-full items-center justify-center">
          <ResponsiveImage
            :key="currentPhoto.id"
            :media="currentPhoto.image"
            :alt="currentPhoto.title"
            size="xxl"
            sizes="100vw"
            thumbnail-size="md"
            class="lightbox-image"
            eager
          />
        </div>
      </div>

      <!-- Info panel -->
      <Transition name="slide-left">
        <aside
          v-if="showInfo"
          class="flex w-full shrink-0 flex-col gap-4 overflow-y-auto rounded-t-2xl px-4 pb-4 pt-4 text-white md:w-80 md:rounded-none md:px-6 md:pb-6 md:pt-16"
        >
          <h3 class="text-xl font-semibold leading-tight">{{ currentPhoto.title }}</h3>
          <p v-if="currentPhoto.description" class="text-base leading-7 text-white/80">
            {{ currentPhoto.description }}
          </p>
          <time class="mt-auto text-sm text-white/50">{{ formatDate(currentPhoto.date) }}</time>
        </aside>
      </Transition>
    </div>
  </BaseLightbox>
</template>

<style scoped>
/* Override LazyImage styles for lightbox */
.lightbox-image :deep(.lazy-image-container) {
  background: transparent;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100vh - var(--space-16) * 2);
  border-radius: 15px;
}

.lightbox-image :deep(.aspect-placeholder) {
  display: none;
}

/* Override shimmer to use dark colours in lightbox */
.lightbox-image :deep(.image-shimmer) {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  background-size: 200% 100%;
  border-radius: 0px;
}

.lightbox-image :deep(picture),
.lightbox-image :deep(.image-main) {
  position: relative;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100vh - var(--space-16) * 2);
  object-fit: contain;
  border-radius: 15px;
}

/* Blur stays absolutely positioned to overlay the image */
.lightbox-image :deep(.image-blur) {
  border-radius: 15px;
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
  .slide-left-enter-from,
  .slide-left-leave-to {
    transform: translateY(100%);
  }

  .lightbox-image :deep(.lazy-image-container),
  .lightbox-image :deep(picture),
  .lightbox-image :deep(.image-main) {
    max-height: calc(100vh - 18rem);
  }
}
</style>
