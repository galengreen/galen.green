<script setup lang="ts">
import { ref, watch } from 'vue'
import Card from '@/components/ui/Card.vue'
import ProjectGallery from '@/components/ui/ProjectGallery.vue'
import RichText from '@/components/ui/RichText.vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
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
          :class="{ expanded: expandedProject === project.id }"
        >
          <button class="project-header" @click="toggleProject(project.id)">
            <!-- Show thumbnail only when collapsed -->
            <template v-if="expandedProject !== project.id">
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
        </Card>
      </div>

      <EmptyState v-else message="Projects coming soon..." />
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
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  padding: 0;
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
