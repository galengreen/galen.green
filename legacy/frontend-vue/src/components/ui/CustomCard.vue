<script setup lang="ts">
import { computed } from 'vue'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardShadow = 'none' | 'sm' | 'md' | 'lg'
export type CardRadius = 'none' | 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** Padding size */
    padding?: CardPadding
    /** Shadow depth */
    shadow?: CardShadow
    /** Border radius size */
    radius?: CardRadius
    /** Enable hover interaction effects */
    interactive?: boolean
    /** Remove border */
    borderless?: boolean
    /** HTML tag to render */
    as?: 'div' | 'article' | 'section' | 'button'
    /** Background opacity (0-100) */
    opacity?: number
    /** Backdrop blur in pixels */
    blur?: number
  }>(),
  {
    padding: 'md',
    shadow: 'md',
    radius: 'md',
    interactive: false,
    borderless: false,
    as: 'div',
    opacity: 100,
    blur: 0,
  },
)

const cardStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.opacity < 100) {
    const alpha = props.opacity / 100
    style.backgroundColor = `rgba(var(--ui-surface-rgb), ${alpha})`
  }

  if (props.blur > 0) {
    style.backdropFilter = `blur(${props.blur}px)`
    style.WebkitBackdropFilter = `blur(${props.blur}px)`
  }

  return style
})

const rootClass = computed(() => {
  const paddingless = props.padding === 'none'

  return [
    'overflow-hidden border border-border bg-surface text-text transition duration-300 ease-out',
    props.shadow === 'none' ? 'shadow-none' : '',
    props.shadow === 'sm' ? 'shadow-soft' : '',
    props.shadow === 'md' ? 'shadow-card' : '',
    props.shadow === 'lg' ? 'shadow-overlay' : '',
    props.radius === 'none' ? 'rounded-none' : '',
    props.radius === 'sm' ? 'rounded-xl' : '',
    props.radius === 'md' ? 'rounded-2xl' : '',
    props.radius === 'lg' ? 'rounded-[1.75rem]' : '',
    props.interactive
      ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-overlay active:translate-y-0'
      : '',
    props.borderless ? 'border-transparent' : '',
    props.as === 'button' ? 'w-full text-left' : '',
    paddingless ? '' : '',
  ]
})

const bodyClass = computed(() => {
  return [
    props.padding === 'none' ? '' : '',
    props.padding === 'sm' ? 'p-3' : '',
    props.padding === 'md' ? 'p-5' : '',
    props.padding === 'lg' ? 'p-6 md:p-7' : '',
  ]
})

const headerFooterClass = computed(() => {
  return [
    props.borderless ? 'border-transparent' : 'border-border',
    props.padding === 'none' ? '' : '',
    props.padding === 'sm' ? 'px-3 py-3' : '',
    props.padding === 'md' ? 'px-5 py-4' : '',
    props.padding === 'lg' ? 'px-6 py-5 md:px-7' : '',
  ]
})
</script>

<template>
  <component :is="as" :class="rootClass" :style="cardStyle">
    <div v-if="$slots.header" :class="['border-b', headerFooterClass]">
      <slot name="header" />
    </div>
    <div :class="bodyClass">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="['border-t', headerFooterClass]">
      <slot name="footer" />
    </div>
  </component>
</template>
