<script setup lang="ts">
import { computed, onMounted, ref, watch, inject, type Ref } from 'vue'
import FooterSection from '@/components/sections/FooterSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import PhotosSection from '@/components/sections/PhotosSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { getImageUrl } from '@/composables/useMedia'
import { useSeo, toAbsoluteUrl } from '@/composables/useSeo'
import { api } from '@/services/payload'
import type { About, BlogPost, GitHubStats, Photo, Project, SiteSettings } from '@/types'

// Image preloader for idle prefetch
const { prefetchOnIdle, criticalImagesLoaded } = useImagePreloader()

// Get site settings from App.vue (already fetched)
const siteSettings = inject<Ref<SiteSettings | null>>('siteSettings', ref(null))

// Data refs
const about = ref<About | null>(null)
const projects = ref<Project[]>([])
const blogPosts = ref<BlogPost[]>([])
const photos = ref<Photo[]>([])
const githubStats = ref<GitHubStats | null>(null)

// Loading states
const loading = ref({
  about: true,
  projects: true,
  blog: true,
  photos: true,
  github: true,
})

// Computed helpers for site settings
const siteName = computed(() => ({
  first: siteSettings.value?.name?.first || '',
  last: siteSettings.value?.name?.last || '',
}))

const sectionTitles = computed(() => ({
  about: siteSettings.value?.sectionTitles?.about || '',
  projects: siteSettings.value?.sectionTitles?.projects || '',
  blog: siteSettings.value?.sectionTitles?.blog || '',
  photos: siteSettings.value?.sectionTitles?.photos || '',
  contact: siteSettings.value?.sectionTitles?.contact || '',
}))

// SEO — dynamically set meta tags and Person JSON-LD from CMS data
// Use dedicated OG image if set, otherwise fall back to profile photo
const ogImageUrl = computed(() => {
  const seoImage = siteSettings.value?.seo?.ogImage
  if (seoImage) {
    return toAbsoluteUrl(getImageUrl(seoImage, 'lg'))
  }
  return toAbsoluteUrl(getImageUrl(about.value?.photo, 'lg'))
})
const personImageUrl = computed(() => toAbsoluteUrl(getImageUrl(about.value?.photo, 'lg')))

useSeo({
  description: computed(() => siteSettings.value?.seo?.description),
  ogImage: ogImageUrl,
  ogType: 'profile',
  socials: computed(() => siteSettings.value?.socials),
  personImage: personImageUrl,
  jobTitle: computed(() => siteSettings.value?.seo?.jobTitle),
})

// Error state
const error = ref<string | null>(null)

// Fetch all data
onMounted(async () => {
  // Fetch in parallel (excluding siteSettings which comes from App.vue)
  const fetchAll = async () => {
    try {
      const [aboutData, projectsData, blogData, photosData, githubData] = await Promise.allSettled([
        api.globals.getAbout(),
        api.projects.getFeatured(),
        api.blogPosts.getRecent(5),
        api.photos.getAll(30),
        api.github.getStats(),
      ])

      if (aboutData.status === 'fulfilled') {
        about.value = aboutData.value
      }
      loading.value.about = false

      if (projectsData.status === 'fulfilled') {
        projects.value = projectsData.value
      }
      loading.value.projects = false

      if (blogData.status === 'fulfilled') {
        blogPosts.value = blogData.value
      }
      loading.value.blog = false

      if (photosData.status === 'fulfilled') {
        photos.value = photosData.value
      }
      loading.value.photos = false

      if (githubData.status === 'fulfilled') {
        githubStats.value = githubData.value
      }
      loading.value.github = false
    } catch (e) {
      error.value = 'Failed to load content. Please try again later.'
      console.error('Failed to fetch data:', e)
    }
  }

  fetchAll()
})

// Prefetch remaining images during idle time once critical images are loaded
watch(criticalImagesLoaded, (loaded) => {
  if (loaded) {
    // Collect all non-critical image URLs to prefetch
    const urlsToPrefetch: string[] = []

    // Project thumbnail images
    projects.value.forEach((project) => {
      if (project.images?.[0]?.image) {
        urlsToPrefetch.push(getImageUrl(project.images[0].image, 'md'))
      }
    })

    // Photo images (medium size for grid view)
    photos.value.forEach((photo) => {
      if (photo.image) {
        urlsToPrefetch.push(getImageUrl(photo.image, 'md'))
        // Also prefetch large for expanded view
        urlsToPrefetch.push(getImageUrl(photo.image, 'lg'))
      }
    })

    // Blog post cover images
    blogPosts.value.forEach((post) => {
      if (post.coverImage) {
        urlsToPrefetch.push(getImageUrl(post.coverImage, 'md'))
      }
    })

    // Prefetch all collected URLs during idle time
    if (urlsToPrefetch.length > 0) {
      prefetchOnIdle(urlsToPrefetch)
    }
  }
})
</script>

<template>
  <div class="home">
    <HeroSection
      :about="about"
      :first-name="siteName.first"
      :last-name="siteName.last"
      :background-image-light="siteSettings?.heroBackground?.light"
      :background-image-dark="siteSettings?.heroBackground?.dark"
      :foreground-image-light="siteSettings?.heroForeground?.light"
      :foreground-image-dark="siteSettings?.heroForeground?.dark"
      :visible="true"
    />

    <div class="page-content">
      <AboutSection
        :title="sectionTitles.about"
        :about="about"
        :github-stats="githubStats"
        :loading-about="loading.about"
        :loading-github="loading.github"
        :visible="true"
      />

      <ProjectsSection
        :title="sectionTitles.projects"
        :projects="projects"
        :loading="loading.projects"
        :visible="true"
      />

      <BlogSection
        :title="sectionTitles.blog"
        :posts="blogPosts"
        :loading="loading.blog"
        :visible="true"
      />

      <PhotosSection
        :title="sectionTitles.photos"
        :photos="photos"
        :loading="loading.photos"
        :visible="true"
      />

      <ContactSection :title="sectionTitles.contact" :visible="true" />

      <FooterSection :name="siteSettings?.name" :socials="siteSettings?.socials" />
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-8));
}

.page-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (max-width: 768px) {
  .home {
    padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-4));
  }

  .page-content {
    padding: 0 var(--space-4);
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 0 var(--space-3);
  }
}
</style>
