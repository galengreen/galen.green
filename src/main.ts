import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGithub,
  faLinkedin,
  faInstagram,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import {
  faEnvelope,
  faSun,
  faMoon,
  faCircleHalfStroke,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faExternalLink,
  faLink,
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import { routes } from './router'

import './assets/styles/reset.css'
import './assets/styles/variables.css'
import './assets/styles/global.css'
import './assets/styles/transitions.css'

// Add icons to library
library.add(
  // Brands
  faGithub,
  faLinkedin,
  faInstagram,
  faXTwitter,
  faYoutube,
  // Solid
  faEnvelope,
  faSun,
  faMoon,
  faCircleHalfStroke,
  faArrowLeft,
  faLink,
  faChevronLeft,
  faChevronRight,
  faExternalLink,
)

// Custom PrimeVue preset - unstyled base with minimal defaults
const GalenPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
  },
})

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, _from, savedPosition) {
      // Handle hash navigation with custom scroll root
      if (to.hash) {
        const scrollToElement = (element: Element) => {
          const scrollRoot = document.getElementById('scroll-root')
          if (scrollRoot) {
            const elementTop = (element as HTMLElement).offsetTop
            const navbarOffset = 100
            scrollRoot.scrollTo({
              top: elementTop - navbarOffset,
              behavior: 'smooth',
            })
          }
        }

        // Try immediately if element exists
        const element = document.querySelector(to.hash)
        if (element) {
          scrollToElement(element)
        } else {
          // Use MutationObserver to wait for element to appear
          const observer = new MutationObserver((_mutations, obs) => {
            const el = document.querySelector(to.hash)
            if (el) {
              obs.disconnect()
              scrollToElement(el)
            }
          })
          observer.observe(document.body, { childList: true, subtree: true })
        }
        // Return false to prevent default scroll behaviour
        return false
      }
      if (savedPosition) {
        return savedPosition
      }
      // Scroll custom scroll root to top
      const scrollRoot = document.getElementById('scroll-root')
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0 })
      }
      return { top: 0 }
    },
  },
  ({ app, isClient }) => {
    const pinia = createPinia()
    app.use(pinia)

    // Register Font Awesome component globally
    app.component('FontAwesomeIcon', FontAwesomeIcon)

    app.use(PrimeVue, {
      theme: {
        preset: GalenPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
      ripple: false,
      pt: {}, // Pass-through for custom styling
    })

    // Client-only initialisation
    if (isClient) {
      // Initialise theme from system preference or localStorage
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark')
      }

      // Prevent iOS Safari overscroll bounce on document (but allow pinch-to-zoom)
      document.body.addEventListener(
        'touchmove',
        (e) => {
          // Allow pinch-to-zoom (multi-touch gestures)
          if (e.touches.length > 1) {
            return
          }
          // Only prevent if not scrolling inside a scrollable element
          const scrollRoot = document.getElementById('scroll-root')
          if (scrollRoot && !scrollRoot.contains(e.target as Node)) {
            e.preventDefault()
          }
        },
        { passive: false },
      )
    }
  },
)
