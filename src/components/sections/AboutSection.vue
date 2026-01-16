<script setup lang="ts">
import GitHubGraph from '@/components/ui/GitHubGraph.vue'
import RichText from '@/components/ui/RichText.vue'
import SkeletonText from '@/components/ui/SkeletonText.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import type { About, GitHubStats } from '@/types'

defineProps<{
  title: string
  about: About | null
  githubStats: GitHubStats | null
  loadingAbout: boolean
  loadingGithub: boolean
  visible: boolean
}>()
</script>

<template>
  <section id="about" class="section fade-in" :class="{ visible }">
    <div class="container container-narrow">
      <h2 class="section-title">{{ title }}</h2>

      <div class="about-card card">
        <div v-if="loadingAbout">
          <SkeletonText :lines="3" short-last />
        </div>
        <div v-else-if="about?.content" class="about-content">
          <RichText :content="about.content" />
        </div>
      </div>

      <!-- GitHub Activity -->
      <div v-if="loadingGithub" class="github-loading">
        <SkeletonBox height="200px" rounded="lg" />
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
</template>

<style scoped>
.about-card {
  padding: var(--space-6);
}

.about-content {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
}

.about-github {
  margin-top: var(--space-8);
}

.github-loading {
  margin-top: var(--space-8);
}

/* skeleton classes are defined globally in transitions.css */

@media (max-width: 768px) {
  .about-content {
    font-size: var(--text-base);
  }
}
</style>
