<script setup lang="ts">
import { computed } from 'vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import {
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
  type ImageSizesPreset,
} from '@/composables/useMedia'
import type { ImageSizeName, Media } from '@/types'

const props = withDefaults(
  defineProps<{
    media?: Media
    alt?: string
    size?: ImageSizeName
    srcsetSizes?: ImageSizeName[]
    sizesPreset?: ImageSizesPreset
    sizes?: string
    thumbnailSize?: ImageSizeName
    aspectRatio?: number
    eager?: boolean
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    size: 'md',
    thumbnailSize: 'xs',
    eager: false,
    fetchpriority: 'auto',
  },
)

const resolvedAlt = computed(() => props.alt ?? props.media?.alt ?? '')

const resolvedSizes = computed(() => {
  if (props.sizes) return props.sizes
  if (props.sizesPreset) return imageSizesPresets[props.sizesPreset]
  return undefined
})

const src = computed(() => getImageUrl(props.media, props.size))
const srcset = computed(() => getImageSrcset(props.media, props.srcsetSizes))
const srcsetAvif = computed(() => getImageSrcsetAvif(props.media, props.srcsetSizes))
const thumbnailSrc = computed(() => getImageUrl(props.media, props.thumbnailSize))

const resolvedAspectRatio = computed(() => {
  if (props.aspectRatio) return props.aspectRatio
  if (props.media?.width && props.media?.height) {
    return props.media.height / props.media.width
  }
  return undefined
})
</script>

<template>
  <LazyImage
    v-if="props.media"
    :src="src"
    :srcset="srcset"
    :srcset-avif="srcsetAvif"
    :sizes="resolvedSizes"
    :thumbnail-src="thumbnailSrc"
    :alt="resolvedAlt"
    :aspect-ratio="resolvedAspectRatio"
    :eager="props.eager"
    :fetchpriority="props.fetchpriority"
  />
</template>
