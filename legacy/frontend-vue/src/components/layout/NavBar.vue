<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { getScrollRoot, scrollToSection } from '@/utils/scroll'

const { theme, toggleTheme, initTheme } = useTheme()
const route = useRoute()
const router = useRouter()

const sections = [
  { id: 'hero', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'photos', label: 'Photos' },
  { id: 'contact', label: 'Contact' },
]

const isHomePage = computed(() => route.name === 'home')

const scrollToSectionLocal = (id: string) => {
  scrollToSection(id)
}

const navigateToSection = (id: string) => {
  if (isHomePage.value) {
    // On home page, scroll directly
    scrollToSectionLocal(id)
  } else {
    // On other pages, navigate to home with hash
    router.push({ name: 'home', hash: `#${id}` })
  }
}

const isScrolled = ref(false)

const handleScroll = () => {
  const scrollRoot = getScrollRoot()
  if (scrollRoot) {
    isScrolled.value = scrollRoot.scrollTop > 50
  }
}

onMounted(() => {
  initTheme()

  const scrollRoot = getScrollRoot()
  if (scrollRoot) {
    scrollRoot.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const scrollRoot = getScrollRoot()
  if (scrollRoot) {
    scrollRoot.removeEventListener('scroll', handleScroll)
  }
})

// Theme icon based on current theme
const themeIcon = computed(() => {
  return theme.value === 'dark' ? 'moon' : 'sun'
})
</script>

<template>
  <nav class="fixed left-1/2 top-[var(--navbar-top)] z-[300] -translate-x-1/2">
    <div
      class="flex items-center gap-4 rounded-full bg-frame px-6 py-2.5 transition-[box-shadow] duration-[250ms] [transition-timing-function:var(--ease-out)]"
      :class="
        isScrolled ? '[box-shadow:var(--ui-shadow-overlay)]' : '[box-shadow:var(--ui-shadow-card)]'
      "
    >
      <ul class="flex items-center gap-6 max-[460px]:gap-0">
        <li v-for="section in sections" :key="section.id">
          <button
            class="rounded-full px-4 py-2 text-sm font-medium leading-none tracking-normal text-white transition-[background-color,opacity] duration-[150ms] [transition-timing-function:var(--ease-out)] hover:bg-white/10 active:opacity-70 max-[460px]:px-2 max-[460px]:py-1 max-[460px]:text-xs"
            @click="navigateToSection(section.id)"
          >
            {{ section.label }}
          </button>
        </li>
      </ul>

      <button
        class="flex h-9 w-9 items-center justify-center rounded-full text-base leading-none text-white transition-[background-color,transform] duration-[150ms] [transition-timing-function:var(--ease-out)] hover:scale-110 hover:bg-white/10"
        @click="toggleTheme"
        :title="`Theme: ${theme}`"
        aria-label="Toggle theme"
      >
        <FontAwesomeIcon :icon="['fas', themeIcon]" />
      </button>
    </div>
  </nav>
</template>
