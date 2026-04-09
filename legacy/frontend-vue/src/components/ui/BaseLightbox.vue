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
        class="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        tabindex="-1"
        @click="handleBackdropClick"
      >
        <!-- Close button -->
        <button
          ref="closeButton"
          class="absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white/70 transition hover:bg-black/90 hover:text-white md:left-6 md:top-6"
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
