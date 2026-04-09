<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { LoadingMessage } from '@/types'

const props = defineProps<{
  messages?: LoadingMessage[]
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'hidden'): void
}>()

// Current message index
const currentIndex = ref(0)
const isTransitioning = ref(false)

// Shuffle messages on mount for variety
const shuffledMessages = computed((): LoadingMessage[] => {
  if (!props.messages?.length) {
    return [{ message: 'Loading...' }]
  }
  // Fisher-Yates shuffle - create a new array to avoid mutating props
  const arr: LoadingMessage[] = [...props.messages]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Use non-null assertion since we know indices are valid
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }
  return arr
})

const currentMessage = computed(() => {
  return shuffledMessages.value[currentIndex.value]?.message || 'Loading...'
})

// Message rotation interval
let rotationInterval: ReturnType<typeof setInterval> | null = null
const MESSAGE_INTERVAL = 5000 // ms between messages
const TRANSITION_DURATION = 800 // ms for fade transition

const rotateMessage = () => {
  isTransitioning.value = true

  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % shuffledMessages.value.length
    isTransitioning.value = false
  }, TRANSITION_DURATION)
}

const startRotation = () => {
  if (rotationInterval) return
  rotationInterval = setInterval(rotateMessage, MESSAGE_INTERVAL)
}

const stopRotation = () => {
  if (rotationInterval) {
    clearInterval(rotationInterval)
    rotationInterval = null
  }
}

// Handle visibility changes
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      startRotation()
    } else {
      stopRotation()
    }
  },
)

onMounted(() => {
  // Start with a random message
  currentIndex.value = Math.floor(Math.random() * shuffledMessages.value.length)

  if (props.visible) {
    startRotation()
  }
})

onUnmounted(() => {
  stopRotation()
})

// Emit hidden event after transition completes
const onAfterLeave = () => {
  emit('hidden')
}
</script>

<template>
  <Transition name="loading-screen" @after-leave="onAfterLeave">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] box-border flex items-center justify-center bg-frame p-[var(--frame-width)]"
    >
      <div
        class="flex h-full w-full flex-col items-center justify-center gap-6 rounded-[var(--frame-radius)] bg-bg"
      >
        <!-- Spinner -->
        <div class="relative h-12 w-12">
          <div
            class="h-full w-full rounded-full border-[3px] border-border border-t-text animate-spin"
          ></div>
        </div>

        <!-- Rotating message -->
        <div class="min-h-[1.5em] text-center">
          <Transition name="message-fade" mode="out-in">
            <p :key="currentIndex" class="text-sm text-muted md:text-base">
              {{ currentMessage }}
            </p>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Message fade transition */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
}

/* Loading screen fade out transition */
.loading-screen-enter-active,
.loading-screen-leave-active {
  transition: opacity 0.4s ease;
}

.loading-screen-enter-from,
.loading-screen-leave-to {
  opacity: 0;
}
</style>
