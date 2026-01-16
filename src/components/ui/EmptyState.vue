<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="empty-state">
    <p class="text-muted">
      <slot>{{ message || 'Coming soon...' }}</slot>
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  padding: var(--space-12);
  text-align: center;
}
</style>
