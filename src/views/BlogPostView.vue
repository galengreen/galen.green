<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/payload'
import type { BlogPost } from '@/types'
import RichText from '@/components/ui/RichText.vue'
import FooterSection from '@/components/layout/FooterSection.vue'

const route = useRoute()
const router = useRouter()

const CMS_URL = import.meta.env.VITE_PAYLOAD_URL || 'http://localhost:3000'

const post = ref<BlogPost | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const goBack = () => {
  router.push({ name: 'home', hash: '#blog' })
}

const fetchPost = async (slug: string) => {
  loading.value = true
  error.value = null

  try {
    const data = await api.blogPosts.getBySlug(slug)
    if (data) {
      post.value = data
    } else {
      error.value = 'Post not found'
    }
  } catch (e) {
    error.value = 'Failed to load post'
    console.error('Failed to fetch blog post:', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getImageUrl = (url: string) => {
  if (url && url.startsWith('/')) {
    return `${CMS_URL}${url}`
  }
  return url
}

onMounted(() => {
  const slug = route.params.slug as string
  if (slug) {
    fetchPost(slug)
  }
})

// Watch for route changes (if navigating between posts)
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug && typeof newSlug === 'string') {
      fetchPost(newSlug)
    }
  },
)
</script>

<template>
  <article class="blog-post">
    <div class="container container-narrow">
      <button class="back-link link" @click="goBack">&larr; Back to all posts</button>

      <!-- Loading state -->
      <div v-if="loading" class="loading">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-date"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error">
        <h1>{{ error }}</h1>
        <p class="text-muted">The post you're looking for doesn't exist or couldn't be loaded.</p>
        <button class="btn btn-primary" @click="goBack">Go back</button>
      </div>

      <!-- Post content -->
      <template v-else-if="post">
        <!-- Cover image -->
        <img
          v-if="post.coverImage?.url"
          :src="getImageUrl(post.coverImage.url)"
          :alt="post.coverImage.alt || post.title"
          class="cover-image"
        />

        <header class="post-header">
          <time class="post-date text-subtle">{{ formatDate(post.date) }}</time>
          <h1 class="post-title">{{ post.title }}</h1>
        </header>

        <div class="post-content">
          <RichText :content="post.content" />
        </div>
      </template>
    </div>

    <FooterSection v-if="!loading" />
  </article>
</template>

<style scoped>
.blog-post {
  padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-12));
  padding-bottom: var(--space-16);
}

.back-link {
  display: inline-block;
  margin-bottom: var(--space-8);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.cover-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--space-3);
  margin-bottom: var(--space-8);
}

.post-header {
  margin-bottom: var(--space-8);
}

.post-date {
  display: block;
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}

.post-title {
  font-size: var(--text-4xl);
  line-height: var(--leading-tight);
}

.post-content {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
}

/* Loading skeletons */
.loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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

.skeleton-title {
  height: 3rem;
  width: 80%;
}

.skeleton-date {
  height: 1rem;
  width: 30%;
}

.skeleton-text {
  height: 1.5rem;
  width: 100%;
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

/* Error state */
.error {
  text-align: center;
  padding: var(--space-16) 0;
}

.error h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.error p {
  margin-bottom: var(--space-8);
}

@media (max-width: 768px) {
  .blog-post {
    padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-8));
  }

  .post-title {
    font-size: var(--text-3xl);
  }

  .cover-image {
    max-height: 250px;
    margin-bottom: var(--space-6);
  }

  .post-content {
    font-size: var(--text-base);
  }

  .post-header {
    margin-bottom: var(--space-6);
  }
}

@media (max-width: 480px) {
  .post-title {
    font-size: var(--text-2xl);
  }

  .back-link {
    margin-bottom: var(--space-6);
  }

  .cover-image {
    max-height: 200px;
    border-radius: var(--space-2);
  }
}
</style>
