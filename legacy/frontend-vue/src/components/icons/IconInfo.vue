<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>

<template>
  <svg
    :width="size || 24"
    :height="size || 24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" stroke-width="2" />
    <path stroke-linecap="round" stroke-width="2" d="M12 16v-4M12 8h.01" />
  </svg>
</template>
