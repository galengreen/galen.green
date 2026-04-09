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
  <div class="w-full" :class="props.padded ? 'p-4 md:p-6' : ''">
    <slot />
  </div>
</template>
