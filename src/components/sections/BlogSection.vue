<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  formatDate,
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
} from '@/composables/useMedia'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import ContentLightbox from '@/components/ui/ContentLightbox.vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import RichText from '@/components/ui/RichText.vue'
import type { BlogPost } from '@/types'

const props = defineProps<{
  title: string
  posts: BlogPost[]
  loading: boolean
  visible: boolean
}>()

const selectedPostId = ref<string | null>(null)

const selectedPost = computed(() => props.posts.find((p) => p.id === selectedPostId.value) || null)

const openPost = (id: string) => {
  selectedPostId.value = id
}

const closePost = () => {
  selectedPostId.value = null
}

const formatDateLong = (dateString: string) => {
  return formatDate(dateString, { longMonth: true })
}
</script>

<template>
  <section id="blog" class="section fade-in" :class="{ visible }">
    <div class="container container-narrow">
      <h2 class="section-title">{{ title }}</h2>

      <div v-if="loading" class="blog-list">
        <div v-for="i in 3" :key="i" class="blog-item">
          <SkeletonText :lines="3" short-last />
        </div>
      </div>

      <div v-else-if="posts.length" class="blog-list">
        <article v-for="post in posts" :key="post.id" class="blog-item" @click="openPost(post.id)">
          <time class="blog-date text-subtle">{{ formatDate(post.date) }}</time>
          <h3 class="blog-title">{{ post.title }}</h3>
          <p v-if="post.excerpt" class="blog-excerpt text-muted">{{ post.excerpt }}</p>
        </article>
      </div>

      <EmptyState v-else message="Blog posts coming soon..." />

      <!-- Blog Post Lightbox -->
      <ContentLightbox :open="!!selectedPost" @close="closePost">
        <template v-if="selectedPost">
          <!-- Cover image -->
          <LazyImage
            v-if="selectedPost.coverImage"
            :src="getImageUrl(selectedPost.coverImage, 'lg')"
            :srcset="getImageSrcset(selectedPost.coverImage)"
            :srcset-avif="getImageSrcsetAvif(selectedPost.coverImage)"
            :sizes="imageSizesPresets.hero"
            :thumbnail-src="getImageUrl(selectedPost.coverImage, 'xs')"
            :alt="selectedPost.coverImage.alt || selectedPost.title"
            :aspect-ratio="selectedPost.coverImage.height / selectedPost.coverImage.width"
            class="lightbox-cover"
            eager
          />

          <!-- Content -->
          <div class="lightbox-content">
            <header class="lightbox-header">
              <time class="lightbox-date text-subtle">{{ formatDateLong(selectedPost.date) }}</time>
              <h2 class="lightbox-title">{{ selectedPost.title }}</h2>
            </header>

            <div class="lightbox-body">
              <RichText :content="selectedPost.content" />
            </div>
          </div>
        </template>
      </ContentLightbox>
    </div>
  </section>
</template>

<style scoped>
.blog-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.blog-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.blog-item:hover {
  opacity: 0.7;
}

.blog-item:last-child {
  border-bottom: none;
}

.blog-date {
  font-size: var(--text-sm);
}

.blog-title {
  font-size: var(--text-xl);
}

.blog-excerpt {
  line-height: var(--leading-relaxed);
}

/* Lightbox content styles */
.lightbox-cover {
  width: 100%;
}

.lightbox-content {
  padding: var(--space-6);
}

.lightbox-header {
  margin-bottom: var(--space-6);
}

.lightbox-date {
  display: block;
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}

.lightbox-title {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
}

.lightbox-body {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
}

@media (max-width: 768px) {
  .blog-item {
    padding: var(--space-3);
  }

  .lightbox-content {
    padding: var(--space-4);
  }

  .lightbox-title {
    font-size: var(--text-2xl);
  }

  .lightbox-body {
    font-size: var(--text-base);
  }
}

@media (max-width: 480px) {
  .blog-title {
    font-size: var(--text-lg);
  }

  .lightbox-title {
    font-size: var(--text-xl);
  }
}
</style>
