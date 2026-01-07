import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const isDark = ref(false)

export function useTheme() {
  const initTheme = () => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('theme') as Theme | null
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      theme.value = saved
    }

    updateDarkMode()

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        isDark.value = e.matches
        applyTheme()
      }
    })
  }

  const updateDarkMode = () => {
    if (typeof window === 'undefined') return

    if (theme.value === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = theme.value === 'dark'
    }
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
    // Cycle through: system -> light -> dark -> system
    if (theme.value === 'system') {
      setTheme('light')
    } else if (theme.value === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
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
