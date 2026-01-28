<script setup lang="ts">
import BaseLightbox from '@/components/ui/BaseLightbox.vue'

defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <BaseLightbox :open="open" @close="emit('close')">
    <!-- Scrollable content area -->
    <div class="content-lightbox-scroll" @click.stop>
      <div class="content-lightbox-inner">
        <slot />
      </div>
    </div>
  </BaseLightbox>
</template>

<style scoped>
.content-lightbox-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: var(--space-16) var(--space-6);
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

.content-lightbox-inner {
  max-width: 900px;
  margin: 0 auto;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

@media (max-width: 768px) {
  .content-lightbox-scroll {
    padding: var(--space-16) var(--space-3);
  }
}
</style>
