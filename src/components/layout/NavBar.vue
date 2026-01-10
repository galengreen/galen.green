<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme, initTheme, cleanup: cleanupTheme } = useTheme()

const sections = [
  { id: 'hero', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'photos', label: 'Photos' },
  { id: 'contact', label: 'Contact' },
]

const getScrollRoot = () => document.getElementById('scroll-root')

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  const scrollRoot = getScrollRoot()

  if (element && scrollRoot) {
    const elementTop = element.offsetTop
    const navbarOffset = 100

    scrollRoot.scrollTo({
      top: elementTop - navbarOffset,
      behavior: 'smooth',
    })
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
  cleanupTheme()
})

// Theme icon based on current theme
const themeIcon = computed(() => {
  if (theme.value === 'system') return 'circle-half-stroke'
  if (theme.value === 'dark') return 'moon'
  return 'sun'
})
</script>

<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-content">
      <ul class="nav-links">
        <li v-for="section in sections" :key="section.id">
          <button class="nav-link" @click="scrollToSection(section.id)">
            {{ section.label }}
          </button>
        </li>
      </ul>

      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="`Theme: ${theme}`"
        aria-label="Toggle theme"
      >
        <FontAwesomeIcon :icon="['fas', themeIcon]" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: var(--navbar-top);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-fixed);
  transition:
    background-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-frame);
  border-radius: 9999px;
  box-shadow: var(--shadow-lg);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: #ffffff;
  border-radius: 9999px;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link:active {
  opacity: 0.7;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: var(--text-base);
  color: #ffffff;
  border-radius: 50%;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .navbar-content {
    padding: var(--space-1) var(--space-2);
    gap: var(--space-1);
  }

  .nav-link {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
  }

  .theme-toggle {
    width: 28px;
    height: 28px;
    font-size: var(--text-sm);
  }
}

@media (max-width: 400px) {
  .nav-links {
    gap: 0;
  }

  .nav-link {
    padding: var(--space-1) var(--space-1);
  }
}
</style>
