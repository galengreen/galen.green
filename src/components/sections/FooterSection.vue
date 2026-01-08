<script setup lang="ts">
import { computed } from 'vue'
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
  <footer class="footer">
    <div class="footer-content container">
      <div v-if="socialLinks.length" class="social-links">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.url"
          :title="social.name"
          class="social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon :icon="social.icon" class="social-icon" />
          <span class="sr-only">{{ social.name }}</span>
        </a>
      </div>

      <p v-if="fullName" class="copyright text-subtle">{{ fullName }} {{ currentYear }}</p>
      <p v-else class="copyright text-subtle">{{ currentYear }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--space-12) 0 var(--space-8);
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.social-links {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  transition:
    transform var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.social-link:hover {
  transform: scale(1.1);
  background-color: var(--color-text);
  border-color: var(--color-text);
}

.social-link:hover .social-icon {
  color: var(--color-background);
}

.social-icon {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  transition: color var(--duration-fast) var(--ease-out);
}

.copyright {
  font-size: var(--text-sm);
}
</style>
