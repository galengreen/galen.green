<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    padded?: boolean
  }>(),
  {
    padded: true,
  },
)
</script>

<template>
  <div class="lightbox-shell" :class="{ 'lightbox-shell--padded': props.padded }">
    <slot />
  </div>
</template>

<style scoped>
.lightbox-shell {
  width: 100%;
}

.lightbox-shell--padded {
  padding: var(--space-6);
}

@media (max-width: 768px) {
  .lightbox-shell,
  .lightbox-shell--padded {
    padding: var(--space-4);
  }
}
</style>
