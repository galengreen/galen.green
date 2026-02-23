import { defineComponent, nextTick } from 'vue'
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogSection from '../sections/BlogSection.vue'
import type { BlogPost } from '@/types'

const postsFixture = [
  {
    id: 'post-1',
    slug: 'first-post',
    title: 'First Post',
    date: '2025-01-10T00:00:00.000Z',
    excerpt: 'First excerpt',
    content: { root: { children: [] } },
    coverImage: null,
  },
  {
    id: 'post-2',
    slug: 'second-post',
    title: 'Second Post',
    date: '2025-01-11T00:00:00.000Z',
    excerpt: 'Second excerpt',
    content: { root: { children: [] } },
    coverImage: null,
  },
] as unknown as BlogPost[]

const ContentLightboxStub = defineComponent({
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  template:
    '<div class="content-lightbox-stub" :data-open="open ? \'true\' : \'false\'"><button class="close-lightbox" @click="$emit(\'close\')">close</button><slot v-if="open" /></div>',
})

const mountBlogSection = (props: Record<string, unknown> = {}) => {
  return mount(BlogSection, {
    props: {
      title: 'Blog',
      posts: postsFixture,
      loading: false,
      visible: true,
      ...props,
    },
    global: {
      stubs: {
        SkeletonText: {
          template: '<div class="skeleton-text-stub" />',
        },
        EmptyState: {
          props: ['message'],
          template: '<div class="empty-state-stub">{{ message }}</div>',
        },
        LazyImage: {
          template: '<div class="lazy-image-stub" />',
        },
        RichText: {
          template: '<div class="rich-text-stub" />',
        },
        ContentLightbox: ContentLightboxStub,
      },
    },
  })
}

describe('BlogSection', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/')
  })

  it('renders loading skeletons while loading', () => {
    const wrapper = mountBlogSection({ loading: true, posts: [] })

    expect(wrapper.findAll('.skeleton-text-stub')).toHaveLength(3)
  })

  it('renders empty state when there are no posts', () => {
    const wrapper = mountBlogSection({ loading: false, posts: [] })

    expect(wrapper.find('.empty-state-stub').text()).toContain('Blog posts coming soon...')
  })

  it('opens lightbox and updates hash when clicking a post', async () => {
    const wrapper = mountBlogSection()

    const firstPost = wrapper.findAll('.blog-item')[0]
    expect(firstPost).toBeDefined()
    await firstPost!.trigger('click')
    await nextTick()

    expect(window.location.hash).toBe('#blog/first-post')
    expect(wrapper.find('.content-lightbox-stub').attributes('data-open')).toBe('true')
    expect(wrapper.text()).toContain('First Post')
  })

  it('closes lightbox and restores section hash', async () => {
    const wrapper = mountBlogSection()

    const firstPost = wrapper.findAll('.blog-item')[0]
    expect(firstPost).toBeDefined()
    await firstPost!.trigger('click')
    await nextTick()

    await wrapper.find('.close-lightbox').trigger('click')
    await nextTick()

    expect(window.location.hash).toBe('#blog')
    expect(wrapper.find('.content-lightbox-stub').attributes('data-open')).toBe('false')
  })

  it('auto-opens post from deep-link hash', async () => {
    history.replaceState(null, '', '#blog/second-post')

    const wrapper = mountBlogSection()
    await nextTick()

    expect(wrapper.find('.content-lightbox-stub').attributes('data-open')).toBe('true')
    expect(wrapper.text()).toContain('Second Post')
  })
})
