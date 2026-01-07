<script setup lang="ts">
const currentYear = new Date().getFullYear()

const socials = [
  {
    name: 'GitHub',
    url: 'https://github.com/galengreen/',
    icon: 'github',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/galen-green-dev/',
    icon: 'linkedin',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/galengreen.space/',
    icon: 'instagram',
  },
  {
    name: 'Email',
    url: 'mailto:dev@galen.green',
    icon: 'email',
  },
]
</script>

<template>
  <footer class="footer">
    <div class="footer-content container">
      <div class="social-links">
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.url"
          :title="social.name"
          class="social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="social-icon" :data-icon="social.icon">
            <!-- Icons rendered via CSS or replaced with actual SVGs -->
            {{ social.name.charAt(0) }}
          </span>
          <span class="sr-only">{{ social.name }}</span>
        </a>
      </div>

      <p class="copyright text-subtle">{{ currentYear }} Galen Green. Built with Vue & Payload.</p>
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
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  transition: color var(--duration-fast) var(--ease-out);
}

.copyright {
  font-size: var(--text-sm);
}
</style>
