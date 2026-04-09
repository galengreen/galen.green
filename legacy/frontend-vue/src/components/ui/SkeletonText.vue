<script setup lang="ts">
defineProps<{
  /** Number of text lines to show */
  lines?: number
  /** Whether to make the last line shorter */
  shortLast?: boolean
}>()
</script>

<template>
  <div class="flex flex-col">
    <div
      v-for="i in lines || 1"
      :key="i"
      class="skeleton skeleton-text"
      :class="{ short: shortLast && i === (lines || 1) }"
    ></div>
  </div>
</template>
