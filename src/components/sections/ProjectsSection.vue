<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/CustomCard.vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import ContentLightbox from '@/components/ui/ContentLightbox.vue'
import ProjectGallery from '@/components/ui/ProjectGallery.vue'
import RichText from '@/components/ui/RichText.vue'
import {
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
} from '@/composables/useMedia'
import { useDeepLink } from '@/composables/useDeepLink'
import type { Project } from '@/types'

const props = defineProps<{
  title: string
  projects: Project[]
  loading: boolean
  visible: boolean
}>()

const {
  selectedId: selectedProjectId,
  open: openProject,
  close: closeProject,
} = useDeepLink('projects', () => props.projects)

const selectedProject = computed(
  () => props.projects.find((p) => p.id === selectedProjectId.value) || null,
)
</script>

<template>
  <section id="projects" class="section fade-in" :class="{ visible }">
    <div class="container">
      <h2 class="section-title">{{ title }}</h2>

      <div v-if="loading" class="projects-grid">
        <Card v-for="i in 4" :key="i" padding="none" :opacity="80" :blur="12" class="project-card">
          <SkeletonBox :aspect-ratio="9 / 16" />
          <div class="project-info">
            <SkeletonText :lines="2" short-last />
          </div>
        </Card>
      </div>

      <div v-else-if="projects.length" class="projects-grid">
        <Card
          v-for="project in projects"
          :key="project.id"
          padding="none"
          :opacity="80"
          :blur="12"
          class="project-card"
        >
          <button class="project-link" @click="openProject(project.id)">
            <LazyImage
              v-if="project.images?.[0]?.image"
              :src="getImageUrl(project.images[0].image, 'md')"
              :srcset="getImageSrcset(project.images[0].image)"
              :srcset-avif="getImageSrcsetAvif(project.images[0].image)"
              :sizes="imageSizesPresets.card"
              :thumbnail-src="getImageUrl(project.images[0].image, 'xs')"
              :alt="project.title"
              :aspect-ratio="project.images[0].image.height / project.images[0].image.width"
              class="project-thumbnail"
            />
            <div v-else class="project-thumbnail placeholder"></div>
            <div class="project-info">
              <h3>{{ project.title }}</h3>
              <p>{{ project.excerpt }}</p>
              <div class="project-tags">
                <span v-for="tech in project.techStack" :key="tech.tech" class="tag">
                  {{ tech.tech }}
                </span>
              </div>
            </div>
          </button>
        </Card>
      </div>

      <EmptyState v-else message="Projects coming soon..." />

      <!-- Project Lightbox -->
      <ContentLightbox :open="!!selectedProject" @close="closeProject">
        <template v-if="selectedProject">
          <!-- Gallery -->
          <div v-if="selectedProject.images?.length" class="lightbox-gallery">
            <ProjectGallery
              :images="selectedProject.images"
              :project-title="selectedProject.title"
            />
          </div>

          <!-- Content -->
          <div class="lightbox-content">
            <div class="lightbox-header">
              <h2 class="lightbox-title">{{ selectedProject.title }}</h2>
              <div
                v-if="selectedProject.githubUrl || selectedProject.liveUrl"
                class="lightbox-links"
              >
                <a
                  v-if="selectedProject.githubUrl"
                  :href="selectedProject.githubUrl"
                  target="_blank"
                  rel="noopener"
                  class="lightbox-link"
                >
                  <FontAwesomeIcon :icon="['fab', 'github']" />
                  <span>GitHub</span>
                </a>
                <a
                  v-if="selectedProject.liveUrl"
                  :href="selectedProject.liveUrl"
                  target="_blank"
                  rel="noopener"
                  class="lightbox-link"
                >
                  <FontAwesomeIcon :icon="['fas', 'external-link']" />
                  <span>Live Site</span>
                </a>
              </div>
            </div>

            <div v-if="selectedProject.techStack?.length" class="lightbox-tags">
              <span v-for="tech in selectedProject.techStack" :key="tech.tech" class="tag">
                {{ tech.tech }}
              </span>
            </div>

            <div class="lightbox-description">
              <p v-if="selectedProject.excerpt" class="lightbox-excerpt">
                {{ selectedProject.excerpt }}
              </p>
              <RichText v-if="selectedProject.description" :content="selectedProject.description" />
            </div>
          </div>
        </template>
      </ContentLightbox>
    </div>
  </section>
</template>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.project-card {
  overflow: hidden;
}

.project-link {
  display: block;
  width: 100%;
  color: inherit;
  text-decoration: none;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.project-thumbnail {
  width: 100%;
  display: block;
  border-radius: 0;
}

.project-thumbnail.placeholder {
  aspect-ratio: 16/9;
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
  transition: color var(--duration-fast) var(--ease-out);
}

.project-link:hover .project-info h3 {
  color: var(--color-primary);
}

.project-tags,
.lightbox-tags {
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

/* Lightbox content styles */
.lightbox-gallery {
  width: 100%;
  padding: var(--space-3);
}

.lightbox-content {
  padding: var(--space-6);
}

.lightbox-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.lightbox-title {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
}

.lightbox-links {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.lightbox-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.lightbox-link:hover {
  background: var(--color-background);
  border-color: var(--color-text-muted);
}

.lightbox-tags {
  margin-bottom: var(--space-4);
}

.lightbox-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.lightbox-excerpt {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .lightbox-content {
    padding: var(--space-4);
  }

  .lightbox-title {
    font-size: var(--text-2xl);
  }

  .lightbox-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .project-info h3 {
    font-size: var(--text-base);
  }

  .lightbox-title {
    font-size: var(--text-xl);
  }
}
</style>
