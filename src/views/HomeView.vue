<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import FooterSection from '@/components/layout/FooterSection.vue'
import MasonryGrid from '@/components/ui/MasonryGrid.vue'
import GitHubGraph from '@/components/ui/GitHubGraph.vue'
import ProjectGallery from '@/components/ui/ProjectGallery.vue'
import { api } from '@/services/payload'
import { useScrollAnimations } from '@/composables/useScrollAnimation'
import type { About, Project, BlogPost, Photo, GitHubStats } from '@/types'

const router = useRouter()

// Scroll animations
const { observe, isVisible } = useScrollAnimations({ threshold: 0.1 })

// Section refs for scroll animations
const heroRef = ref<HTMLElement | null>(null)
const aboutRef = ref<HTMLElement | null>(null)
const projectsRef = ref<HTMLElement | null>(null)
const blogRef = ref<HTMLElement | null>(null)
const photosRef = ref<HTMLElement | null>(null)
const contactRef = ref<HTMLElement | null>(null)

// CMS URL for media files
const CMS_URL = import.meta.env.VITE_PAYLOAD_URL || 'http://localhost:3000'

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

// Error state
const error = ref<string | null>(null)

// Contact form
const contactForm = ref({
  name: '',
  email: '',
  message: '',
})
const contactSubmitting = ref(false)
const contactSuccess = ref(false)
const contactError = ref<string | null>(null)

// Expanded project (accordion)
const expandedProject = ref<string | null>(null)

// Expanded photo
const expandedPhoto = ref<string | null>(null)

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

// Toggle project expansion
const toggleProject = (id: string) => {
  expandedProject.value = expandedProject.value === id ? null : id
}

// Toggle photo expansion
const togglePhoto = (id: string) => {
  expandedPhoto.value = expandedPhoto.value === id ? null : id
}

// Transform photos for masonry grid with dimensions
const photosWithDimensions = computed(() => {
  return photos.value.map((photo) => ({
    ...photo,
    width: photo.image?.width || 100,
    height: photo.image?.height || 100,
  }))
})

// Navigate to blog post
const goToBlogPost = (slug: string) => {
  router.push({ name: 'blog-post', params: { slug } })
}

// Submit contact form
const submitContact = async () => {
  contactSubmitting.value = true
  contactError.value = null

  try {
    await api.contact.submit(contactForm.value)
    contactSuccess.value = true
    contactForm.value = { name: '', email: '', message: '' }
  } catch (e) {
    contactError.value = 'Failed to send message. Please try again.'
    console.error('Contact form error:', e)
  } finally {
    contactSubmitting.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Get image URL helper - prepends CMS URL to relative paths
const getImageUrl = (
  media: { url?: string } | undefined,
  size?: 'thumbnail' | 'medium' | 'large',
) => {
  if (!media) return ''

  // If sizes exist, use them, otherwise use main URL
  const sized = media as { sizes?: Record<string, { url: string }> }
  let url = ''

  if (size && sized.sizes?.[size]?.url) {
    url = sized.sizes[size].url
  } else {
    url = media.url || ''
  }

  // Prepend CMS URL if it's a relative path
  if (url && url.startsWith('/')) {
    return `${CMS_URL}${url}`
  }

  return url
}
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section
      id="hero"
      ref="heroRef"
      class="hero-section fade-in"
      :class="{ visible: isVisible('hero') }"
    >
      <div class="hero-content container">
        <div class="hero-image">
          <img
            v-if="about?.photo"
            :src="getImageUrl(about.photo, 'large')"
            :alt="about.photo.alt || 'Galen Green'"
            class="hero-photo"
          />
          <div v-else class="hero-image-placeholder">
            <span>Photo</span>
          </div>
        </div>
        <div class="hero-text">
          <h1 class="hero-name">
            <span class="name-first">Galen</span>
            <span class="name-last">Green</span>
          </h1>
          <p class="hero-subtitle text-muted">
            {{ about?.subtitle || 'Software Engineer & Photographer' }}
          </p>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section
      id="about"
      ref="aboutRef"
      class="section fade-in"
      :class="{ visible: isVisible('about') }"
    >
      <div class="container container-narrow">
        <h2 class="section-title">About</h2>
        <div v-if="loading.about" class="loading-placeholder">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
        <div v-else-if="about?.content" class="about-content rich-text">
          <!-- Rich text content from Payload would be rendered here -->
          <!-- For now, showing placeholder if no content -->
          <p>
            I'm a 4th year software engineering student from New Zealand with a passion for building
            elegant, performant web applications. When I'm not coding, you'll find me behind the
            camera capturing landscapes and urban scenes.
          </p>
          <p>
            This site showcases my journey through software development and photography – two
            creative outlets that share a common thread: attention to detail and a love for craft.
          </p>
        </div>
        <div v-else class="about-content">
          <p>
            I'm a 4th year software engineering student from New Zealand with a passion for building
            elegant, performant web applications. When I'm not coding, you'll find me behind the
            camera capturing landscapes and urban scenes.
          </p>
          <p>
            This site showcases my journey through software development and photography – two
            creative outlets that share a common thread: attention to detail and a love for craft.
          </p>
        </div>

        <!-- GitHub Activity -->
        <div v-if="loading.github" class="github-loading">
          <div class="skeleton" style="height: 200px; border-radius: var(--radius-lg)"></div>
        </div>
        <GitHubGraph
          v-else-if="githubStats?.contributionGraph"
          :contribution-graph="githubStats.contributionGraph"
          :total-contributions="githubStats.totalContributions"
          :current-streak="githubStats.currentStreak"
          :longest-streak="githubStats.longestStreak"
          class="about-github"
        />
      </div>
    </section>

    <!-- Projects Section -->
    <section
      id="projects"
      ref="projectsRef"
      class="section fade-in"
      :class="{ visible: isVisible('projects') }"
    >
      <div class="container">
        <h2 class="section-title">Projects</h2>

        <div v-if="loading.projects" class="projects-grid">
          <div v-for="i in 4" :key="i" class="project-card card">
            <div class="skeleton project-thumbnail"></div>
            <div class="project-info">
              <div class="skeleton skeleton-text short"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
          </div>
        </div>

        <div v-else-if="projects.length" class="projects-grid">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card card"
            :class="{ expanded: expandedProject === project.id }"
          >
            <button class="project-header" @click="toggleProject(project.id)">
              <img
                v-if="project.images?.[0]?.image"
                :src="getImageUrl(project.images[0].image, 'medium')"
                :alt="project.title"
                class="project-thumbnail"
              />
              <div v-else class="project-thumbnail placeholder"></div>
              <div class="project-info">
                <h3>{{ project.title }}</h3>
                <p class="text-muted">{{ project.excerpt }}</p>
                <div class="project-tags">
                  <span v-for="tech in project.techStack" :key="tech.tech" class="tag">
                    {{ tech.tech }}
                  </span>
                </div>
              </div>
            </button>

            <div v-if="expandedProject === project.id" class="project-expanded">
              <ProjectGallery
                v-if="project.images?.length"
                :images="project.images"
                :project-title="project.title"
              />
              <div class="project-description rich-text">
                <!-- Rich text description -->
                <p>{{ project.excerpt }}</p>
              </div>
              <div class="project-links">
                <a
                  v-if="project.liveUrl"
                  :href="project.liveUrl"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-primary"
                >
                  View Live
                </a>
                <a
                  v-if="project.githubUrl"
                  :href="project.githubUrl"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-secondary"
                >
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="text-muted">Projects coming soon...</p>
        </div>
      </div>
    </section>

    <!-- Blog Section -->
    <section
      id="blog"
      ref="blogRef"
      class="section fade-in"
      :class="{ visible: isVisible('blog') }"
    >
      <div class="container container-narrow">
        <h2 class="section-title">Blog</h2>

        <div v-if="loading.blog" class="blog-list">
          <div v-for="i in 3" :key="i" class="blog-item">
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>

        <div v-else-if="blogPosts.length" class="blog-list">
          <article
            v-for="post in blogPosts"
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

    <!-- Photos Section -->
    <section
      id="photos"
      ref="photosRef"
      class="section fade-in"
      :class="{ visible: isVisible('photos') }"
    >
      <div class="container">
        <h2 class="section-title">Photography</h2>

        <div v-if="loading.photos" class="photos-grid-loading">
          <div v-for="i in 6" :key="i" class="photo-item">
            <div class="skeleton photo-placeholder"></div>
          </div>
        </div>

        <MasonryGrid
          v-else-if="photos.length"
          :photos="photosWithDimensions"
          :column-count="3"
          :gap="16"
          @photo-click="togglePhoto"
        >
          <template #item="{ photo }">
            <div class="photo-item" :class="{ expanded: expandedPhoto === photo.id }">
              <img
                :src="getImageUrl(photo.image, 'medium')"
                :alt="photo.title"
                class="photo-image"
                loading="lazy"
              />
              <div v-if="expandedPhoto === photo.id" class="photo-expanded">
                <img
                  :src="getImageUrl(photo.image, 'large')"
                  :alt="photo.title"
                  class="photo-full"
                />
                <div class="photo-info">
                  <h4>{{ photo.title }}</h4>
                  <p v-if="photo.description" class="text-muted">{{ photo.description }}</p>
                  <time class="text-subtle">{{ formatDate(photo.date) }}</time>
                </div>
              </div>
            </div>
          </template>
        </MasonryGrid>

        <div v-else class="empty-state">
          <p class="text-muted">Photos coming soon...</p>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section
      id="contact"
      ref="contactRef"
      class="section fade-in"
      :class="{ visible: isVisible('contact') }"
    >
      <div class="container container-narrow">
        <h2 class="section-title">Contact</h2>

        <div v-if="contactSuccess" class="contact-success">
          <p>Thanks for your message! I'll get back to you soon.</p>
        </div>

        <form v-else class="contact-form" @submit.prevent="submitContact">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              v-model="contactForm.name"
              type="text"
              id="name"
              name="name"
              required
              :disabled="contactSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              v-model="contactForm.email"
              type="email"
              id="email"
              name="email"
              required
              :disabled="contactSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea
              v-model="contactForm.message"
              id="message"
              name="message"
              rows="5"
              required
              :disabled="contactSubmitting"
            ></textarea>
          </div>

          <p v-if="contactError" class="form-error">{{ contactError }}</p>

          <button type="submit" class="btn btn-primary" :disabled="contactSubmitting">
            {{ contactSubmitting ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>
    </section>

    <FooterSection />
  </div>
</template>

<style scoped>
.home {
  padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-8));
}

/* Hero */
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: var(--space-16) 0;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}

.hero-photo {
  aspect-ratio: 3/4;
  max-width: 400px;
  width: 100%;
  object-fit: cover;
  border-radius: var(--space-4);
}

.hero-image-placeholder {
  aspect-ratio: 3/4;
  max-width: 400px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subtle);
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero-name {
  display: flex;
  flex-direction: column;
  font-size: var(--text-6xl);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: var(--text-xl);
}

/* Loading skeletons */
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

/* About */
.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
}

.about-github {
  margin-top: var(--space-8);
}

.github-loading {
  margin-top: var(--space-8);
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.project-card {
  overflow: hidden;
}

.project-card.expanded {
  grid-column: 1 / -1;
}

.project-header {
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.project-thumbnail {
  aspect-ratio: 16/10;
  width: 100%;
  object-fit: cover;
  background-color: var(--color-border);
}

.project-thumbnail.placeholder {
  background-color: var(--color-surface);
}

.project-info {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.project-info h3 {
  font-size: var(--text-lg);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.tag {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: 500;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--space-1);
}

.project-expanded {
  padding: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.project-gallery {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding-bottom: var(--space-4);
}

.project-screenshot {
  max-height: 300px;
  border-radius: var(--space-2);
}

.project-description {
  margin: var(--space-4) 0;
}

.project-links {
  display: flex;
  gap: var(--space-3);
}

/* Blog */
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

/* Photos */
.photos-grid-loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.photo-item {
  overflow: hidden;
  border-radius: var(--space-2);
}

.photo-image {
  width: 100%;
  display: block;
  border-radius: var(--space-2);
}

.photo-placeholder {
  aspect-ratio: 4/3;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
}

.photo-expanded {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--space-2);
}

.photo-full {
  width: 100%;
  border-radius: var(--space-2);
}

.photo-info {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Contact */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-text);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.dark .form-group input:focus,
.dark .form-group textarea:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-error {
  color: #ef4444;
  font-size: var(--text-sm);
}

.contact-success {
  padding: var(--space-6);
  background-color: var(--color-surface);
  border-radius: var(--space-2);
  text-align: center;
}

/* Empty states */
.empty-state {
  padding: var(--space-12);
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .home {
    padding-top: calc(var(--navbar-height) + var(--navbar-top) + var(--space-4));
  }

  .hero-section {
    min-height: 70vh;
    padding: var(--space-8) 0;
  }

  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--space-8);
  }

  .hero-photo,
  .hero-image-placeholder {
    margin: 0 auto;
    max-width: 280px;
  }

  .hero-name {
    font-size: var(--text-5xl);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .project-expanded {
    padding: var(--space-4);
  }

  .project-links {
    flex-direction: column;
    gap: var(--space-2);
  }

  .project-links .btn {
    width: 100%;
  }

  .blog-item {
    padding: var(--space-3);
  }

  .photos-grid-loading {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .about-content {
    font-size: var(--text-base);
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 60vh;
  }

  .hero-name {
    font-size: var(--text-4xl);
  }

  .hero-photo,
  .hero-image-placeholder {
    max-width: 220px;
  }

  .photos-grid-loading {
    grid-template-columns: 1fr;
  }

  .photo-info h4 {
    font-size: var(--text-base);
  }

  .project-info h3 {
    font-size: var(--text-base);
  }

  .blog-title {
    font-size: var(--text-lg);
  }

  .contact-form {
    gap: var(--space-4);
  }
}
</style>
