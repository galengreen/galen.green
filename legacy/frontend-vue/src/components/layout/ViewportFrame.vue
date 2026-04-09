<script setup lang="ts">
// ViewportFrame creates the distinctive black border around the viewport
// with rounded inner corners, framing all content
</script>

<template>
  <div class="fixed inset-0 z-0 bg-frame p-[var(--frame-width)]">
    <div class="h-full w-full overflow-hidden rounded-[var(--frame-radius)]">
      <div
        id="scroll-root"
        class="h-full w-full overflow-x-hidden overflow-y-auto bg-bg [scroll-behavior:smooth] [overscroll-behavior:none] [-webkit-overflow-scrolling:touch] [touch-action:pan-y_pinch-zoom]"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
#scroll-root::-webkit-scrollbar {
  width: 10px;
}

#scroll-root::-webkit-scrollbar-track {
  background: var(--ui-bg);
}

#scroll-root::-webkit-scrollbar-thumb {
  background: var(--ui-border);
  border-radius: 5px;
  border: 2px solid var(--ui-bg);
}

#scroll-root::-webkit-scrollbar-thumb:hover {
  background: var(--ui-border-strong);
}
</style>
