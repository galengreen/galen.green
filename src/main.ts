import { ViteSSG } from 'vite-ssg'
import VueMatomo from 'vue-matomo'

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

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, _from, savedPosition) {
      // Handle hash navigation with custom scroll root
      if (to.hash) {
        const element = document.querySelector(to.hash)
        const scrollRoot = document.getElementById('scroll-root')
        if (element && scrollRoot) {
          const elementTop = (element as HTMLElement).offsetTop
          const navbarOffset = 100
          scrollRoot.scrollTo({
            top: elementTop - navbarOffset,
            behavior: 'smooth',
          })
        }
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
  ({ app, router, isClient }) => {
    // Register Font Awesome component globally
    app.component('FontAwesomeIcon', FontAwesomeIcon)

    // Client-only initialisation
    if (isClient) {
      // Initialise theme from system preference or localStorage
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark')
      }

      // Matomo Analytics
      const matomoUrl = import.meta.env.VITE_MATOMO_URL
      if (matomoUrl) {
        app.use(VueMatomo, {
          host: matomoUrl,
          siteId: 1,
          router,
          trackerFileName: 'matomo',
          enableLinkTracking: true,
          trackInitialView: true,
        })
      }

      // Prevent iOS Safari overscroll bounce on document (but allow pinch-to-zoom)
      document.body.addEventListener(
        'touchmove',
        (e) => {
          // Allow pinch-to-zoom (multi-touch gestures)
          if (e.touches.length > 1) {
            return
          }
          // Allow scrolling inside scroll-root or any lightbox overlay
          const scrollRoot = document.getElementById('scroll-root')
          const target = e.target as Node
          const isInScrollRoot = scrollRoot && scrollRoot.contains(target)
          const isInLightbox = (target as Element).closest?.(
            '.content-lightbox-scroll, .lightbox-overlay',
          )
          if (!isInScrollRoot && !isInLightbox) {
            e.preventDefault()
          }
        },
        { passive: false },
      )
    }
  },
)
