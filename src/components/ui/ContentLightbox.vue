<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { IconClose } from '@/components/icons'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
  }>(),
  {
    open: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

function close() {
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    close()
  }
}

// Lock body scroll when open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="scale-fade">
      <div v-if="open" class="content-lightbox-overlay" @click="handleBackdropClick">
        <!-- Close button -->
        <button class="lightbox-btn lightbox-close" aria-label="Close" @click="close">
          <IconClose />
        </button>

        <!-- Scrollable content area -->
        <div class="content-lightbox-scroll" @click.stop>
          <div class="content-lightbox-inner">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.content-lightbox-overlay {
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

  .lightbox-close {
    top: var(--space-3);
    left: var(--space-3);
  }
}
</style>
