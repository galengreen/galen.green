<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/composables/useMedia'
import { useDeepLink } from '@/composables/useDeepLink'
import SectionShell from '@/components/sections/SectionShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import ContentLightbox from '@/components/ui/ContentLightbox.vue'
import LightboxContent from '@/components/ui/LightboxContent.vue'
import ResponsiveImage from '@/components/ui/ResponsiveImage.vue'
import RichText from '@/components/ui/RichText.vue'
import type { BlogPost } from '@/types'

const props = defineProps<{
  title: string
  posts: BlogPost[]
  loading: boolean
}>()

const {
  selectedId: selectedPostId,
  open: openPost,
  close: closePost,
} = useDeepLink('blog', () => props.posts)

const selectedPost = computed(() => props.posts.find((p) => p.id === selectedPostId.value) || null)

const formatDateLong = (dateString: string) => {
  return formatDate(dateString, { longMonth: true })
}
</script>

<template>
  <SectionShell id="blog" :title="title" container="narrow">
    <div v-if="loading" class="flex flex-col gap-8">
      <div v-for="i in 3" :key="i" class="border-b border-border pb-8 last:border-b-0">
        <SkeletonText :lines="3" short-last />
      </div>
    </div>

    <div v-else-if="posts.length" class="flex flex-col gap-8">
      <article
        v-for="post in posts"
        :key="post.id"
        class="cursor-pointer border-b border-border pb-8 transition hover:opacity-70 last:border-b-0 md:px-3"
        role="button"
        tabindex="0"
        @click="openPost(post.id)"
        @keydown.enter.prevent="openPost(post.id)"
        @keydown.space.prevent="openPost(post.id)"
      >
        <div class="flex flex-col gap-2">
          <time class="text-sm text-muted">{{ formatDate(post.date) }}</time>
          <h3 class="text-lg font-semibold tracking-tight text-text md:text-xl">
            {{ post.title }}
          </h3>
          <p v-if="post.excerpt" class="leading-7 text-muted">{{ post.excerpt }}</p>
        </div>
      </article>
    </div>

    <EmptyState v-else message="Blog posts coming soon..." />

    <ContentLightbox :open="!!selectedPost" :title="selectedPost?.title" @close="closePost">
      <template v-if="selectedPost">
        <ResponsiveImage
          v-if="selectedPost.coverImage"
          :media="selectedPost.coverImage"
          :alt="selectedPost.coverImage.alt || selectedPost.title"
          size="lg"
          sizes-preset="hero"
          thumbnail-size="xs"
          class="w-full"
          eager
        />

        <LightboxContent>
          <header class="mb-6">
            <time class="mb-2 block text-sm text-muted">{{
              formatDateLong(selectedPost.date)
            }}</time>
            <h2 class="text-2xl font-semibold tracking-tight text-text md:text-3xl">
              {{ selectedPost.title }}
            </h2>
          </header>

          <div class="text-base leading-7 text-text md:text-lg md:leading-8">
            <RichText :content="selectedPost.content" />
          </div>
        </LightboxContent>
      </template>
    </ContentLightbox>
  </SectionShell>
</template>
