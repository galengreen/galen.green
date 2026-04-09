<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="py-12 text-center">
    <p class="text-sm text-muted md:text-base">
      <slot>{{ message || 'Coming soon...' }}</slot>
    </p>
  </div>
</template>
