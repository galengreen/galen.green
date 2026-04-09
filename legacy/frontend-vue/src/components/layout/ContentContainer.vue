<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    narrow?: boolean
  }>(),
  {
    narrow: false,
  },
)

const containerStyle = computed(() => {
  return {
    maxWidth: props.narrow ? 'var(--content-narrow)' : 'var(--content-width)',
    margin: '0 auto',
  }
})
</script>

<template>
  <div class="w-full px-3 sm:px-4 md:px-6" :style="containerStyle">
    <slot />
  </div>
</template>
