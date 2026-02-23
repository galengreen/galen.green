import { defineComponent, nextTick } from 'vue'
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PhotosSection from '../sections/PhotosSection.vue'
import type { Photo } from '@/types'

const photosFixture = [
  {
    id: 'photo-1',
    title: 'Photo One',
    image: {
      id: 'image-1',
      width: 1200,
      height: 800,
      alt: 'Photo one alt',
    },
  },
  {
    id: 'photo-2',
    title: 'Photo Two',
    image: {
      id: 'image-2',
      width: 1000,
      height: 1500,
      alt: 'Photo two alt',
    },
  },
] as unknown as Photo[]

const MasonryGridStub = defineComponent({
  props: ['photos'],
  emits: ['photo-click'],
  template:
    '<div class="masonry-grid-stub"><button v-for="photo in photos" :key="photo.id" class="photo-button" @click="$emit(\'photo-click\', photo.id)">{{ photo.title }}</button></div>',
})

const PhotoLightboxStub = defineComponent({
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['close'],
  template:
    '<div class="photo-lightbox-stub" :data-open="open ? \'true\' : \'false\'" :data-index="String(initialIndex)"><button class="close-lightbox" @click="$emit(\'close\')">close</button></div>',
})

const mountPhotosSection = (props: Record<string, unknown> = {}) => {
  return mount(PhotosSection, {
    props: {
      title: 'Photos',
      photos: photosFixture,
      loading: false,
      visible: true,
      ...props,
    },
    global: {
      stubs: {
        EmptyState: {
          props: ['message'],
          template: '<div class="empty-state-stub">{{ message }}</div>',
        },
        SkeletonBox: { template: '<div class="skeleton-box-stub" />' },
        LazyImage: { template: '<div class="lazy-image-stub" />' },
        MasonryGrid: MasonryGridStub,
        PhotoLightbox: PhotoLightboxStub,
      },
    },
  })
}

describe('PhotosSection', () => {
  it('renders empty state when there are no photos', () => {
    const wrapper = mountPhotosSection({ photos: [] })
    expect(wrapper.find('.empty-state-stub').text()).toContain('Photos coming soon...')
  })

  it('opens lightbox at clicked photo index', async () => {
    const wrapper = mountPhotosSection()

    await wrapper.findAll('.photo-button')[1]!.trigger('click')
    await nextTick()

    const lightbox = wrapper.find('.photo-lightbox-stub')
    expect(lightbox.attributes('data-open')).toBe('true')
    expect(lightbox.attributes('data-index')).toBe('1')
  })

  it('closes lightbox when close event is emitted', async () => {
    const wrapper = mountPhotosSection()

    await wrapper.findAll('.photo-button')[0]!.trigger('click')
    await nextTick()

    await wrapper.find('.close-lightbox').trigger('click')
    await nextTick()

    expect(wrapper.find('.photo-lightbox-stub').attributes('data-open')).toBe('false')
  })
})
