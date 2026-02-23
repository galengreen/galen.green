import { ref, nextTick } from 'vue'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavBar from '../layout/NavBar.vue'

const pushMock = vi.fn()
const routeMock: { name: string } = {
  name: 'home',
}

const themeRef = ref<'light' | 'dark'>('dark')
const toggleThemeMock = vi.fn(() => {
  themeRef.value = themeRef.value === 'dark' ? 'light' : 'dark'
})
const initThemeMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    theme: themeRef,
    toggleTheme: toggleThemeMock,
    initTheme: initThemeMock,
  }),
}))

const mountNavBar = () => {
  return mount(NavBar, {
    global: {
      stubs: {
        FontAwesomeIcon: {
          template: '<i class="fa-stub" />',
        },
      },
    },
  })
}

describe('NavBar', () => {
  let scrollRoot: HTMLDivElement
  let projectsSection: HTMLDivElement
  let scrollToMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    routeMock.name = 'home'
    themeRef.value = 'dark'
    pushMock.mockReset()
    toggleThemeMock.mockClear()
    initThemeMock.mockClear()

    scrollToMock = vi.fn()

    scrollRoot = document.createElement('div')
    scrollRoot.id = 'scroll-root'
    Object.defineProperty(scrollRoot, 'scrollTo', {
      value: scrollToMock,
      writable: true,
    })

    projectsSection = document.createElement('div')
    projectsSection.id = 'projects'
    Object.defineProperty(projectsSection, 'offsetTop', {
      value: 320,
      writable: true,
    })

    document.body.appendChild(scrollRoot)
    document.body.appendChild(projectsSection)
  })

  afterEach(() => {
    scrollRoot.remove()
    projectsSection.remove()
  })

  it('scrolls to section when already on home page', async () => {
    const wrapper = mountNavBar()

    const projectsButton = wrapper.findAll('button.nav-link').find((button) => {
      return button.text() === 'Projects'
    })

    expect(projectsButton).toBeDefined()
    await projectsButton!.trigger('click')

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 220,
      behavior: 'smooth',
    })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('navigates to home hash when not on home page', async () => {
    routeMock.name = 'blog-post'

    const wrapper = mountNavBar()
    const projectsButton = wrapper.findAll('button.nav-link').find((button) => {
      return button.text() === 'Projects'
    })

    expect(projectsButton).toBeDefined()
    await projectsButton!.trigger('click')

    expect(pushMock).toHaveBeenCalledWith({
      name: 'home',
      hash: '#projects',
    })
  })

  it('initializes and toggles theme from the toggle button', async () => {
    const wrapper = mountNavBar()

    expect(initThemeMock).toHaveBeenCalledTimes(1)
    expect(wrapper.find('button.theme-toggle').attributes('title')).toContain('dark')

    await wrapper.find('button.theme-toggle').trigger('click')
    await nextTick()

    expect(toggleThemeMock).toHaveBeenCalledTimes(1)
    expect(wrapper.find('button.theme-toggle').attributes('title')).toContain('light')
  })

  it('adds scrolled class after scroll root moves', async () => {
    const wrapper = mountNavBar()

    scrollRoot.scrollTop = 100
    scrollRoot.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(wrapper.classes()).toContain('scrolled')
  })
})
