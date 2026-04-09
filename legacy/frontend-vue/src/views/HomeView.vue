<script setup lang="ts">
import { computed, ref, watch, inject, type Ref } from 'vue'
import ContentContainer from '@/components/layout/ContentContainer.vue'
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
  <div
    class="pt-[calc(var(--navbar-height)+var(--navbar-top)+1rem)] md:pt-[calc(var(--navbar-height)+var(--navbar-top)+2rem)]"
  >
    <HeroSection
      :about="about"
      :first-name="siteName.first"
      :last-name="siteName.last"
      :background-image-light="siteSettings?.heroBackground?.light"
      :background-image-dark="siteSettings?.heroBackground?.dark"
      :foreground-image-light="siteSettings?.heroForeground?.light"
      :foreground-image-dark="siteSettings?.heroForeground?.dark"
    />

    <ContentContainer>
      <p v-if="error" class="mb-6 text-center text-sm text-red-500" role="alert">{{ error }}</p>
    </ContentContainer>

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
</template>
