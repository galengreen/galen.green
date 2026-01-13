<script setup lang="ts">
import { computed } from 'vue'

// Payload Lexical rich text structure
interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number
  tag?: string
  listType?: string
  url?: string
  newTab?: boolean
  value?: {
    url?: string
    alt?: string
  }
}

interface LexicalRoot {
  root: {
    children: LexicalNode[]
  }
}

const props = defineProps<{
  content: LexicalRoot | unknown
}>()

// Convert URL to relative path for proxying
const getMediaUrl = (url: string) => {
  if (!url) return ''
  // Strip domain to make it relative for proxying
  try {
    const parsed = new URL(url, 'http://localhost')
    return parsed.pathname
  } catch {
    return url
  }
}

// Convert Lexical format bitmask to classes
const getFormatClasses = (format: number): string[] => {
  const classes: string[] = []
  if (format & 1) classes.push('bold')
  if (format & 2) classes.push('italic')
  if (format & 4) classes.push('strikethrough')
  if (format & 8) classes.push('underline')
  if (format & 16) classes.push('code')
  return classes
}

// Recursively render nodes to HTML
const renderNode = (node: LexicalNode): string => {
  if (node.type === 'text') {
    let text = node.text || ''
    // Escape HTML
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    if (node.format) {
      const classes = getFormatClasses(node.format)
      if (classes.includes('bold')) text = `<strong>${text}</strong>`
      if (classes.includes('italic')) text = `<em>${text}</em>`
      if (classes.includes('strikethrough')) text = `<s>${text}</s>`
      if (classes.includes('underline')) text = `<u>${text}</u>`
      if (classes.includes('code')) text = `<code>${text}</code>`
    }
    return text
  }

  const children = node.children?.map(renderNode).join('') || ''

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading': {
      const headingTag = node.tag || 'h2'
      return `<${headingTag}>${children}</${headingTag}>`
    }
    case 'list': {
      const listTag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${listTag}>${children}</${listTag}>`
    }
    case 'listitem':
      return `<li>${children}</li>`
    case 'link': {
      const target = node.newTab ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${node.url}"${target}>${children}</a>`
    }
    case 'quote':
      return `<blockquote>${children}</blockquote>`
    case 'upload': {
      if (node.value?.url) {
        const url = getMediaUrl(node.value.url)
        const alt = node.value.alt || ''
        return `<figure><img src="${url}" alt="${alt}" loading="lazy" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
      }
      return ''
    }
    case 'horizontalrule':
      return '<hr />'
    default:
      return children
  }
}

const renderedHtml = computed(() => {
  const lexical = props.content as LexicalRoot
  if (!lexical?.root?.children) return ''

  return lexical.root.children.map(renderNode).join('')
})
</script>

<template>
  <div class="rich-text" v-html="renderedHtml"></div>
</template>

<style scoped>
.rich-text :deep(p) {
  margin-bottom: var(--space-5);
}

.rich-text :deep(h1) {
  font-size: var(--text-4xl);
  margin-top: var(--space-12);
  margin-bottom: var(--space-4);
}

.rich-text :deep(h2) {
  font-size: var(--text-2xl);
  margin-top: var(--space-10);
  margin-bottom: var(--space-4);
}

.rich-text :deep(h3) {
  font-size: var(--text-xl);
  margin-top: var(--space-8);
  margin-bottom: var(--space-3);
}

.rich-text :deep(h4) {
  font-size: var(--text-lg);
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
}

.rich-text :deep(ul),
.rich-text :deep(ol) {
  margin-bottom: var(--space-5);
  padding-left: var(--space-6);
}

.rich-text :deep(ul) {
  list-style-type: disc;
}

.rich-text :deep(ol) {
  list-style-type: decimal;
}

.rich-text :deep(li) {
  margin-bottom: var(--space-2);
}

.rich-text :deep(blockquote) {
  margin: var(--space-6) 0;
  padding: var(--space-4) var(--space-6);
  border-left: 4px solid var(--color-border);
  background-color: var(--color-surface);
  font-style: italic;
}

.rich-text :deep(a) {
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.rich-text :deep(a:hover) {
  opacity: 0.7;
}

.rich-text :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background-color: var(--color-surface);
  border-radius: var(--space-1);
}

.rich-text :deep(pre) {
  margin: var(--space-6) 0;
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--space-2);
  overflow-x: auto;
}

.rich-text :deep(pre code) {
  padding: 0;
  background: none;
}

.rich-text :deep(figure) {
  margin: var(--space-8) 0;
}

.rich-text :deep(figure img) {
  width: 100%;
  border-radius: var(--space-2);
}

.rich-text :deep(figcaption) {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.rich-text :deep(hr) {
  margin: var(--space-10) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.rich-text :deep(strong) {
  font-weight: 600;
}
</style>
