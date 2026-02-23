import { defineComponent, nextTick, ref } from 'vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '../HomeView.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'

const { apiMocks, getImageUrlMock } = vi.hoisted(() => ({
  apiMocks: {
    globals: {
      getAbout: vi.fn(),
    },
    projects: {
      getFeatured: vi.fn(),
    },
    blogPosts: {
      getRecent: vi.fn(),
    },
    photos: {
      getAll: vi.fn(),
    },
    github: {
      getStats: vi.fn(),
    },
  },
  getImageUrlMock: vi.fn((media?: { id?: string } | null, size?: string) => {
    if (!media?.id) return ''
    return `${size ?? 'md'}-${media.id}`
  }),
}))

vi.mock('@/services/payload', () => ({
  api: apiMocks,
}))

vi.mock('@/composables/useMedia', () => ({
  getImageUrl: getImageUrlMock,
}))

vi.mock('@/composables/useSeo', () => ({
  useSeo: vi.fn(),
  toAbsoluteUrl: (value: string) => value,
}))

const HeroSectionStub = defineComponent({
  props: ['firstName', 'lastName'],
  template: '<div class="hero-stub">{{ firstName }} {{ lastName }}</div>',
})

const AboutSectionStub = defineComponent({
  props: ['title', 'about', 'loadingAbout'],
  template:
    '<div class="about-stub" :data-title="title" :data-has-about="about ? \'yes\' : \'no\'" :data-loading="String(loadingAbout)" />',
})

const ProjectsSectionStub = defineComponent({
  props: ['title', 'projects', 'loading'],
  template:
    '<div class="projects-stub" :data-title="title" :data-count="projects.length" :data-loading="String(loading)" />',
})

const BlogSectionStub = defineComponent({
  props: ['title', 'posts', 'loading'],
  template:
    '<div class="blog-stub" :data-title="title" :data-count="posts.length" :data-loading="String(loading)" />',
})

const PhotosSectionStub = defineComponent({
  props: ['title', 'photos', 'loading'],
  template:
    '<div class="photos-stub" :data-title="title" :data-count="photos.length" :data-loading="String(loading)" />',
})

const ContactSectionStub = defineComponent({
  props: ['title'],
  template: '<div class="contact-stub" :data-title="title" />',
})

const FooterSectionStub = defineComponent({
  props: ['name'],
  template: '<div class="footer-stub">{{ name?.first }} {{ name?.last }}</div>',
})

const siteSettingsFixture = {
  name: {
    first: 'Galen',
    last: 'Green',
  },
  sectionTitles: {
    about: 'About',
    projects: 'Projects',
    blog: 'Blog',
    photos: 'Photos',
    contact: 'Contact',
  },
  seo: {
    description: 'desc',
    jobTitle: 'Developer',
  },
  socials: [],
}

const mountHomeView = () => {
  return mount(HomeView, {
    global: {
      provide: {
        siteSettings: ref(siteSettingsFixture),
      },
      stubs: {
        HeroSection: HeroSectionStub,
        AboutSection: AboutSectionStub,
        ProjectsSection: ProjectsSectionStub,
        BlogSection: BlogSectionStub,
        PhotosSection: PhotosSectionStub,
        ContactSection: ContactSectionStub,
        FooterSection: FooterSectionStub,
      },
    },
  })
}

describe('HomeView', () => {
  beforeEach(() => {
    const preloader = useImagePreloader()
    preloader.reset()

    document.head.querySelectorAll('link[rel="prefetch"]').forEach((el) => {
      el.remove()
    })

    getImageUrlMock.mockClear()

    apiMocks.globals.getAbout.mockReset()
    apiMocks.projects.getFeatured.mockReset()
    apiMocks.blogPosts.getRecent.mockReset()
    apiMocks.photos.getAll.mockReset()
    apiMocks.github.getStats.mockReset()
  })

  it('keeps rendering fulfilled sections when one API call fails', async () => {
    apiMocks.globals.getAbout.mockRejectedValueOnce(new Error('about failed'))
    apiMocks.projects.getFeatured.mockResolvedValueOnce([{ id: 'project-1' }])
    apiMocks.blogPosts.getRecent.mockResolvedValueOnce([{ id: 'post-1' }])
    apiMocks.photos.getAll.mockResolvedValueOnce([{ id: 'photo-1' }])
    apiMocks.github.getStats.mockResolvedValueOnce({ totalContributions: 10 })

    const wrapper = mountHomeView()
    await flushPromises()
    await nextTick()

    const about = wrapper.find('.about-stub')
    expect(about.attributes('data-has-about')).toBe('no')
    expect(about.attributes('data-loading')).toBe('false')

    const projects = wrapper.find('.projects-stub')
    expect(projects.attributes('data-count')).toBe('1')
    expect(projects.attributes('data-loading')).toBe('false')

    const blog = wrapper.find('.blog-stub')
    expect(blog.attributes('data-count')).toBe('1')
    expect(blog.attributes('data-loading')).toBe('false')

    const photos = wrapper.find('.photos-stub')
    expect(photos.attributes('data-count')).toBe('1')
    expect(photos.attributes('data-loading')).toBe('false')
  })

  it('shows user-facing error when all API requests fail', async () => {
    apiMocks.globals.getAbout.mockRejectedValueOnce(new Error('about failed'))
    apiMocks.projects.getFeatured.mockRejectedValueOnce(new Error('projects failed'))
    apiMocks.blogPosts.getRecent.mockRejectedValueOnce(new Error('blog failed'))
    apiMocks.photos.getAll.mockRejectedValueOnce(new Error('photos failed'))
    apiMocks.github.getStats.mockRejectedValueOnce(new Error('github failed'))

    const wrapper = mountHomeView()
    await flushPromises()
    await nextTick()

    const error = wrapper.find('.page-error')
    expect(error.exists()).toBe(true)
    expect(error.text()).toContain('Failed to load content')
  })

  it('prefetches images when critical images are already loaded before data arrives', async () => {
    const preloader = useImagePreloader()
    await preloader.preloadCritical([])

    apiMocks.globals.getAbout.mockResolvedValueOnce({ photo: { id: 'about-photo' } })
    apiMocks.projects.getFeatured.mockResolvedValueOnce([
      { id: 'project-1', images: [{ image: { id: 'project-image-1' } }] },
    ])
    apiMocks.blogPosts.getRecent.mockResolvedValueOnce([
      { id: 'post-1', coverImage: { id: 'cover-1' } },
    ])
    apiMocks.photos.getAll.mockResolvedValueOnce([
      { id: 'photo-1', image: { id: 'photo-image-1' } },
    ])
    apiMocks.github.getStats.mockResolvedValueOnce({ totalContributions: 10 })

    mountHomeView()
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 5))

    const prefetchedLinks = Array.from(document.head.querySelectorAll('link[rel="prefetch"]')).map(
      (link) => link.getAttribute('href'),
    )

    expect(prefetchedLinks).toEqual(
      expect.arrayContaining([
        'md-project-image-1',
        'md-photo-image-1',
        'lg-photo-image-1',
        'md-cover-1',
      ]),
    )
  })

  it('passes expected section titles and site identity to child sections', async () => {
    apiMocks.globals.getAbout.mockResolvedValueOnce({ id: 'about-1' })
    apiMocks.projects.getFeatured.mockResolvedValueOnce([])
    apiMocks.blogPosts.getRecent.mockResolvedValueOnce([])
    apiMocks.photos.getAll.mockResolvedValueOnce([])
    apiMocks.github.getStats.mockResolvedValueOnce(null)

    const wrapper = mountHomeView()
    await flushPromises()

    expect(wrapper.find('.hero-stub').text()).toContain('Galen Green')
    expect(wrapper.find('.about-stub').attributes('data-title')).toBe('About')
    expect(wrapper.find('.projects-stub').attributes('data-title')).toBe('Projects')
    expect(wrapper.find('.blog-stub').attributes('data-title')).toBe('Blog')
    expect(wrapper.find('.photos-stub').attributes('data-title')).toBe('Photos')
    expect(wrapper.find('.contact-stub').attributes('data-title')).toBe('Contact')
    expect(wrapper.find('.footer-stub').text()).toContain('Galen Green')
  })
})
