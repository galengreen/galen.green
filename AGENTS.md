# AGENTS.md - Coding Agent Guidelines

Guidelines for AI coding agents working in this Vue 3 + Payload CMS codebase.

## Project Overview

- **Frontend**: Vue 3 with Composition API, TypeScript (strict mode), Vite 7.x
- **CMS**: Payload CMS 3.x (Next.js 15.x)
- **Database**: MongoDB
- **UI Library**: PrimeVue 4.x
- **State Management**: Composables (no Pinia stores currently)
- **Routing**: Vue Router 4.x
- **Module System**: ES Modules (`"type": "module"`)
- **Node Version**: ^20.19.0 or >=22.12.0

## Directory Structure

```
src/
├── components/   # Vue components (__tests__/, icons/, layout/, sections/, ui/)
├── composables/  # Vue composables (useTheme, useMedia, useMasonry)
├── router/       # Vue Router config
└── views/        # Page-level components
cms/src/
├── collections/  # Payload collections (BlogPosts, Projects, Photos)
└── globals/      # Payload globals (SiteSettings, About, GitHubStats)
```

## Build/Lint/Test Commands

```sh
# Frontend (root)
npm run dev          # Start Vite dev server
npm run build        # Type-check and build for production
npm run type-check   # Run vue-tsc type checking
npm run lint         # ESLint with auto-fix and cache
npm run format       # Prettier format src/
npm run test:unit                                    # Run all unit tests
npm run test:unit -- src/components/__tests__/HelloWorld.spec.ts  # Single file
npm run test:unit -- --grep "pattern"               # Tests matching pattern

# CMS (cms directory)
cd cms && npm run dev              # Start Payload CMS dev server
npm run build            # Build for production
npm run start            # Start production server
npm run generate:types   # Generate Payload TypeScript types

# E2E Tests (root)
npm run test:e2e                        # Run all E2E tests
npm run test:e2e -- e2e/vue.spec.ts     # Single test file
npm run test:e2e -- --project=chromium  # Specific browser
```

## Code Style Guidelines

### Formatting (Prettier)

- **No semicolons**, **single quotes**, **100 char width**, **2 space indent**

### TypeScript & Vue Components

- Use `<script setup lang="ts">` with composition API
- Define props with `defineProps<{ prop: Type }>()`
- Use `ref()` for reactive primitives, `computed()` for derived state
- Order: `<script>`, `<template>`, `<style scoped>`
- Always use scoped styles unless intentionally global
- Use the `@/` path alias for src imports

### Naming Conventions

| Type        | Convention                  | Example            |
| ----------- | --------------------------- | ------------------ |
| Components  | PascalCase                  | `RichText.vue`     |
| Views       | PascalCase + View suffix    | `BlogPostView.vue` |
| Composables | camelCase with `use` prefix | `useTheme.ts`      |
| Unit tests  | `*.spec.ts` in `__tests__/` | `RichText.spec.ts` |
| E2E tests   | `*.spec.ts` in `e2e/`       | `vue.spec.ts`      |
| Collections | PascalCase                  | `BlogPosts.ts`     |

### Imports

- Library imports first, then local imports
- Use `@/` path alias for src imports; relative imports for nearby files
- In composables, export named functions and state

```ts
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import RichText from '@/components/ui/RichText.vue'
```

### Vue Composables

Use composition API style with reactive refs at module level, export function returning state/actions.

### Payload CMS Collections

Export `CollectionConfig` with PascalCase naming. Include labels, admin config, access control, and fields.

### Router

Lazy-load routes with dynamic imports. Use named routes.

### Testing

#### Unit Tests (Vitest + Vue Test Utils)

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from '../RichText.vue'

describe('RichText', () => {
  it('renders content', () => {
    const wrapper = mount(RichText, { props: { content: mockData } })
    expect(wrapper.html()).toContain('<p>')
  })
})
```

#### E2E Tests (Playwright)

```ts
import { test, expect } from '@playwright/test'

test('navigates to blog post', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Blog')
  await expect(page).toHaveURL(/#blog/)
})
```

### Error Handling

- Use try/catch for async operations
- Provide meaningful error messages
- Consider user-facing error states in components

## Pre-commit Checklist

1. `npm run lint` - fix any linting errors
2. `npm run type-check` - ensure no TypeScript errors
3. `npm run test:unit` - all unit tests pass
4. `npm run build` - production build succeeds
