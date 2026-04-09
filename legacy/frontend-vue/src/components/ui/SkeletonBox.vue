<script setup lang="ts">
defineProps<{
  /** Aspect ratio (height/width), e.g., 0.5625 for 16:9 */
  aspectRatio?: number
  /** Fixed height (if no aspect ratio) */
  height?: string
  /** Border radius */
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}>()
</script>

<template>
  <div
    class="skeleton w-full"
    :class="[
      rounded === 'sm' ? 'rounded-lg' : '',
      rounded === 'md' ? 'rounded-2xl' : '',
      rounded === 'lg' ? 'rounded-[1.75rem]' : '',
      rounded === 'full' ? 'rounded-full' : '',
    ]"
    :style="{
      aspectRatio: aspectRatio ? `1 / ${aspectRatio}` : undefined,
      height: !aspectRatio ? height : undefined,
    }"
  ></div>
</template>
