<script setup lang="ts">
import { computed } from 'vue'
import { getImageUrl } from '@/composables/useMedia'
import type { About, Media } from '@/types'

const props = defineProps<{
  about: About | null
  firstName: string
  lastName: string
  backgroundImage?: Media
  visible: boolean
}>()

const backgroundStyle = computed(() => {
  if (!props.backgroundImage) return {}
  const url = getImageUrl(props.backgroundImage, 'large')
  return {
    backgroundImage: `url(${url})`,
  }
})
</script>

<template>
  <section
    id="hero"
    class="hero-section fade-in"
    :class="{ visible, 'has-background': backgroundImage }"
    :style="backgroundStyle"
  >
    <div class="hero-content container">
      <div class="hero-image">
        <img
          v-if="about?.photo"
          :src="getImageUrl(about.photo, 'large')"
          :alt="about.photo.alt || 'Profile photo'"
          class="hero-photo"
        />
        <div v-else class="hero-image-placeholder"></div>
      </div>
      <div class="hero-text">
        <h1 class="hero-name">
          <span class="name-first">{{ firstName }}</span>
          <span class="name-last">{{ lastName }}</span>
        </h1>
        <p class="hero-subtitle text-muted">
          {{ about?.subtitle }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: var(--space-16) 0;
  position: relative;
}

.hero-section.has-background {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-section.has-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(var(--color-background-rgb), 0.4) 0%,
    rgba(var(--color-background-rgb), 0.7) 100%
  );
  z-index: 0;
}

.hero-section.has-background .hero-content {
  position: relative;
  z-index: 1;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}

.hero-photo {
  max-width: 400px;
  width: 100%;
  object-fit: cover;
  border-radius: var(--space-4);
}

.hero-image-placeholder {
  aspect-ratio: 3/4;
  max-width: 400px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subtle);
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero-name {
  display: flex;
  flex-direction: column;
  font-size: var(--text-6xl);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: var(--text-xl);
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 70vh;
    padding: var(--space-8) 0;
  }

  .hero-section.has-background {
    min-height: 100vh;
  }

  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--space-8);
  }

  .hero-photo,
  .hero-image-placeholder {
    margin: 0 auto;
    max-width: 280px;
  }

  .hero-name {
    font-size: var(--text-5xl);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 60vh;
  }

  .hero-section.has-background {
    min-height: 100vh;
  }

  .hero-name {
    font-size: var(--text-4xl);
  }

  .hero-photo,
  .hero-image-placeholder {
    max-width: 220px;
  }
}
</style>
