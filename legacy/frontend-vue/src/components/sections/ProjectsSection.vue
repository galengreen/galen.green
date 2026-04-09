<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/sections/SectionShell.vue'
import Card from '@/components/ui/CustomCard.vue'
import ResponsiveImage from '@/components/ui/ResponsiveImage.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import ContentLightbox from '@/components/ui/ContentLightbox.vue'
import LightboxContent from '@/components/ui/LightboxContent.vue'
import ProjectGallery from '@/components/ui/ProjectGallery.vue'
import RichText from '@/components/ui/RichText.vue'
import { useDeepLink } from '@/composables/useDeepLink'
import type { Project } from '@/types'

const props = defineProps<{
  title: string
  projects: Project[]
  loading: boolean
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
  <SectionShell id="projects" :title="title">
    <div v-if="loading" class="grid gap-4 md:grid-cols-2 md:gap-6">
      <Card v-for="i in 4" :key="i" padding="none" :opacity="80" :blur="12" class="project-card">
        <SkeletonBox :aspect-ratio="9 / 16" />
        <div class="flex flex-col gap-2 p-5">
          <SkeletonText :lines="2" short-last />
        </div>
      </Card>
    </div>

    <div v-else-if="projects.length" class="grid gap-4 md:grid-cols-2 md:gap-6">
      <Card
        v-for="project in projects"
        :key="project.id"
        padding="none"
        :opacity="80"
        :blur="12"
        class="overflow-hidden"
      >
        <button class="group block w-full text-left text-inherit" @click="openProject(project.id)">
          <ResponsiveImage
            v-if="project.images?.[0]?.image"
            :media="project.images[0].image"
            :alt="project.title"
            size="md"
            sizes-preset="card"
            thumbnail-size="xs"
            class="block w-full"
          />
          <div v-else class="aspect-video bg-surface"></div>
          <div class="flex flex-col gap-2 p-5">
            <h3
              class="text-base font-semibold tracking-tight text-text transition group-hover:text-accent md:text-lg"
            >
              {{ project.title }}
            </h3>
            <p class="text-sm leading-6 text-muted md:text-base">{{ project.excerpt }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tech in project.techStack"
                :key="tech.tech"
                class="rounded-md border border-border bg-bg px-2 py-1 text-xs font-medium text-muted"
              >
                {{ tech.tech }}
              </span>
            </div>
          </div>
        </button>
      </Card>
    </div>

    <EmptyState v-else message="Projects coming soon..." />

    <!-- Project Lightbox -->
    <ContentLightbox
      :open="!!selectedProject"
      :title="selectedProject?.title"
      @close="closeProject"
    >
      <template v-if="selectedProject">
        <!-- Gallery -->
        <div v-if="selectedProject.images?.length" class="w-full p-3">
          <ProjectGallery :images="selectedProject.images" :project-title="selectedProject.title" />
        </div>

        <!-- Content -->
        <LightboxContent>
          <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
            <h2 class="text-2xl font-semibold tracking-tight text-text md:text-3xl">
              {{ selectedProject.title }}
            </h2>
            <div v-if="selectedProject.githubUrl || selectedProject.liveUrl" class="flex gap-3">
              <a
                v-if="selectedProject.githubUrl"
                :href="selectedProject.githubUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text transition hover:border-muted hover:bg-bg"
              >
                <FontAwesomeIcon :icon="['fab', 'github']" />
                <span>GitHub</span>
              </a>
              <a
                v-if="selectedProject.liveUrl"
                :href="selectedProject.liveUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text transition hover:border-muted hover:bg-bg"
              >
                <FontAwesomeIcon :icon="['fas', 'external-link']" />
                <span>Live Site</span>
              </a>
            </div>
          </div>

          <div v-if="selectedProject.techStack?.length" class="mb-4 flex flex-wrap gap-2">
            <span
              v-for="tech in selectedProject.techStack"
              :key="tech.tech"
              class="rounded-md border border-border bg-bg px-2 py-1 text-xs font-medium text-muted"
            >
              {{ tech.tech }}
            </span>
          </div>

          <div class="text-base leading-7 text-text">
            <p v-if="selectedProject.excerpt" class="mb-4 text-lg text-muted">
              {{ selectedProject.excerpt }}
            </p>
            <RichText v-if="selectedProject.description" :content="selectedProject.description" />
          </div>
        </LightboxContent>
      </template>
    </ContentLightbox>
  </SectionShell>
</template>
