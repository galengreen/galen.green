import { ViteSSG } from 'vite-ssg'

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
import { cmsStateKey, createCmsState, type CmsState } from '@/composables/useCmsState'
import { scrollToHash, scrollToTop } from '@/utils/scroll'
import { useTheme } from '@/composables/useTheme'

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
      if (to.hash) {
        scrollToHash(to.hash)
        return false
      }
      if (savedPosition) {
        return savedPosition
      }
      scrollToTop()
      return { top: 0 }
    },
  },
  ({ app, isClient, initialState }) => {
    const shouldDisableSsgState =
      isClient &&
      typeof window !== 'undefined' &&
      Boolean((window as Window & { __DISABLE_SSG_STATE__?: boolean }).__DISABLE_SSG_STATE__)

    const cmsState = createCmsState(
      shouldDisableSsgState ? undefined : (initialState.cms as CmsState | undefined),
    )

    initialState.cms = cmsState
    app.provide(cmsStateKey, cmsState)

    // Register Font Awesome component globally
    app.component('FontAwesomeIcon', FontAwesomeIcon)

    // Client-only initialisation
    if (isClient) {
      // Initialise theme from system preference or localStorage
      const { initTheme } = useTheme()
      initTheme()

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
