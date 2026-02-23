import { defineComponent, nextTick } from 'vue'
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectsSection from '../sections/ProjectsSection.vue'
import type { Project } from '@/types'

const projectsFixture = [
  {
    id: 'project-1',
    slug: 'first-project',
    title: 'First Project',
    excerpt: 'First project excerpt',
    techStack: [{ tech: 'Vue' }],
    images: [
      {
        image: {
          id: 'image-1',
          width: 1000,
          height: 600,
          alt: 'Project image',
        },
      },
    ],
    description: null,
    githubUrl: null,
    liveUrl: null,
  },
] as unknown as Project[]

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

const mountProjectsSection = (props: Record<string, unknown> = {}) => {
  return mount(ProjectsSection, {
    props: {
      title: 'Projects',
      projects: projectsFixture,
      loading: false,
      visible: true,
      ...props,
    },
    global: {
      stubs: {
        Card: { template: '<div class="card-stub"><slot /></div>' },
        SkeletonText: { template: '<div class="skeleton-text-stub" />' },
        SkeletonBox: { template: '<div class="skeleton-box-stub" />' },
        EmptyState: {
          props: ['message'],
          template: '<div class="empty-state-stub">{{ message }}</div>',
        },
        LazyImage: { template: '<div class="lazy-image-stub" />' },
        ProjectGallery: { template: '<div class="project-gallery-stub" />' },
        RichText: { template: '<div class="rich-text-stub" />' },
        ContentLightbox: ContentLightboxStub,
        FontAwesomeIcon: { template: '<i class="fa-stub" />' },
      },
    },
  })
}

describe('ProjectsSection', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/')
  })

  it('renders empty state when there are no projects', () => {
    const wrapper = mountProjectsSection({ projects: [] })
    expect(wrapper.find('.empty-state-stub').text()).toContain('Projects coming soon...')
  })

  it('opens project lightbox and updates hash on click', async () => {
    const wrapper = mountProjectsSection()

    await wrapper.find('.project-link').trigger('click')
    await nextTick()

    expect(window.location.hash).toBe('#projects/first-project')
    expect(wrapper.find('.content-lightbox-stub').attributes('data-open')).toBe('true')
    expect(wrapper.text()).toContain('First Project')
  })

  it('closes project lightbox and restores section hash', async () => {
    const wrapper = mountProjectsSection()

    await wrapper.find('.project-link').trigger('click')
    await nextTick()

    await wrapper.find('.close-lightbox').trigger('click')
    await nextTick()

    expect(window.location.hash).toBe('#projects')
    expect(wrapper.find('.content-lightbox-stub').attributes('data-open')).toBe('false')
  })

  it('auto-opens project from deep-link hash', async () => {
    history.replaceState(null, '', '#projects/first-project')

    const wrapper = mountProjectsSection()
    await nextTick()

    expect(wrapper.find('.content-lightbox-stub').attributes('data-open')).toBe('true')
    expect(wrapper.text()).toContain('First Project')
  })
})
