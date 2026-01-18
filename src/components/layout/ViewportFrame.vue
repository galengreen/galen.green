<script setup lang="ts">
// ViewportFrame creates the distinctive black border around the viewport
// with rounded inner corners, framing all content
</script>

<template>
  <div class="viewport-frame">
    <div class="viewport-clip">
      <div class="viewport-content" id="scroll-root">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewport-frame {
  position: fixed;
  inset: 0;
  padding: var(--frame-width);
  background-color: var(--color-frame);
  z-index: var(--z-base);
}

/* Clip container to enforce rounded corners on scrollbar */
.viewport-clip {
  width: 100%;
  height: 100%;
  border-radius: var(--frame-radius);
  overflow: hidden;
}

.viewport-content {
  width: 100%;
  height: 100%;
  background-color: var(--color-background);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y pinch-zoom;
}

/* Custom scrollbar */
.viewport-content::-webkit-scrollbar {
  width: 10px;
}

.viewport-content::-webkit-scrollbar-track {
  background: var(--color-background);
}

.viewport-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 5px;
  border: 2px solid var(--color-background);
}

.viewport-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}
</style>
