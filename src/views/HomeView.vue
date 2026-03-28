<script setup lang="ts">
import { computed, ref, watch, inject, type Ref } from 'vue'
import FooterSection from '@/components/sections/FooterSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import PhotosSection from '@/components/sections/PhotosSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import { useHomeContent } from '@/composables/useHomeContent'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { getImageUrl } from '@/composables/useMedia'
import { useSeo, toAbsoluteUrl } from '@/composables/useSeo'
import type { SiteSettings } from '@/types'

// Image preloader for idle prefetch
const { prefetchOnIdle, criticalImagesLoaded } = useImagePreloader()

// Get site settings from App.vue (already fetched)
const siteSettings = inject<Ref<SiteSettings | null>>('siteSettings', ref(null))

const { about, projects, blogPosts, photos, githubStats, error, loading } = useHomeContent()

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

// Prefetch remaining images during idle time once critical images are loaded
watch(
  [criticalImagesLoaded, projects, photos, blogPosts],
  ([loaded]) => {
    if (!loaded) return

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
  },
  { immediate: true },
)
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
    />

    <div class="page-content">
      <p v-if="error" class="page-error" role="alert">{{ error }}</p>

      <AboutSection
        :title="sectionTitles.about"
        :about="about"
        :github-stats="githubStats"
        :loading-about="loading.about"
        :loading-github="loading.github"
      />

      <ProjectsSection
        :title="sectionTitles.projects"
        :projects="projects"
        :loading="loading.projects"
      />

      <BlogSection :title="sectionTitles.blog" :posts="blogPosts" :loading="loading.blog" />

      <PhotosSection :title="sectionTitles.photos" :photos="photos" :loading="loading.photos" />

      <ContactSection :title="sectionTitles.contact" />

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

.page-error {
  margin-bottom: var(--space-6);
  color: #ef4444;
  text-align: center;
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
