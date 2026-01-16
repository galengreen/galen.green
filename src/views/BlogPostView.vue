<script setup lang="ts">
import { ref, onMounted, watch, inject, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/payload'
import type { BlogPost, SiteSettings } from '@/types'
import RichText from '@/components/ui/RichText.vue'
import FooterSection from '@/components/sections/FooterSection.vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import {
  formatDate,
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
} from '@/composables/useMedia'

const route = useRoute()
const router = useRouter()

// Get site settings from App.vue (already fetched)
const siteSettings = inject<Ref<SiteSettings | null>>('siteSettings', ref(null))

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

const formatDateLong = (dateString: string) => {
  return formatDate(dateString, { longMonth: true })
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
      <button class="back-link link" @click="goBack">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="back-icon" />
        Back to all posts
      </button>

      <!-- Loading state -->
      <div v-if="loading" class="loading">
        <SkeletonBox height="2.5rem" rounded="sm" class="skeleton-title" />
        <SkeletonBox height="1rem" rounded="sm" class="skeleton-date" />
        <SkeletonText :lines="3" short-last />
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
        <LazyImage
          v-if="post.coverImage"
          :src="getImageUrl(post.coverImage, 'lg')"
          :srcset="getImageSrcset(post.coverImage)"
          :srcset-avif="getImageSrcsetAvif(post.coverImage)"
          :sizes="imageSizesPresets.hero"
          :thumbnail-src="getImageUrl(post.coverImage, 'xs')"
          :alt="post.coverImage.alt || post.title"
          :aspect-ratio="post.coverImage.height / post.coverImage.width"
          class="cover-image"
          eager
        />

        <header class="post-header">
          <time class="post-date text-subtle">{{ formatDateLong(post.date) }}</time>
          <h1 class="post-title">{{ post.title }}</h1>
        </header>

        <div class="post-content">
          <RichText :content="post.content" />
        </div>
      </template>
    </div>

    <FooterSection v-if="!loading" :name="siteSettings?.name" :socials="siteSettings?.socials" />
  </article>
</template>

<style scoped>
.blog-post {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-12));
}

.container {
  flex: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.back-icon {
  font-size: var(--text-xs);
}

.cover-image {
  width: 100%;
  border-radius: var(--space-3);
  margin-bottom: var(--space-8);
  overflow: hidden;
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

.skeleton-title {
  width: 80%;
  margin-bottom: var(--space-2);
}

.skeleton-date {
  width: 30%;
  margin-bottom: var(--space-4);
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
    border-radius: var(--space-2);
  }
}
</style>
