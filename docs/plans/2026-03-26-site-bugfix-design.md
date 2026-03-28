# Site Bug Fix Design - 2026-03-26

## Problem Statement

The site passes its current automated checks but still has several production-facing issues: deep-link hashes can throw runtime errors, the build does not emit meaningful prerendered content or SEO metadata, lightboxes are not accessible dialogs, hero media likely loads unnecessary assets, and some CMS-driven rendering paths assume perfect data.

## Approach

Use a focused hardening pass that keeps the current single-page architecture intact.

1. Normalize hash handling so scroll logic only targets section anchors and never sends overlay hashes into `querySelector`.
2. Move homepage and app-level CMS fetching into immediate setup-time watchers so Vite SSG can await the same data path used by the client.
3. Upgrade lightboxes to proper dialogs with semantics, focus trapping, and focus restoration.
4. Reduce hero work by only rendering and preloading assets for the active theme.
5. Sanitize CMS-driven HTML link attributes and validate JSON-backed GitHub graph data before rendering.

## Alternatives Considered

### 1. Keep hash routing and patch the bugs directly (recommended)

Pros:

- Minimal change surface
- Preserves existing UX and tests
- Fastest path to production stability

Cons:

- Blog/project entries remain overlay deep links, not standalone crawlable pages

### 2. Convert overlays to real routes

Pros:

- Better SEO model for individual content
- Cleaner routing semantics

Cons:

- Much larger refactor touching navigation, analytics, tests, and page structure
- Higher regression risk than needed for this bug-fix pass

## Planned Test Coverage

- Unit tests for hash parsing and CMS data guards
- Unit tests for rich-text link sanitization
- Component/unit tests for dialog semantics and focus management where feasible
- Existing build, lint, unit, and Chromium E2E coverage as regression checks

## Success Criteria

- Overlay deep links no longer trigger selector errors
- Home page data path is safe for prerendered output and emits stable SEO defaults
- Lightboxes behave like accessible dialogs
- Hero loading no longer eagerly fetches both theme variants
- Malformed CMS links or GitHub graph payloads do not break rendering
