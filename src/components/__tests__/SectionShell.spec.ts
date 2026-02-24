import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionShell from '../sections/SectionShell.vue'

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  readonly root = null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>

  private readonly callback: IntersectionObserverCallback
  private readonly targetElements = new Set<Element>()

  observe = vi.fn((target: Element) => {
    this.targetElements.add(target)
  })

  unobserve = vi.fn((target: Element) => {
    this.targetElements.delete(target)
  })

  disconnect = vi.fn(() => {
    this.targetElements.clear()
  })

  takeRecords = vi.fn((): IntersectionObserverEntry[] => [])

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.rootMargin = options?.rootMargin ?? '0px'
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0]
    MockIntersectionObserver.instances.push(this)
  }

  trigger(isIntersecting: boolean) {
    const entries = Array.from(this.targetElements).map(
      (target) => ({ isIntersecting, target }) as IntersectionObserverEntry,
    )
    this.callback(entries, this)
  }
}

describe('SectionShell', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('toggles visible class when section intersects viewport', async () => {
    const wrapper = mount(SectionShell, {
      props: {
        id: 'photos',
        title: 'Photos',
      },
      slots: {
        default: '<p>Content</p>',
      },
    })

    const section = wrapper.find('section')
    const observer = MockIntersectionObserver.instances[0]

    expect(section.classes()).not.toContain('visible')
    expect(observer).toBeDefined()

    observer?.trigger(true)
    await wrapper.vm.$nextTick()

    expect(section.classes()).toContain('visible')
  })

  it('uses explicit visible prop when reveal is disabled', () => {
    const hiddenWrapper = mount(SectionShell, {
      props: {
        id: 'photos',
        title: 'Photos',
        reveal: false,
        visible: false,
      },
    })

    const visibleWrapper = mount(SectionShell, {
      props: {
        id: 'projects',
        title: 'Projects',
        reveal: false,
        visible: true,
      },
    })

    expect(hiddenWrapper.find('section').classes()).not.toContain('visible')
    expect(visibleWrapper.find('section').classes()).toContain('visible')
  })
})
