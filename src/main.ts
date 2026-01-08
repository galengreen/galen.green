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
      if (savedPosition) {
        return savedPosition
      }
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
        }
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
    }
  },
)
