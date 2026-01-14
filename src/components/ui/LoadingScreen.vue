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
    <div v-if="visible" class="loading-screen">
      <div class="loading-content">
        <!-- Spinner -->
        <div class="spinner">
          <div class="spinner-ring"></div>
        </div>

        <!-- Rotating message -->
        <div class="message-container">
          <Transition name="message-fade" mode="out-in">
            <p :key="currentIndex" class="message">
              {{ currentMessage }}
            </p>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

/* Spinner */
.spinner {
  width: 48px;
  height: 48px;
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-text);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Message */
.message-container {
  min-height: 1.5em;
  text-align: center;
}

.message {
  font-size: var(--text-base);
  color: var(--color-text-muted);
  margin: 0;
}

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
