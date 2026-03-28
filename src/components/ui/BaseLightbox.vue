<script setup lang="ts">
import { toRef, useTemplateRef } from 'vue'
import { IconClose } from '@/components/icons'
import { useLightbox } from '@/composables/useLightbox'

const props = withDefaults(
  defineProps<{
    open: boolean
    label?: string
    /** Skip keyboard handling if parent handles it (e.g., with useGalleryNavigation) */
    skipKeyboardHandling?: boolean
  }>(),
  {
    label: 'Dialog',
    open: false,
    skipKeyboardHandling: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

function close() {
  emit('close')
}

const overlayRef = useTemplateRef<HTMLDivElement>('overlay')
const closeButtonRef = useTemplateRef<HTMLButtonElement>('closeButton')

const { handleBackdropClick } = useLightbox(toRef(props, 'open'), {
  containerRef: overlayRef,
  initialFocusRef: closeButtonRef,
  onClose: close,
  skipKeyboardHandling: props.skipKeyboardHandling,
})
</script>

<template>
  <Teleport to="body">
    <Transition name="scale-fade">
      <div
        v-if="open"
        ref="overlay"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        tabindex="-1"
        @click="handleBackdropClick"
      >
        <!-- Close button -->
        <button
          ref="closeButton"
          class="lightbox-btn lightbox-close"
          aria-label="Close"
          @click="close"
        >
          <IconClose />
        </button>

        <!-- Additional buttons slot (for nav, info toggle, etc.) -->
        <slot name="buttons" />

        <!-- Main content -->
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-btn {
  position: absolute;
  top: var(--space-6);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 50%;
  transition:
    color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
  z-index: 10;
}

.lightbox-btn:hover {
  color: white;
  background: rgba(0, 0, 0, 0.9);
}

.lightbox-close {
  left: var(--space-6);
}

@media (max-width: 768px) {
  .lightbox-close {
    top: var(--space-3);
    left: var(--space-3);
  }
}
</style>
