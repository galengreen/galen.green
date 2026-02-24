import { defineComponent, nextTick, ref } from 'vue'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useReveal } from '../useReveal'

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

const createHarness = () =>
  defineComponent({
    setup(_, { expose }) {
      const target = ref<Element | null>(null)
      const { isVisible } = useReveal(target)

      expose({ isVisible })
      return { target }
    },
    template: '<section ref="target" />',
  })

function getIsVisible(wrapper: ReturnType<typeof mount>) {
  const vm = wrapper.vm as unknown as { isVisible: boolean | { value: boolean } }
  const value = vm.isVisible

  if (value && typeof value === 'object' && 'value' in value) {
    return value.value
  }

  return value
}

describe('useReveal', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses a zero threshold by default for section reveal', async () => {
    mount(createHarness())
    await nextTick()

    const observer = MockIntersectionObserver.instances[0]

    expect(observer).toBeDefined()
    expect(observer?.thresholds).toEqual([0])
    expect(observer?.rootMargin).toBe('0px 0px -10% 0px')
  })

  it('marks content visible once any intersection occurs', async () => {
    const wrapper = mount(createHarness())
    await nextTick()

    const observer = MockIntersectionObserver.instances[0]
    expect(observer).toBeDefined()

    observer?.trigger(true)
    await nextTick()

    expect(getIsVisible(wrapper)).toBe(true)
    expect(observer?.unobserve).toHaveBeenCalledTimes(1)
  })
})
