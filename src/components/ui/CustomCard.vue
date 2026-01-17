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
    style.backgroundColor = `rgba(var(--color-surface-rgb), ${alpha})`
  }

  if (props.blur > 0) {
    style.backdropFilter = `blur(${props.blur}px)`
    style.WebkitBackdropFilter = `blur(${props.blur}px)`
  }

  return style
})
</script>

<template>
  <component
    :is="as"
    class="card"
    :class="[
      `card--padding-${padding}`,
      `card--shadow-${shadow}`,
      `card--radius-${radius}`,
      {
        'card--interactive': interactive,
        'card--borderless': borderless,
      },
    ]"
    :style="cardStyle"
  >
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    <div class="card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

/* Padding variants */
.card--padding-none .card__body,
.card--padding-none .card__header,
.card--padding-none .card__footer {
  padding: 0;
}

.card--padding-sm .card__body {
  padding: var(--space-3);
}

.card--padding-sm .card__header,
.card--padding-sm .card__footer {
  padding: var(--space-3);
}

.card--padding-md .card__body {
  padding: var(--space-5);
}

.card--padding-md .card__header,
.card--padding-md .card__footer {
  padding: var(--space-4) var(--space-5);
}

.card--padding-lg .card__body {
  padding: var(--space-6);
}

.card--padding-lg .card__header,
.card--padding-lg .card__footer {
  padding: var(--space-5) var(--space-6);
}

/* Shadow variants */
.card--shadow-none {
  box-shadow: none;
}

.card--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.card--shadow-md {
  box-shadow: var(--shadow-md);
}

.card--shadow-lg {
  box-shadow: var(--shadow-lg);
}

/* Radius variants */
.card--radius-none {
  border-radius: 0;
}

.card--radius-sm {
  border-radius: var(--space-2);
}

.card--radius-md {
  border-radius: var(--space-4);
}

.card--radius-lg {
  border-radius: var(--space-6);
}

/* Interactive hover state */
.card--interactive {
  cursor: pointer;
}

.card--interactive:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.card--interactive:active {
  transform: scale(0.99);
}

/* Borderless */
.card--borderless {
  border: none;
}

/* Header & footer styling */
.card__header {
  border-bottom: 1px solid var(--color-border);
}

.card__footer {
  border-top: 1px solid var(--color-border);
}

.card--borderless .card__header {
  border-bottom-color: transparent;
}

.card--borderless .card__footer {
  border-top-color: transparent;
}

/* Button reset when using as="button" */
button.card {
  width: 100%;
  text-align: left;
  font: inherit;
  color: inherit;
}
</style>
