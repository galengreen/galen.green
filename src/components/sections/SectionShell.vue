<script setup lang="ts">
import { computed, ref } from 'vue'
import { useReveal } from '@/composables/useReveal'

const props = withDefaults(
  defineProps<{
    id: string
    title: string
    visible?: boolean
    container?: 'default' | 'narrow'
    reveal?: boolean
  }>(),
  {
    visible: true,
    container: 'default',
    reveal: true,
  },
)

const containerClass = props.container === 'narrow' ? 'container container-narrow' : 'container'

const sectionRef = ref<HTMLElement | null>(null)
const { isVisible } = useReveal(sectionRef)

const shouldShow = computed(() => (props.reveal ? isVisible.value : props.visible))
</script>

<template>
  <section ref="sectionRef" :id="id" class="section fade-in" :class="{ visible: shouldShow }">
    <div :class="containerClass">
      <h2 class="section-title">{{ title }}</h2>
      <slot />
    </div>
  </section>
</template>
