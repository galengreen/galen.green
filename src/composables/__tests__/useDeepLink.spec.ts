import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDeepLink } from '../useDeepLink'

type LinkItem = {
  id: string
  slug: string
}

const itemsFixture: LinkItem[] = [
  { id: 'post-1', slug: 'first-post' },
  { id: 'post-2', slug: 'second-post' },
]

function createHarness(initialItems: LinkItem[]) {
  const items = ref(initialItems)

  return defineComponent({
    setup(_, { expose }) {
      const { selectedId, open, close } = useDeepLink<LinkItem>('blog', () => items.value)

      const setItems = (nextItems: LinkItem[]) => {
        items.value = nextItems
      }

      expose({ selectedId, open, close, setItems })

      return () => null
    },
  })
}

function getSelectedId(wrapper: ReturnType<typeof mount>) {
  const vm = wrapper.vm as unknown as { selectedId: string | { value: string | null } | null }
  const selectedId = vm.selectedId

  if (selectedId && typeof selectedId === 'object' && 'value' in selectedId) {
    return selectedId.value
  }

  return selectedId
}

function getHarnessVm(wrapper: ReturnType<typeof mount>) {
  return wrapper.vm as unknown as {
    open: (id: string) => void
    close: () => void
    setItems: (items: LinkItem[]) => void
  }
}

describe('useDeepLink', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/')
  })

  it('auto-opens item from hash on mount', async () => {
    history.replaceState(null, '', '#blog/first-post')

    const wrapper = mount(createHarness(itemsFixture))
    await nextTick()

    expect(getSelectedId(wrapper)).toBe('post-1')
  })

  it('updates hash when opening and closing an item', async () => {
    const wrapper = mount(createHarness(itemsFixture))

    getHarnessVm(wrapper).open('post-2')
    await nextTick()

    expect(window.location.hash).toBe('#blog/second-post')
    expect(getSelectedId(wrapper)).toBe('post-2')
    getHarnessVm(wrapper).close()
    await nextTick()

    expect(window.location.hash).toBe('#blog')
    expect(getSelectedId(wrapper)).toBeNull()
  })

  it('ignores unmatched slug values', async () => {
    history.replaceState(null, '', '#blog/not-a-post')

    const wrapper = mount(createHarness(itemsFixture))
    await nextTick()

    expect(getSelectedId(wrapper)).toBeNull()
  })

  it('reacts to hashchange events', async () => {
    const wrapper = mount(createHarness(itemsFixture))

    history.replaceState(null, '', '#blog/second-post')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()

    expect(getSelectedId(wrapper)).toBe('post-2')

    history.replaceState(null, '', '#projects')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()

    expect(getSelectedId(wrapper)).toBeNull()
  })

  it('clears previous selection when hash changes to unknown slug', async () => {
    const wrapper = mount(createHarness(itemsFixture))

    history.replaceState(null, '', '#blog/first-post')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(getSelectedId(wrapper)).toBe('post-1')

    history.replaceState(null, '', '#blog/does-not-exist')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(getSelectedId(wrapper)).toBeNull()
  })

  it('opens once items become available after mount', async () => {
    history.replaceState(null, '', '#blog/second-post')

    const wrapper = mount(createHarness([]))
    await nextTick()
    expect(getSelectedId(wrapper)).toBeNull()
    getHarnessVm(wrapper).setItems(itemsFixture)
    await nextTick()

    expect(getSelectedId(wrapper)).toBe('post-2')
  })
})
