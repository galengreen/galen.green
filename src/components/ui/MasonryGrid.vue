<script setup lang="ts" generic="T extends { id: string; width?: number; height?: number }">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  photos: T[]
  gap?: number
  columnCount?: number
}>()

const emit = defineEmits<{
  photoClick: [id: string]
}>()

const MOBILE_BREAKPOINT = 500

const columns = ref(getColumnCount())

function getColumnCount(): number {
  if (typeof window === 'undefined') return props.columnCount ?? 3
  return window.innerWidth < MOBILE_BREAKPOINT ? 1 : (props.columnCount ?? 3)
}

function getAspectRatio(photo: T): number {
  if (photo.width && photo.height && photo.width > 0) {
    return photo.height / photo.width
  }
  return 1
}

function findShortestColumn(heights: number[]): number {
  let minIndex = 0
  let minHeight = heights[0] ?? 0

  for (let i = 1; i < heights.length; i++) {
    if ((heights[i] ?? 0) < minHeight) {
      minHeight = heights[i] ?? 0
      minIndex = i
    }
  }

  return minIndex
}

const distributedColumns = computed(() => {
  const numCols = columns.value
  const result: T[][] = Array.from({ length: numCols }, () => [])
  const heights: number[] = new Array(numCols).fill(0)

  for (const photo of props.photos) {
    const shortestIdx = findShortestColumn(heights)
    result[shortestIdx]?.push(photo)
    const currentHeight = heights[shortestIdx] ?? 0
    heights[shortestIdx] = currentHeight + getAspectRatio(photo)
  }

  return result
})

const gapPx = computed(() => props.gap ?? 16)

function handleResize() {
  columns.value = getColumnCount()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="masonry" :style="{ gap: `${gapPx}px` }">
    <div
      v-for="(col, colIdx) in distributedColumns"
      :key="colIdx"
      class="masonry__column"
      :style="{ gap: `${gapPx}px` }"
    >
      <div
        v-for="photo in col"
        :key="photo.id"
        class="masonry__item"
        @click="emit('photoClick', photo.id)"
      >
        <slot name="item" :photo="photo" :aspect-ratio="getAspectRatio(photo)">
          <div
            class="masonry__placeholder"
            :style="{ paddingBottom: `${getAspectRatio(photo) * 100}%` }"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry {
  display: flex;
  width: 100%;
}

.masonry__column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.masonry__item {
  width: 100%;
  min-width: 0;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

.masonry__placeholder {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
}
</style>
