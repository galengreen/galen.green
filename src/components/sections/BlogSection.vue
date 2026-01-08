<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatDate } from '@/composables/useMedia'
import type { BlogPost } from '@/types'

defineProps<{
  title: string
  posts: BlogPost[]
  loading: boolean
  visible: boolean
}>()

const router = useRouter()

const goToBlogPost = (slug: string) => {
  router.push({ name: 'blog-post', params: { slug } })
}
</script>

<template>
  <section id="blog" class="section fade-in" :class="{ visible }">
    <div class="container container-narrow">
      <h2 class="section-title">{{ title }}</h2>

      <div v-if="loading" class="blog-list">
        <div v-for="i in 3" :key="i" class="blog-item">
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>

      <div v-else-if="posts.length" class="blog-list">
        <article
          v-for="post in posts"
          :key="post.id"
          class="blog-item"
          @click="goToBlogPost(post.slug)"
        >
          <time class="blog-date text-subtle">{{ formatDate(post.date) }}</time>
          <h3 class="blog-title">{{ post.title }}</h3>
          <p v-if="post.excerpt" class="blog-excerpt text-muted">{{ post.excerpt }}</p>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="text-muted">Blog posts coming soon...</p>
      </div>
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

.empty-state {
  padding: var(--space-12);
  text-align: center;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-border) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--space-1);
}

.skeleton-text {
  height: 1.2em;
  margin-bottom: var(--space-2);
}

.skeleton-text.short {
  width: 60%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .blog-item {
    padding: var(--space-3);
  }
}

@media (max-width: 480px) {
  .blog-title {
    font-size: var(--text-lg);
  }
}
</style>
