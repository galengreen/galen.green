# AGENTS.md - Coding Agent Guidelines

Guidelines for AI coding agents working in this Vue 3 + TypeScript codebase.

## Project Overview

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 7.x
- **State Management**: Pinia 3.x
- **Routing**: Vue Router 4.x
- **Module System**: ES Modules (`"type": "module"`)
- **Node Version**: ^20.19.0 or >=22.12.0

## Build/Lint/Test Commands

```sh
# Development
npm run dev          # Start Vite dev server
npm run build        # Type-check and build for production
npm run type-check   # Run vue-tsc type checking

# Linting & Formatting
npm run lint         # ESLint with auto-fix and cache
npm run format       # Prettier format src/

# Unit Tests (Vitest)
npm run test:unit                                    # Run all unit tests
npm run test:unit -- src/components/__tests__/HelloWorld.spec.ts  # Single file
npm run test:unit -- --grep "pattern"               # Tests matching pattern

# E2E Tests (Playwright)
npm run test:e2e                        # Run all E2E tests
npm run test:e2e -- e2e/vue.spec.ts     # Single test file
npm run test:e2e -- --project=chromium  # Specific browser
```

## Directory Structure

```
src/
├── assets/           # CSS, images, static assets
├── components/       # Reusable Vue components
│   ├── __tests__/    # Unit tests (*.spec.ts)
│   └── icons/        # Icon components
├── router/           # Vue Router configuration
├── stores/           # Pinia stores
├── views/            # Page-level components
├── App.vue           # Root component
└── main.ts           # Entry point
e2e/                  # Playwright E2E tests
```

## Code Style Guidelines

### Formatting (Prettier)

- **No semicolons**, **single quotes**, **100 char width**, **2 space indent**, **LF endings**

### TypeScript

- Use strict TypeScript; define props with `defineProps<{ prop: Type }>()`
- Use `ref()` for reactive primitives, `computed()` for derived state
- Use the `@/` path alias for src imports (e.g., `@/components/Foo.vue`)

### Vue Components

- Use `<script setup lang="ts">` composition API syntax
- Order: `<script>`, `<template>`, `<style scoped>`
- Always use scoped styles unless intentionally global

```vue
<script setup lang="ts">
defineProps<{
  msg: string
  count?: number
}>()
</script>

<template>
  <!-- template content -->
</template>

<style scoped>
/* scoped styles */
</style>
```

### Naming Conventions

| Type        | Convention                  | Example              |
| ----------- | --------------------------- | -------------------- |
| Components  | PascalCase                  | `HelloWorld.vue`     |
| Views       | PascalCase + View suffix    | `HomeView.vue`       |
| Stores      | camelCase with `use` prefix | `useCounterStore`    |
| Unit tests  | `*.spec.ts` in `__tests__/` | `HelloWorld.spec.ts` |
| E2E tests   | `*.spec.ts` in `e2e/`       | `vue.spec.ts`        |
| Composables | camelCase with `use` prefix | `useFeature.ts`      |

### Imports

- Library imports first, then local imports
- Named exports for stores, default exports for router/main configs
- Use `@/` path alias for src imports; relative imports for nearby files

```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import HelloWorld from '@/components/HelloWorld.vue'
import HomeView from '../views/HomeView.vue'
```

### Pinia Stores

Use composition API style (setup stores). Export with `use` prefix.

```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  return { count, doubleCount, increment }
})
```

### Testing Patterns

#### Unit Tests (Vitest + Vue Test Utils)

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello' } })
    expect(wrapper.text()).toContain('Hello')
  })
})
```

#### E2E Tests (Playwright)

```ts
import { test, expect } from '@playwright/test'

test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('You did it!')
})
```

### Router

Lazy-load routes with dynamic imports. Use named routes.

```ts
{
  path: '/about',
  name: 'about',
  component: () => import('../views/AboutView.vue'),
}
```

### Error Handling

- Use try/catch for async operations
- Provide meaningful error messages
- Consider user-facing error states in components

## ESLint Configuration

- Vue essential + TypeScript recommended rules
- Vitest plugin for unit tests, Playwright plugin for E2E
- Prettier integration (skip formatting rules)

## Pre-commit Checklist

1. `npm run lint` - fix any linting errors
2. `npm run type-check` - ensure no TypeScript errors
3. `npm run test:unit` - all unit tests pass
4. `npm run build` - production build succeeds
