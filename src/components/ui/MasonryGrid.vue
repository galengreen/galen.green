<script setup lang="ts" generic="T extends { id: string; width?: number; height?: number }">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  photos: T[]
  gap?: number
  columnCount?: number
}>()

const emit = defineEmits<{
  photoClick: [id: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const columns = ref(props.columnCount || 3)

// Update container width on mount and resize
const updateWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
  }
}

// Update columns based on screen width
const updateColumns = () => {
  if (typeof window === 'undefined') return

  const width = window.innerWidth
  if (width < 480) {
    columns.value = 1
  } else if (width < 768) {
    columns.value = 2
  } else {
    columns.value = props.columnCount || 3
  }
}

const gap = computed(() => props.gap || 16)

// Distribute photos into columns maintaining left-to-right order
const columnPhotos = computed(() => {
  const result: T[][] = Array.from({ length: columns.value }, () => [])

  props.photos.forEach((photo, index) => {
    const columnIndex = index % columns.value
    const column = result[columnIndex]
    if (column) {
      column.push(photo)
    }
  })

  return result
})

// Calculate aspect ratio for a photo
const getAspectRatio = (photo: T) => {
  if (photo.width && photo.height) {
    return photo.height / photo.width
  }
  return 1 // Default to square if no dimensions
}

const handleResize = () => {
  updateWidth()
  updateColumns()
}

onMounted(() => {
  updateWidth()
  updateColumns()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Watch for photo changes
watch(
  () => props.photos,
  () => {
    updateWidth()
  },
)
</script>

<template>
  <div ref="containerRef" class="masonry-grid" :style="{ gap: `${gap}px` }">
    <div
      v-for="(column, colIndex) in columnPhotos"
      :key="colIndex"
      class="masonry-column"
      :style="{ gap: `${gap}px` }"
    >
      <div
        v-for="photo in column"
        :key="photo.id"
        class="masonry-item"
        @click="emit('photoClick', photo.id)"
      >
        <slot name="item" :photo="photo" :aspect-ratio="getAspectRatio(photo)">
          <!-- Default slot content -->
          <div
            class="masonry-placeholder"
            :style="{ paddingBottom: `${getAspectRatio(photo) * 100}%` }"
          ></div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry-grid {
  display: flex;
  width: 100%;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.masonry-item {
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

.masonry-item:hover {
  transform: scale(1.02);
}

.masonry-placeholder {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
}
</style>
