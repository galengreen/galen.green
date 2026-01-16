<script setup lang="ts">
defineProps<{
  /** Number of text lines to show */
  lines?: number
  /** Whether to make the last line shorter */
  shortLast?: boolean
}>()
</script>

<template>
  <div class="skeleton-text-group">
    <div
      v-for="i in lines || 1"
      :key="i"
      class="skeleton skeleton-text"
      :class="{ short: shortLast && i === (lines || 1) }"
    ></div>
  </div>
</template>

<style scoped>
.skeleton-text-group {
  display: flex;
  flex-direction: column;
}

/* skeleton and skeleton-text classes are defined globally in transitions.css */
</style>
