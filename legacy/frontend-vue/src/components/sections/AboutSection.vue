<script setup lang="ts">
import SectionShell from '@/components/sections/SectionShell.vue'
import Card from '@/components/ui/CustomCard.vue'
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
}>()
</script>

<template>
  <SectionShell id="about" :title="title" container="narrow">
    <Card padding="lg" :opacity="80" :blur="12" class="about-card">
      <div v-if="loadingAbout">
        <SkeletonText :lines="3" short-last />
      </div>
      <div v-else-if="about?.content" class="text-base leading-7 md:text-lg md:leading-8">
        <RichText :content="about.content" />
      </div>
    </Card>

    <!-- GitHub Activity -->
    <div v-if="loadingGithub" class="mt-8">
      <SkeletonBox height="200px" rounded="lg" />
    </div>
    <GitHubGraph
      v-else-if="githubStats?.contributionGraph"
      :contribution-graph="githubStats.contributionGraph"
      :total-contributions="githubStats.totalContributions"
      :current-streak="githubStats.currentStreak"
      :longest-streak="githubStats.longestStreak"
      class="mt-8"
    />
  </SectionShell>
</template>
