<script setup lang="ts">
import { computed } from 'vue'
import ContentContainer from '@/components/layout/ContentContainer.vue'
import type { SocialLink } from '@/types'

const props = defineProps<{
  name?: { first: string; last: string }
  socials?: SocialLink[]
}>()

const currentYear = new Date().getFullYear()

// Map platform to Font Awesome icon
const platformIcons: Record<string, string[]> = {
  github: ['fab', 'github'],
  linkedin: ['fab', 'linkedin'],
  instagram: ['fab', 'instagram'],
  twitter: ['fab', 'x-twitter'],
  youtube: ['fab', 'youtube'],
  email: ['fas', 'envelope'],
}

const socialLinks = computed(() => {
  if (!props.socials?.length) return []
  return props.socials.map((social) => ({
    name: social.platform.charAt(0).toUpperCase() + social.platform.slice(1),
    url: social.url,
    icon: platformIcons[social.platform] || ['fas', 'link'],
  }))
})

const fullName = computed(() => {
  if (props.name?.first || props.name?.last) {
    return `${props.name.first || ''} ${props.name.last || ''}`.trim()
  }
  return ''
})
</script>

<template>
  <footer class="py-8 text-center md:py-12">
    <ContentContainer class="flex flex-col items-center gap-6">
      <div v-if="socialLinks.length" class="flex items-center gap-4">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.url"
          :title="social.name"
          class="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition hover:-translate-y-0.5 hover:border-text hover:bg-text"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            :icon="social.icon"
            class="text-lg text-muted transition group-hover:text-bg"
          />
          <span class="sr-only">{{ social.name }}</span>
        </a>
      </div>

      <p v-if="fullName" class="text-sm text-muted">{{ fullName }} {{ currentYear }}</p>
      <p v-else class="text-sm text-muted">{{ currentYear }}</p>
    </ContentContainer>
  </footer>
</template>
