<script setup lang="ts">
import { computed, ref } from 'vue'
import ContentContainer from '@/components/layout/ContentContainer.vue'
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

const sectionRef = ref<HTMLElement | null>(null)
const { isVisible } = useReveal(sectionRef)

const shouldShow = computed(() => (props.reveal ? isVisible.value : props.visible))

const sectionClass = computed(() => {
  return ['fade-in py-12 md:py-20', shouldShow.value ? 'visible' : '']
})
</script>

<template>
  <section ref="sectionRef" :id="id" :class="sectionClass">
    <ContentContainer :narrow="container === 'narrow'">
      <h2 class="mb-6 text-2xl font-semibold tracking-tight text-text md:mb-8 md:text-3xl">
        {{ title }}
      </h2>
      <slot />
    </ContentContainer>
  </section>
</template>
