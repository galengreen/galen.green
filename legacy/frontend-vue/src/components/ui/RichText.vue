<script setup lang="ts">
import { computed } from 'vue'
import type { Media } from '@/types'
import { getImageUrl, getImageSrcset, getImageSrcsetAvif } from '@/composables/useMedia'

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
  value?: Media
}

interface LexicalRoot {
  root: {
    children: LexicalNode[]
  }
}

const props = defineProps<{
  content: LexicalRoot | unknown
}>()

// Escape string for use in HTML attributes
const escapeAttr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const sanitizeUrl = (url?: string): string => {
  if (!url) return '#'

  const trimmedUrl = url.trim()
  const normalizedProtocol = trimmedUrl.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase()

  if (
    normalizedProtocol.startsWith('javascript:') ||
    normalizedProtocol.startsWith('vbscript:') ||
    normalizedProtocol.startsWith('data:')
  ) {
    return '#'
  }

  return escapeAttr(trimmedUrl)
}

// Build responsive picture element HTML string
const buildPictureElement = (media: Media, alt: string): string => {
  const src = getImageUrl(media, 'lg')
  const srcsetAvif = getImageSrcsetAvif(media)
  const srcsetWebp = getImageSrcset(media)
  const sizes = '(max-width: 720px) 100vw, 720px' // matches container width
  const safeAlt = escapeAttr(alt)

  let pictureHtml = '<picture>'

  if (srcsetAvif) {
    pictureHtml += `<source srcset="${srcsetAvif}" sizes="${sizes}" type="image/avif" />`
  }
  if (srcsetWebp) {
    pictureHtml += `<source srcset="${srcsetWebp}" sizes="${sizes}" type="image/webp" />`
  }

  pictureHtml += `<img src="${src}" alt="${safeAlt}" loading="lazy" />`
  pictureHtml += '</picture>'

  return pictureHtml
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
      const safeUrl = sanitizeUrl(node.url)
      return `<a href="${safeUrl}"${target}>${children}</a>`
    }
    case 'quote':
      return `<blockquote>${children}</blockquote>`
    case 'upload': {
      if (node.value?.url) {
        const media = node.value
        const alt = media.alt || ''
        const pictureHtml = buildPictureElement(media, alt)
        return `<figure>${pictureHtml}${alt ? `<figcaption>${escapeAttr(alt)}</figcaption>` : ''}</figure>`
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
  <div
    class="rich-text prose max-w-none text-text prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-text prose-p:text-inherit prose-a:text-text prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-70 prose-strong:text-text prose-code:rounded-md prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-pre:rounded-2xl prose-pre:bg-surface prose-pre:p-4 prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:bg-surface prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:italic prose-figcaption:text-muted prose-hr:border-border sm:prose-lg dark:prose-invert dark:prose-headings:text-text dark:prose-a:text-text dark:prose-strong:text-text"
    v-html="renderedHtml"
  ></div>
</template>

<style scoped>
.rich-text :deep(code)::before,
.rich-text :deep(code)::after {
  content: '';
}

.rich-text :deep(figure img) {
  width: 100%;
  border-radius: 1rem;
}
</style>
