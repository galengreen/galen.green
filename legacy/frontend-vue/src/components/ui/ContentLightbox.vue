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
  <BaseLightbox :open="open" :label="title || 'Content details'" @close="emit('close')">
    <!-- Scrollable content area -->
    <div
      class="h-full w-full overflow-y-auto px-3 py-16 md:px-6 [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain] [touch-action:pan-y]"
      @click.stop
    >
      <div
        class="mx-auto w-full max-w-[900px] overflow-hidden rounded-[1.75rem] bg-bg shadow-overlay"
      >
        <slot />
      </div>
    </div>
  </BaseLightbox>
</template>
