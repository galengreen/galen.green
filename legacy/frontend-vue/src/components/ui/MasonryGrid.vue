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

function selectPhoto(id: string) {
  emit('photoClick', id)
}

function getItemAriaLabel(photo: T): string {
  const candidate = (photo as { title?: string }).title
  return candidate ? `Open ${candidate}` : 'Open item'
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="flex w-full" :style="{ gap: `${gapPx}px` }">
    <div
      v-for="(col, colIdx) in distributedColumns"
      :key="colIdx"
      class="flex min-w-0 flex-1 flex-col"
      :style="{ gap: `${gapPx}px` }"
    >
      <div
        v-for="photo in col"
        :key="photo.id"
        class="w-full min-w-0 cursor-pointer"
        role="button"
        tabindex="0"
        :aria-label="getItemAriaLabel(photo)"
        @click="selectPhoto(photo.id)"
        @keydown.enter.prevent="selectPhoto(photo.id)"
        @keydown.space.prevent="selectPhoto(photo.id)"
      >
        <slot name="item" :photo="photo" :aspect-ratio="getAspectRatio(photo)">
          <div
            class="w-full rounded-xl border border-border bg-surface"
            :style="{ paddingBottom: `${getAspectRatio(photo) * 100}%` }"
          />
        </slot>
      </div>
    </div>
  </div>
</template>
