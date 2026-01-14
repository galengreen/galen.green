<script setup lang="ts">
import { ref, watch } from 'vue'
import ProjectGallery from '@/components/ui/ProjectGallery.vue'
import RichText from '@/components/ui/RichText.vue'
import {
  getImageUrl,
  getImageSrcset,
  getImageSrcsetAvif,
  imageSizesPresets,
} from '@/composables/useMedia'
import { useImagePreloader } from '@/composables/useImagePreloader'
import type { Project, Media } from '@/types'

const props = defineProps<{
  title: string
  projects: Project[]
  loading: boolean
  visible: boolean
}>()

const expandedProject = ref<string | null>(null)
const { prefetchMediaOnIdle } = useImagePreloader()

const toggleProject = (id: string) => {
  expandedProject.value = expandedProject.value === id ? null : id
}

// Prefetch all project gallery images when projects are loaded
watch(
  () => props.projects,
  (projects) => {
    if (projects.length > 0) {
      // Collect all gallery images from all projects
      const allGalleryImages: Media[] = []
      for (const project of projects) {
        if (project.images?.length) {
          for (const img of project.images) {
            if (img.image) {
              allGalleryImages.push(img.image)
            }
          }
        }
      }
      // Prefetch at 'lg' size (used in gallery main view)
      if (allGalleryImages.length > 0) {
        prefetchMediaOnIdle(allGalleryImages, 'lg')
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <section id="projects" class="section fade-in" :class="{ visible }">
    <div class="container">
      <h2 class="section-title">{{ title }}</h2>

      <div v-if="loading" class="projects-grid">
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
            <!-- Show thumbnail only when collapsed -->
            <template v-if="expandedProject !== project.id">
              <picture v-if="project.images?.[0]?.image">
                <source
                  :srcset="getImageSrcsetAvif(project.images[0].image)"
                  :sizes="imageSizesPresets.card"
                  type="image/avif"
                />
                <source
                  :srcset="getImageSrcset(project.images[0].image)"
                  :sizes="imageSizesPresets.card"
                  type="image/webp"
                />
                <img
                  :src="getImageUrl(project.images[0].image, 'md')"
                  :alt="project.title"
                  class="project-thumbnail"
                  loading="lazy"
                />
              </picture>
              <div v-else class="project-thumbnail placeholder"></div>
            </template>
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

          <div v-if="expandedProject === project.id" class="project-expanded">
            <div class="project-description">
              <RichText v-if="project.description" :content="project.description" />
              <p v-else class="text-muted">{{ project.excerpt }}</p>
            </div>

            <div class="project-links">
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener"
                class="btn btn-primary"
              >
                <FontAwesomeIcon :icon="['fas', 'external-link']" />
                View Live
              </a>
              <a
                v-if="project.githubUrl"
                :href="project.githubUrl"
                target="_blank"
                rel="noopener"
                class="btn btn-secondary"
              >
                <FontAwesomeIcon :icon="['fab', 'github']" />
                View Source
              </a>
            </div>

            <ProjectGallery
              v-if="project.images?.length"
              :images="project.images"
              :project-title="project.title"
            />
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="text-muted">Projects coming soon...</p>
      </div>
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

.project-card.expanded {
  grid-column: 1 / -1;
}

.project-header {
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.project-thumbnail {
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
  padding: 0 var(--space-5) var(--space-5);
}

.project-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.empty-state {
  padding: var(--space-12);
  text-align: center;
}

/* skeleton classes are defined globally in transitions.css */

@media (max-width: 768px) {
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
}

@media (max-width: 480px) {
  .project-info h3 {
    font-size: var(--text-base);
  }
}
</style>
