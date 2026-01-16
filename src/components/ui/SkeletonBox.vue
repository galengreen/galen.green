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
    class="skeleton skeleton-box"
    :class="[rounded ? `rounded-${rounded}` : '']"
    :style="{
      aspectRatio: aspectRatio ? `1 / ${aspectRatio}` : undefined,
      height: !aspectRatio ? height : undefined,
    }"
  ></div>
</template>

<style scoped>
.skeleton-box {
  width: 100%;
}

.rounded-sm {
  border-radius: var(--radius-sm);
}

.rounded-md {
  border-radius: var(--radius-md);
}

.rounded-lg {
  border-radius: var(--radius-lg);
}

.rounded-full {
  border-radius: 9999px;
}

/* skeleton class is defined globally in transitions.css */
</style>
