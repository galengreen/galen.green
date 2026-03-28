import { describe, expect, it } from 'vitest'
import {
  getAllImageUrls,
  getBestImageUrlForWidth,
  getBestImageUrlForWidthAndFormat,
  getImageSrcset,
  getImageSrcsetAvif,
  getImageUrl,
} from '../useMedia'
import type { Media } from '@/types'

const mediaFixture: Media = {
  id: 'media-1',
  alt: 'Panorama',
  url: 'https://example.com/original.jpg',
  filename: 'original.jpg',
  mimeType: 'image/jpeg',
  width: 4000,
  height: 1000,
  sizes: {
    xs: { url: 'https://example.com/xs.webp', width: 1280, height: 320 },
    sm: { url: 'https://example.com/sm.webp', width: 1920, height: 480 },
    md: { url: 'https://example.com/md.webp', width: 3072, height: 768 },
    full: { url: 'https://example.com/full.webp', width: 4000, height: 1000 },
    'xs-avif': { url: 'https://example.com/xs.avif', width: 1280, height: 320 },
    'sm-avif': { url: 'https://example.com/sm.avif', width: 1920, height: 480 },
    'full-avif': { url: 'https://example.com/full.avif', width: 4000, height: 1000 },
  },
}

describe('useMedia helpers', () => {
  it('returns full converted sizes when requested', () => {
    expect(getImageUrl(mediaFixture, 'full')).toBe('/full.webp')
    expect(getImageUrl(mediaFixture, 'full-avif')).toBe('/full.avif')
  })

  it('adds full webp and avif variants to srcsets', () => {
    expect(getImageSrcset(mediaFixture, ['xs', 'sm'])).toBe(
      '/xs.webp 1280w, /sm.webp 1920w, /full.webp 4000w',
    )
    expect(getImageSrcsetAvif(mediaFixture, ['xs', 'sm'])).toBe(
      '/xs.avif 1280w, /sm.avif 1920w, /full.avif 4000w',
    )
  })

  it('selects the smallest generated image that satisfies a width target', () => {
    expect(getBestImageUrlForWidth(mediaFixture, 1500)).toBe('/sm.webp')
    expect(getBestImageUrlForWidth(mediaFixture, 3500)).toBe('/full.webp')
    expect(getBestImageUrlForWidthAndFormat(mediaFixture, 1500, 'avif')).toBe('/sm.avif')
  })

  it('deduplicates repeated URLs when collecting all image URLs', () => {
    const duplicateMedia: Media = {
      ...mediaFixture,
      sizes: {
        ...mediaFixture.sizes,
        lg: { url: 'https://example.com/full.webp', width: 4000, height: 1000 },
      },
    }

    expect(getAllImageUrls(duplicateMedia)).toEqual([
      '/xs.webp',
      '/sm.webp',
      '/md.webp',
      '/full.webp',
      '/xs.avif',
      '/sm.avif',
      '/full.avif',
      '/original.jpg',
    ])
  })
})
