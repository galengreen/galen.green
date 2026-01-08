<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import FooterSection from '@/components/sections/FooterSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import PhotosSection from '@/components/sections/PhotosSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import { useScrollAnimations } from '@/composables/useScrollAnimation'
import { api } from '@/services/payload'
import type { About, BlogPost, GitHubStats, Photo, Project, SiteSettings } from '@/types'

// Scroll animations
const { observe, isVisible } = useScrollAnimations({ threshold: 0.1 })

// Section refs for scroll animations
const heroRef = ref<HTMLElement | null>(null)
const aboutRef = ref<HTMLElement | null>(null)
const projectsRef = ref<HTMLElement | null>(null)
const blogRef = ref<HTMLElement | null>(null)
const photosRef = ref<HTMLElement | null>(null)
const contactRef = ref<HTMLElement | null>(null)

// Data refs
const siteSettings = ref<SiteSettings | null>(null)
const about = ref<About | null>(null)
const projects = ref<Project[]>([])
const blogPosts = ref<BlogPost[]>([])
const photos = ref<Photo[]>([])
const githubStats = ref<GitHubStats | null>(null)

// Loading states
const loading = ref({
  site: true,
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

// Error state
const error = ref<string | null>(null)

// Fetch all data
onMounted(async () => {
  // Set up scroll animations after DOM is ready
  nextTick(() => {
    observe('hero', heroRef.value)
    observe('about', aboutRef.value)
    observe('projects', projectsRef.value)
    observe('blog', blogRef.value)
    observe('photos', photosRef.value)
    observe('contact', contactRef.value)
  })

  // Fetch in parallel
  const fetchAll = async () => {
    try {
      const [siteData, aboutData, projectsData, blogData, photosData, githubData] =
        await Promise.allSettled([
          api.globals.getSiteSettings(),
          api.globals.getAbout(),
          api.projects.getFeatured(),
          api.blogPosts.getRecent(5),
          api.photos.getAll(30),
          api.github.getStats(),
        ])

      if (siteData.status === 'fulfilled') {
        siteSettings.value = siteData.value
      }
      loading.value.site = false

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
</script>

<template>
  <div class="home">
    <div ref="heroRef">
      <HeroSection
        :about="about"
        :first-name="siteName.first"
        :last-name="siteName.last"
        :visible="isVisible('hero')"
      />
    </div>

    <div ref="aboutRef">
      <AboutSection
        :title="sectionTitles.about"
        :about="about"
        :github-stats="githubStats"
        :loading-about="loading.about"
        :loading-github="loading.github"
        :visible="isVisible('about')"
      />
    </div>

    <div ref="projectsRef">
      <ProjectsSection
        :title="sectionTitles.projects"
        :projects="projects"
        :loading="loading.projects"
        :visible="isVisible('projects')"
      />
    </div>

    <div ref="blogRef">
      <BlogSection
        :title="sectionTitles.blog"
        :posts="blogPosts"
        :loading="loading.blog"
        :visible="isVisible('blog')"
      />
    </div>

    <div ref="photosRef">
      <PhotosSection
        :title="sectionTitles.photos"
        :photos="photos"
        :loading="loading.photos"
        :visible="isVisible('photos')"
      />
    </div>

    <div ref="contactRef">
      <ContactSection :title="sectionTitles.contact" :visible="isVisible('contact')" />
    </div>

    <FooterSection :name="siteSettings?.name" :socials="siteSettings?.socials" />
  </div>
</template>

<style scoped>
.home {
  padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-8));
}

@media (max-width: 768px) {
  .home {
    padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-4));
  }
}
</style>
