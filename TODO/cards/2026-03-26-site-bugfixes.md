# 2026-03-26 Site Bug Fixes

## Status

Review

## Goal

Fix the highest-impact bugs discovered during the site audit while preserving the current single-page UX.

## Scope

- Fix deep-link hash crashes for blog/project/photo overlays and preserve section scrolling
- Make homepage data and SEO hydration safer for prerendered output
- Improve lightbox accessibility with dialog semantics and focus management
- Harden rich text and GitHub stats rendering against malformed CMS data
- Preserve intentional dual-theme hero imagery so theme switching stays instant

## Component Map

- `src/main.ts` / `src/utils/scroll.ts`: router scroll behavior and hash parsing
- `src/App.vue` / `src/views/HomeView.vue`: app-level data loading, prerender-safe SEO defaults, and page composition
- `src/components/ui/BaseLightbox.vue` / `src/composables/useLightbox.ts`: overlay semantics, focus trap, and restore behavior
- `src/components/sections/HeroSection.vue`: intentional dual-theme hero asset rendering
- `src/components/ui/RichText.vue`: safe rich-text HTML rendering for CMS content
- `src/components/ui/GitHubGraph.vue`: resilient graph rendering with invalid CMS payloads

## Implementation Checklist

- [x] Add regression tests for deep-link hash handling and malformed CMS payloads
- [x] Add accessibility tests for dialog semantics and focus behavior
- [x] Fix hash scrolling so `#section/slug` deep links do not hit `querySelector`
- [x] Move homepage/app data loading to an immediate watcher path that works with Vite SSG setup
- [x] Add lightbox focus trapping, `role="dialog"`, `aria-modal`, and focus restoration
- [x] Preserve dual-mounted hero theme imagery and background preloads for fast theme switching
- [x] Sanitize rich-text links and escape URL attributes before `v-html`
- [x] Guard GitHub graph against non-array JSON payloads
- [x] Run lint, type-check, unit tests, e2e, and build

## Design Notes

- Keep the current hash-based single-page deep-link model instead of introducing new routes in this fix batch.
- Prefer minimal structural changes: targeted composable and utility fixes over a large routing rewrite.
- Preserve current UI composition and only add semantics/behavior where bugs were found.
- Keep both hero theme image variants mounted and preloaded; this is an intentional UX tradeoff so theme switching feels instant.

## Verification Notes

- `npm run lint` - passed
- `npm run type-check` - passed
- `npm run test:unit -- --run` - passed (63 tests)
- `CI=1 npm run test:e2e -- --project=chromium` - passed (87 tests)
- `npm run build` - passed with `vite-ssg build`; `dist/index.html` now contains prerendered content and serialized CMS state
- `npm run test:lighthouse` - still warns on performance, but score improved from 0.71 to 0.76; LCP warning remains around 3.03s median
