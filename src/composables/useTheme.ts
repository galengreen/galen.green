import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('dark')
const isDark = ref(false)

export function useTheme() {
  const initTheme = () => {
    if (typeof window === 'undefined') return

    // Check for saved preference, otherwise use system default
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved && ['light', 'dark'].includes(saved)) {
      theme.value = saved
    } else {
      // Default to system preference
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    updateDarkMode()
  }

  const updateDarkMode = () => {
    if (typeof window === 'undefined') return
    isDark.value = theme.value === 'dark'
    applyTheme()
  }

  const applyTheme = () => {
    if (typeof document === 'undefined') return

    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    updateDarkMode()
  }

  const toggleTheme = () => {
    // Toggle between light and dark
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  watch(theme, updateDarkMode)

  return {
    theme,
    isDark,
    initTheme,
    setTheme,
    toggleTheme,
  }
}
