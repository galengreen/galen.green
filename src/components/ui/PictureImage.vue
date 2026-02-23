<script setup lang="ts">
import { computed } from 'vue'
import { getImageUrl, getImageSrcset, getImageSrcsetAvif } from '@/composables/useMedia'
import type { ImageSizeName, Media } from '@/types'

const props = withDefaults(
  defineProps<{
    media?: Media
    alt?: string
    size?: ImageSizeName
    sizes?: string
    imgStyle?: string | Record<string, string>
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    size: 'lg',
    fetchpriority: 'auto',
  },
)

const src = computed(() => getImageUrl(props.media, props.size))
const srcset = computed(() => getImageSrcset(props.media))
const srcsetAvif = computed(() => getImageSrcsetAvif(props.media))
const resolvedAlt = computed(() => props.alt ?? props.media?.alt ?? '')
</script>

<template>
  <picture v-if="props.media">
    <source v-if="srcsetAvif" :srcset="srcsetAvif" :sizes="sizes" type="image/avif" />
    <source v-if="srcset" :srcset="srcset" :sizes="sizes" type="image/webp" />
    <img :src="src" :alt="resolvedAlt" :fetchpriority="fetchpriority" :style="props.imgStyle" />
  </picture>
</template>
